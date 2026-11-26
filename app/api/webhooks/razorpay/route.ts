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
    const entity = parsed.payload?.payment?.entity;
    const orderId = entity?.order_id;
    const paymentId = entity?.id;

    if (!orderId || !paymentId) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const ip = getClientIp(request);

    if (event === "payment.captured" || event === "order.paid") {
      const outcome = await prisma.$transaction(async (tx) => {
        const donation = await tx.donation.findUnique({
          where: { razorpayOrderId: orderId },
        });

        if (donation) {
          if (donation.paymentStatus === "Completed") {
            return { updated: false, kind: "donation", id: donation.id };
          }
          if (
            typeof entity?.amount === "number" &&
            Math.round(donation.amount * 100) !== entity.amount
          ) {
            return { mismatch: true, kind: "donation", id: donation.id };
          }
          await tx.donation.update({
            where: { id: donation.id },
            data: {
              paymentStatus: "Completed",
              razorpayPaymentId: paymentId,
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
          if (
            typeof entity?.amount === "number" &&
            Math.round(sponsorship.amount * 100) !== entity.amount
          ) {
            return { mismatch: true, kind: "sponsorship", id: sponsorship.id };
          }
          await tx.sponsorship.update({
            where: { id: sponsorship.id },
            data: {
              paymentStatus: "Completed",
              razorpayPaymentId: paymentId,
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
