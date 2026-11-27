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
        amount_refunded?: number;
        refund_status?: string;
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
    refund?: {
      entity?: {
        id?: string;
        payment_id?: string;
        amount?: number;
        status?: string;
      };
    };
    dispute?: {
      entity?: {
        id?: string;
        payment_id?: string;
        amount?: number;
        status?: string;
        reason_code?: string;
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
    const refundEntity = parsed.payload?.refund?.entity;
    const disputeEntity = parsed.payload?.dispute?.entity;

    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentId = paymentEntity?.id || refundEntity?.payment_id || disputeEntity?.payment_id || null;

    const ip = getClientIp(request);

    // 1. Captured payments and Paid orders
    if (event === "payment.captured" || event === "order.paid") {
      if (!orderId) {
        return NextResponse.json({ received: true, ignored: true });
      }

      if (event === "payment.captured" && !paymentId) {
        return NextResponse.json({ error: "Missing payment entity for payment.captured" }, { status: 400 });
      }

      // Currency validation: require currency to equal INR
      const currency = (paymentEntity?.currency || orderEntity?.currency || "").toUpperCase();
      if (!currency || currency !== "INR") {
        return NextResponse.json(
          { error: "Payment entity currency must be INR" },
          { status: 400 }
        );
      }

      // Status validation
      if (event === "payment.captured") {
        if (!paymentEntity?.status || paymentEntity.status !== "captured") {
          return NextResponse.json(
            { error: "Payment status must be captured" },
            { status: 400 }
          );
        }
      }
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

      // Amount validation from webhook payload (in paise)
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

    // 2. Failed payments
    if (event === "payment.failed") {
      if (!orderId) {
        return NextResponse.json({ received: true, ignored: true });
      }
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

    // 3. Documented refund webhooks (refund.processed, refund.created, refund.failed, refund.speed_changed)
    if (
      event === "refund.processed" ||
      event === "refund.created" ||
      event === "refund.failed" ||
      event === "refund.speed_changed"
    ) {
      const refundId = refundEntity?.id;
      if (!paymentId && !orderId && !refundId) {
        return NextResponse.json({ received: true, ignored: true });
      }

      // Handle refund.failed
      if (event === "refund.failed" || refundEntity?.status === "failed") {
        await recordAuditLog({
          action: "RAZORPAY_REFUND_FAILED",
          resource: `refund:${refundId || "unknown"}`,
          details: `Refund attempt failed for payment ${paymentId || "unknown"}`,
          ipAddress: ip,
        });
        return NextResponse.json({ received: true, status: "refund_failed_logged" });
      }

      // Handle refund.created or refund.speed_changed (in-flight state updates)
      if (event === "refund.created" || event === "refund.speed_changed") {
        await recordAuditLog({
          action: `RAZORPAY_${event.toUpperCase().replace(".", "_")}`,
          resource: `refund:${refundId || "unknown"}`,
          details: `Refund event ${event} received for payment ${paymentId || "unknown"}`,
          ipAddress: ip,
        });
        return NextResponse.json({ received: true, status: "refund_status_logged" });
      }

      // Handle refund.processed
      if (event === "refund.processed") {
        const refundResult = await prisma.$transaction(async (tx) => {
          let donation = paymentId
            ? await tx.donation.findUnique({ where: { razorpayPaymentId: paymentId } })
            : null;
          if (!donation && orderId) {
            donation = await tx.donation.findUnique({ where: { razorpayOrderId: orderId } });
          }

          if (donation) {
            const originalPaise = Math.round(Number(donation.amount) * 100);
            const cumulativeRefundPaise = typeof paymentEntity?.amount_refunded === "number"
              ? paymentEntity.amount_refunded
              : (refundEntity?.amount ?? 0);

            const isFullRefund =
              paymentEntity?.refund_status === "full" ||
              cumulativeRefundPaise >= originalPaise;

            const targetStatus = isFullRefund ? "Refunded" : "Partially Refunded";

            // Idempotency: if already at the target status, return without re-updating
            if (donation.paymentStatus === targetStatus) {
              return { updated: false, kind: "donation", id: donation.id, status: targetStatus, alreadyProcessed: true };
            }

            await tx.donation.update({
              where: { id: donation.id },
              data: { paymentStatus: targetStatus },
            });
            return { updated: true, kind: "donation", id: donation.id, status: targetStatus };
          }

          let sponsorship = paymentId
            ? await tx.sponsorship.findUnique({ where: { razorpayPaymentId: paymentId } })
            : null;
          if (!sponsorship && orderId) {
            sponsorship = await tx.sponsorship.findUnique({ where: { razorpayOrderId: orderId } });
          }

          if (sponsorship) {
            const { SPONSORSHIP_TIERS_INR } = await import("@/lib/payment");
            const expectedAmount = SPONSORSHIP_TIERS_INR[sponsorship.tier] ?? Number(sponsorship.amount);
            const originalPaise = Math.round(expectedAmount * 100);
            const cumulativeRefundPaise = typeof paymentEntity?.amount_refunded === "number"
              ? paymentEntity.amount_refunded
              : (refundEntity?.amount ?? 0);

            const isFullRefund =
              paymentEntity?.refund_status === "full" ||
              cumulativeRefundPaise >= originalPaise;

            const targetStatus = isFullRefund ? "Refunded" : "Partially Refunded";

            if (sponsorship.paymentStatus === targetStatus) {
              return { updated: false, kind: "sponsorship", id: sponsorship.id, status: targetStatus, alreadyProcessed: true };
            }

            await tx.sponsorship.update({
              where: { id: sponsorship.id },
              data: { paymentStatus: targetStatus },
            });
            return { updated: true, kind: "sponsorship", id: sponsorship.id, status: targetStatus };
          }

          return { notFound: true };
        });

        if ("updated" in refundResult && refundResult.updated) {
          await recordAuditLog({
            action: refundResult.status === "Refunded" ? "RAZORPAY_REFUND_PROCESSED_FULL" : "RAZORPAY_REFUND_PROCESSED_PARTIAL",
            resource: `${refundResult.kind}:${refundResult.id}`,
            details: `Refund processed (${refundResult.status}) for refund ID ${refundId || "unknown"}`,
            ipAddress: ip,
          });
        }

        return NextResponse.json({ received: true, status: "refund_processed", ...refundResult });
      }
    }

    // 4. Dispute webhooks (payment.dispute.created, payment.dispute.won, payment.dispute.lost)
    // Dispute events must never automatically change a donation to Refunded
    if (event.startsWith("payment.dispute.")) {
      if (paymentId) {
        const disputeAction =
          event === "payment.dispute.created"
            ? "RAZORPAY_DISPUTE_CREATED"
            : event === "payment.dispute.won"
            ? "RAZORPAY_DISPUTE_WON"
            : event === "payment.dispute.lost"
            ? "RAZORPAY_DISPUTE_LOST"
            : "RAZORPAY_DISPUTE_UPDATED";

        await recordAuditLog({
          action: disputeAction,
          resource: `payment:${paymentId}`,
          details: `Dispute event ${event} received for payment ${paymentId}`,
          ipAddress: ip,
        });

        if (event === "payment.dispute.created") {
          await prisma.$transaction(async (tx) => {
            const donation = await tx.donation.findUnique({ where: { razorpayPaymentId: paymentId } });
            if (donation && donation.paymentStatus === "Completed") {
              await tx.donation.update({
                where: { id: donation.id },
                data: { paymentStatus: "Disputed" },
              });
            }
            const sponsorship = await tx.sponsorship.findUnique({ where: { razorpayPaymentId: paymentId } });
            if (sponsorship && sponsorship.paymentStatus === "Completed") {
              await tx.sponsorship.update({
                where: { id: sponsorship.id },
                data: { paymentStatus: "Disputed" },
              });
            }
          });
        } else if (event === "payment.dispute.won") {
          await prisma.$transaction(async (tx) => {
            await tx.donation.updateMany({
              where: { razorpayPaymentId: paymentId, paymentStatus: "Disputed" },
              data: { paymentStatus: "Completed" },
            });
            await tx.sponsorship.updateMany({
              where: { razorpayPaymentId: paymentId, paymentStatus: "Disputed" },
              data: { paymentStatus: "Completed" },
            });
          });
        }
      }
      return NextResponse.json({ received: true, status: "dispute_handled" });
    }

    return NextResponse.json({ received: true, ignored: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
