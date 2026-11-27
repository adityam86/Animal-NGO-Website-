import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { recordAuditLog } from "@/lib/auth-server";
import { verifyRazorpayWebhookSignature } from "@/lib/payment";
import { getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        status?: string;
      };
    };
    order?: {
      entity?: {
        id?: string;
        amount?: number;
        amount_paid?: number;
        currency?: string;
        status?: string;
      };
    };
  };
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook verification secret is not configured" },
        { status: 503 }
      );
    }

    const signature = request.headers.get("x-razorpay-signature") || "";
    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 401 });
    }

    const rawBody = await request.text();
    if (!rawBody || Buffer.byteLength(rawBody, "utf8") > 256 * 1024) {
      return NextResponse.json({ error: "Invalid webhook payload size" }, { status: 400 });
    }

    const valid = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);
    if (!valid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const parsed = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const event = parsed.event || "";
    const paymentEntity = parsed.payload?.payment?.entity;
    const orderEntity = parsed.payload?.order?.entity;

    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentId = paymentEntity?.id || null;

    if (!orderId) {
      return NextResponse.json({ received: true, ignored: true });
    }

    // For payment.captured event, payment entity and ID are mandatory
    if (event === "payment.captured" && !paymentId) {
      return NextResponse.json({ error: "Missing payment entity for payment.captured" }, { status: 400 });
    }

    const ip = getClientIp(request);

    if (event === "payment.captured" || event === "order.paid") {
      // 1. Currency validation: require currency to equal INR
      const currency = (paymentEntity?.currency || orderEntity?.currency || "").toUpperCase();
      if (!currency || currency !== "INR") {
        return NextResponse.json(
          { error: "Payment entity currency must be INR" },
          { status: 400 }
        );
      }

      // 2. Status validation:
      // For payment.captured: status must be captured
      if (event === "payment.captured") {
        if (!paymentEntity?.status || paymentEntity.status !== "captured") {
          return NextResponse.json(
            { error: "Payment status must be captured" },
            { status: 400 }
          );
        }
      }
      // For order.paid: if order status present, must be paid
      if (event === "order.paid") {
        if (orderEntity?.status && orderEntity.status !== "paid") {
          return NextResponse.json(
            { error: "Order status must be paid" },
            { status: 400 }
          );
        }
        if (paymentEntity?.status && paymentEntity.status !== "captured") {
          return NextResponse.json(
            { error: "Payment status must be captured" },
            { status: 400 }
          );
        }
      }

      // 3. Amount validation from webhook payload (in paise)
      const webhookPaise = typeof paymentEntity?.amount === "number"
        ? paymentEntity.amount
        : (typeof orderEntity?.amount_paid === "number"
            ? orderEntity.amount_paid
            : (typeof orderEntity?.amount === "number" ? orderEntity.amount : null));

      if (webhookPaise === null) {
        return NextResponse.json(
          { error: "Missing or invalid payment amount in webhook payload" },
          { status: 400 }
        );
      }

      const outcome = await prisma.$transaction(async (tx) => {
        // Cross-table razorpayPaymentId replay check (if paymentId is present)
        let existingDonPay = null;
        let existingSponPay = null;
        if (paymentId) {
          [existingDonPay, existingSponPay] = await Promise.all([
            tx.donation.findUnique({ where: { razorpayPaymentId: paymentId } }),
            tx.sponsorship.findUnique({ where: { razorpayPaymentId: paymentId } }),
          ]);
        }

        const donation = await tx.donation.findUnique({
          where: { razorpayOrderId: orderId },
        });

        if (donation) {
          if (donation.paymentStatus === "Completed") {
            return { updated: false, kind: "donation", id: donation.id };
          }
          const expectedPaise = Math.round(Number(donation.amount) * 100);
          if (webhookPaise !== expectedPaise) {
            return { mismatch: true, kind: "donation", id: donation.id };
          }
          if (
            paymentId &&
            ((existingDonPay && existingDonPay.id !== donation.id) || existingSponPay)
          ) {
            return { replay: true, kind: "donation", id: donation.id };
          }
          await tx.donation.update({
            where: { id: donation.id, paymentStatus: { not: "Completed" } },
            data: {
              paymentStatus: "Completed",
              ...(paymentId ? { razorpayPaymentId: paymentId } : {}),
              verifiedAt: new Date(),
            },
          });
          return { updated: true, kind: "donation", id: donation.id };
        }

        const sponsorship = await tx.sponsorship.findUnique({
          where: { razorpayOrderId: orderId },
        });
        if (sponsorship) {
          if (sponsorship.paymentStatus === "Completed") {
            return { updated: false, kind: "sponsorship", id: sponsorship.id };
          }
          const { SPONSORSHIP_TIERS_INR } = await import("@/lib/payment");
          const expectedAmount = SPONSORSHIP_TIERS_INR[sponsorship.tier] ?? Number(sponsorship.amount);
          const expectedPaise = Math.round(expectedAmount * 100);
          if (webhookPaise !== expectedPaise) {
            return { mismatch: true, kind: "sponsorship", id: sponsorship.id };
          }
          if (
            paymentId &&
            ((existingSponPay && existingSponPay.id !== sponsorship.id) || existingDonPay)
          ) {
            return { replay: true, kind: "sponsorship", id: sponsorship.id };
          }
          await tx.sponsorship.update({
            where: { id: sponsorship.id, paymentStatus: { not: "Completed" } },
            data: {
              paymentStatus: "Completed",
              ...(paymentId ? { razorpayPaymentId: paymentId } : {}),
              verifiedAt: new Date(),
            },
          });
          return { updated: true, kind: "sponsorship", id: sponsorship.id };
        }

        return { notFound: true };
      });

      if ("mismatch" in outcome && outcome.mismatch) {
        return NextResponse.json(
          { error: "Captured amount mismatch against stored order amount" },
          { status: 400 }
        );
      }

      if ("replay" in outcome && outcome.replay) {
        return NextResponse.json(
          { error: "Duplicate payment ID detected via webhook" },
          { status: 409 }
        );
      }

      if ("updated" in outcome && outcome.updated) {
        await recordAuditLog({
          action: "RAZORPAY_WEBHOOK_CAPTURED",
          resource: `${outcome.kind}:${outcome.id}`,
          details: `Order ${orderId} verified via webhook`,
          ipAddress: ip,
        });
      }

      return NextResponse.json({ received: true, ...outcome });
    }

    if (event === "payment.failed") {
      await prisma.$transaction(async (tx) => {
        await tx.donation.updateMany({
          where: { razorpayOrderId: orderId, paymentStatus: { not: "Completed" } },
          data: { paymentStatus: "Failed" },
        });
        await tx.sponsorship.updateMany({
          where: { razorpayOrderId: orderId, paymentStatus: { not: "Completed" } },
          data: { paymentStatus: "Failed" },
        });
      });
      return NextResponse.json({ received: true, status: "marked_failed" });
    }

    return NextResponse.json({ received: true, ignored: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
