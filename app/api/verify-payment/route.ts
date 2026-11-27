import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  SPONSORSHIP_TIERS_INR,
  hasMockIdentifier,
  isMockPaymentsEnabled,
  verifyPaymentWithRazorpayApi,
  verifyRazorpaySignature,
} from "@/lib/payment";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, readBoundedJson } from "@/lib/security";
import { verifyPaymentSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json(
        { success: false, verified: false, error: "Invalid request origin" },
        { status: 403 }
      );
    }

    const ip = getClientIp(request);
    const rate = await checkDistributedRateLimit(`verify-payment:${ip}`, 30, 15 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, verified: false, error: "Too many verification attempts." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const bodyResult = await readBoundedJson(request, 16 * 1024);
    if (!bodyResult.ok) {
      return NextResponse.json(
        { success: false, verified: false, error: bodyResult.error },
        { status: bodyResult.status }
      );
    }

    const parsed = verifyPaymentSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: parsed.error.issues[0]?.message || "Invalid verification payload",
        },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId,
      sponsorshipId,
    } = parsed.data;

    const usesMock =
      hasMockIdentifier(razorpay_order_id) ||
      hasMockIdentifier(razorpay_payment_id) ||
      hasMockIdentifier(razorpay_signature);

    if (usesMock && !isMockPaymentsEnabled()) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Demo payment identifiers are disabled on this environment",
        },
        { status: 403 }
      );
    }

    // 1. Validate HMAC cryptographic signature first (before DB mutations)
    if (!usesMock) {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const keyId = process.env.RAZORPAY_KEY_ID;
      if (!secret || !keyId) {
        return NextResponse.json(
          {
            success: false,
            verified: false,
            error: "Payment verification credentials are not configured",
          },
          { status: 503 }
        );
      }

      const isAuthentic = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        secret
      );

      if (!isAuthentic) {
        // Only mark Failed if the exact bound order matches (never mutate unrelated records)
        if (donationId) {
          await prisma.donation.updateMany({
            where: {
              id: donationId,
              razorpayOrderId: razorpay_order_id,
              paymentStatus: { not: "Completed" },
            },
            data: { paymentStatus: "Failed", failureReason: "Invalid payment signature" },
          });
        } else if (sponsorshipId) {
          await prisma.sponsorship.updateMany({
            where: {
              id: sponsorshipId,
              razorpayOrderId: razorpay_order_id,
              paymentStatus: { not: "Completed" },
            },
            data: { paymentStatus: "Failed" },
          });
        }

        return NextResponse.json(
          { success: false, verified: false, error: "Invalid payment signature" },
          { status: 400 }
        );
      }
    }

    // 2. Load target record and enforce strict server-bound razorpayOrderId matching
    let expectedAmountInr = 0;
    if (donationId) {
      const donation = await prisma.donation.findUnique({ where: { id: donationId } });
      if (!donation) {
        return NextResponse.json(
          { success: false, verified: false, error: "Donation record not found" },
          { status: 404 }
        );
      }
      if (!donation.razorpayOrderId || donation.razorpayOrderId !== razorpay_order_id) {
        return NextResponse.json(
          {
            success: false,
            verified: false,
            error: "Order ID does not match or order was not initiated on this server",
          },
          { status: 400 }
        );
      }
      if (donation.paymentStatus === "Completed") {
        if (donation.razorpayPaymentId === razorpay_payment_id) {
          return NextResponse.json({
            success: true,
            verified: true,
            alreadyCompleted: true,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
          });
        }
        return NextResponse.json(
          {
            success: false,
            verified: false,
            error: "Donation is already completed with another payment",
          },
          { status: 409 }
        );
      }
      expectedAmountInr = Number(donation.amount);
    } else if (sponsorshipId) {
      const sponsorship = await prisma.sponsorship.findUnique({ where: { id: sponsorshipId } });
      if (!sponsorship) {
        return NextResponse.json(
          { success: false, verified: false, error: "Sponsorship record not found" },
          { status: 404 }
        );
      }
      if (!sponsorship.razorpayOrderId || sponsorship.razorpayOrderId !== razorpay_order_id) {
        return NextResponse.json(
          {
            success: false,
            verified: false,
            error: "Order ID does not match or order was not initiated on this server",
          },
          { status: 400 }
        );
      }
      if (sponsorship.paymentStatus === "Completed") {
        if (sponsorship.razorpayPaymentId === razorpay_payment_id) {
          return NextResponse.json({
            success: true,
            verified: true,
            alreadyCompleted: true,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
          });
        }
        return NextResponse.json(
          {
            success: false,
            verified: false,
            error: "Sponsorship is already completed with another payment",
          },
          { status: 409 }
        );
      }
      expectedAmountInr = SPONSORSHIP_TIERS_INR[sponsorship.tier] ?? Number(sponsorship.amount);
    }

    // 3. Independently verify captured status, order_id, currency, and INR amount with Razorpay API
    if (!usesMock) {
      const apiCheck = await verifyPaymentWithRazorpayApi({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        expectedAmountInr,
        keyId: process.env.RAZORPAY_KEY_ID!,
        keySecret: process.env.RAZORPAY_KEY_SECRET!,
      });

      if (!apiCheck.ok) {
        if (apiCheck.gatewayFailed) {
          if (donationId) {
            await prisma.donation.updateMany({
              where: {
                id: donationId,
                razorpayOrderId: razorpay_order_id,
                paymentStatus: { not: "Completed" },
              },
              data: { paymentStatus: "Failed", failureReason: apiCheck.error },
            });
          } else if (sponsorshipId) {
            await prisma.sponsorship.updateMany({
              where: {
                id: sponsorshipId,
                razorpayOrderId: razorpay_order_id,
                paymentStatus: { not: "Completed" },
              },
              data: { paymentStatus: "Failed" },
            });
          }
        }

        return NextResponse.json(
          { success: false, verified: false, error: apiCheck.error },
          { status: apiCheck.status }
        );
      }
    }

    // 4. Atomically finalize payment inside DB transaction with cross-table replay check
    const txResult = await prisma.$transaction(async (tx) => {
      const [existingDonationPayment, existingSponsorshipPayment] = await Promise.all([
        tx.donation.findUnique({ where: { razorpayPaymentId: razorpay_payment_id } }),
        tx.sponsorship.findUnique({ where: { razorpayPaymentId: razorpay_payment_id } }),
      ]);

      if (donationId) {
        const donation = await tx.donation.findUnique({ where: { id: donationId } });
        if (!donation) {
          return { status: 404 as const, error: "Donation record not found" };
        }
        if (!donation.razorpayOrderId || donation.razorpayOrderId !== razorpay_order_id) {
          return { status: 400 as const, error: "Order ID does not match donation record" };
        }
        if (donation.paymentStatus === "Completed") {
          if (donation.razorpayPaymentId === razorpay_payment_id) {
            return { status: 200 as const, alreadyCompleted: true };
          }
          return {
            status: 409 as const,
            error: "Donation is already completed with another payment",
          };
        }
        if (
          (existingDonationPayment && existingDonationPayment.id !== donation.id) ||
          existingSponsorshipPayment
        ) {
          return { status: 409 as const, error: "Duplicate payment ID detected" };
        }

        await tx.donation.update({
          where: { id: donation.id, paymentStatus: { not: "Completed" } },
          data: {
            paymentStatus: "Completed",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            verifiedAt: new Date(),
          },
        });
      } else if (sponsorshipId) {
        const sponsorship = await tx.sponsorship.findUnique({ where: { id: sponsorshipId } });
        if (!sponsorship) {
          return { status: 404 as const, error: "Sponsorship record not found" };
        }
        if (!sponsorship.razorpayOrderId || sponsorship.razorpayOrderId !== razorpay_order_id) {
          return { status: 400 as const, error: "Order ID does not match sponsorship record" };
        }
        if (sponsorship.paymentStatus === "Completed") {
          if (sponsorship.razorpayPaymentId === razorpay_payment_id) {
            return { status: 200 as const, alreadyCompleted: true };
          }
          return {
            status: 409 as const,
            error: "Sponsorship is already completed with another payment",
          };
        }
        if (
          (existingSponsorshipPayment && existingSponsorshipPayment.id !== sponsorship.id) ||
          existingDonationPayment
        ) {
          return { status: 409 as const, error: "Duplicate payment ID detected" };
        }

        await tx.sponsorship.update({
          where: { id: sponsorship.id, paymentStatus: { not: "Completed" } },
          data: {
            paymentStatus: "Completed",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            verifiedAt: new Date(),
          },
        });
      }

      return { status: 200 as const, alreadyCompleted: false };
    });

    if (txResult.status !== 200) {
      return NextResponse.json(
        { success: false, verified: false, error: txResult.error },
        { status: txResult.status }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      alreadyCompleted: Boolean(txResult.alreadyCompleted),
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, verified: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
