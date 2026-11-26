import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  hasMockIdentifier,
  isMockPaymentsEnabled,
  verifyRazorpaySignature,
} from "@/lib/payment";
import { checkRateLimit } from "@/lib/rate-limit";
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
    const rate = checkRateLimit(`verify-payment:${ip}`, 30, 15 * 60_000);
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

    if (!donationId && !sponsorshipId) {
      return NextResponse.json(
        { success: false, verified: false, error: "Missing donationId or sponsorshipId" },
        { status: 400 }
      );
    }

    const usesMock =
      hasMockIdentifier(razorpay_order_id) ||
      hasMockIdentifier(razorpay_payment_id) ||
      hasMockIdentifier(razorpay_signature);

    if (usesMock) {
      if (!isMockPaymentsEnabled()) {
        return NextResponse.json(
          {
            success: false,
            verified: false,
            error: "Demo payment identifiers are disabled on this environment",
          },
          { status: 403 }
        );
      }
    } else {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return NextResponse.json(
          {
            success: false,
            verified: false,
            error: "Payment verification secret is not configured",
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
        await prisma.$transaction(async (tx) => {
          if (donationId) {
            await tx.donation.updateMany({
              where: {
                id: donationId,
                paymentStatus: { not: "Completed" },
                OR: [{ razorpayOrderId: null }, { razorpayOrderId: razorpay_order_id }],
              },
              data: { paymentStatus: "Failed" },
            });
          }
          if (sponsorshipId) {
            await tx.sponsorship.updateMany({
              where: {
                id: sponsorshipId,
                paymentStatus: { not: "Completed" },
                OR: [{ razorpayOrderId: null }, { razorpayOrderId: razorpay_order_id }],
              },
              data: { paymentStatus: "Failed" },
            });
          }
        });

        return NextResponse.json(
          { success: false, verified: false, error: "Invalid payment signature" },
          { status: 400 }
        );
      }
    }

    const txResult = await prisma.$transaction(async (tx) => {
      if (donationId) {
        const donation = await tx.donation.findUnique({ where: { id: donationId } });
        if (!donation) {
          return { status: 404 as const, error: "Donation record not found" };
        }
        if (donation.razorpayOrderId && donation.razorpayOrderId !== razorpay_order_id) {
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

        const existingPayment = await tx.donation.findUnique({
          where: { razorpayPaymentId: razorpay_payment_id },
        });
        if (existingPayment && existingPayment.id !== donation.id) {
          return { status: 409 as const, error: "Duplicate payment ID detected" };
        }

        await tx.donation.update({
          where: { id: donation.id },
          data: {
            paymentStatus: "Completed",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
          },
        });
      }

      if (sponsorshipId) {
        const sponsorship = await tx.sponsorship.findUnique({ where: { id: sponsorshipId } });
        if (!sponsorship) {
          return { status: 404 as const, error: "Sponsorship record not found" };
        }
        if (sponsorship.razorpayOrderId && sponsorship.razorpayOrderId !== razorpay_order_id) {
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

        const existingPayment = await tx.sponsorship.findUnique({
          where: { razorpayPaymentId: razorpay_payment_id },
        });
        if (existingPayment && existingPayment.id !== sponsorship.id) {
          return { status: 409 as const, error: "Duplicate payment ID detected" };
        }

        await tx.sponsorship.update({
          where: { id: sponsorship.id },
          data: {
            paymentStatus: "Completed",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
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
