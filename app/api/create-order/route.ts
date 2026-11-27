import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";
import { SPONSORSHIP_TIERS_INR, isMockPaymentsEnabled } from "@/lib/payment";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, readBoundedJson } from "@/lib/security";
import { createOrderSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rate = await checkDistributedRateLimit(`create-order:${ip}`, 20, 15 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const bodyResult = await readBoundedJson(request, 16 * 1024);
    if (!bodyResult.ok) {
      return NextResponse.json({ error: bodyResult.error }, { status: bodyResult.status });
    }

    const parsed = createOrderSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid payment order request." },
        { status: 400 }
      );
    }

    const { recordType, recordId } = parsed.data;
    let numericAmount = 0;
    let purposeNote = "Ayudar Animal Welfare";

    if (recordType === "donation") {
      const donation = await prisma.donation.findUnique({ where: { id: recordId } });
      if (!donation) {
        return NextResponse.json({ error: "Donation record not found" }, { status: 404 });
      }
      if (donation.paymentStatus === "Completed") {
        return NextResponse.json(
          { error: "This donation has already been paid and verified." },
          { status: 409 }
        );
      }
      numericAmount = Number(donation.amount);
      purposeNote = `Donation: ${donation.purpose}`;
    } else {
      const sponsorship = await prisma.sponsorship.findUnique({ where: { id: recordId } });
      if (!sponsorship) {
        return NextResponse.json({ error: "Sponsorship record not found" }, { status: 404 });
      }
      if (sponsorship.paymentStatus === "Completed") {
        return NextResponse.json(
          { error: "This sponsorship payment has already been verified." },
          { status: 409 }
        );
      }
      numericAmount = SPONSORSHIP_TIERS_INR[sponsorship.tier] ?? Number(sponsorship.amount);
      purposeNote = `Sponsorship: ${sponsorship.tier}`;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Invalid server payment amount" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (keyId && keySecret && publicKeyId) {
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const receipt = `${recordType.slice(0, 3)}_${recordId.slice(0, 28)}`;

      // Explicitly configure automatic payment capture upon successful authorization
      const order = await razorpay.orders.create({
        amount: Math.round(numericAmount * 100),
        currency: "INR",
        receipt,
        payment_capture: 1,
        notes: {
          recordType,
          recordId,
          purpose: purposeNote,
        },
      } as Parameters<typeof razorpay.orders.create>[0]);

      if (recordType === "donation") {
        await prisma.donation.update({
          where: { id: recordId },
          data: { razorpayOrderId: order.id },
        });
      } else {
        await prisma.sponsorship.update({
          where: { id: recordId },
          data: { razorpayOrderId: order.id },
        });
      }

      return NextResponse.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        isMock: false,
      });
    }

    if (isMockPaymentsEnabled()) {
      const mockOrderId = `order_mock_${Date.now()}_${randomBytes(4).toString("hex")}`;
      const amountPaise = Math.round(numericAmount * 100);
      const receipt = `receipt_mock_${recordId.slice(0, 20)}`;

      if (recordType === "donation") {
        await prisma.donation.update({
          where: { id: recordId },
          data: { razorpayOrderId: mockOrderId },
        });
      } else {
        await prisma.sponsorship.update({
          where: { id: recordId },
          data: { razorpayOrderId: mockOrderId },
        });
      }

      return NextResponse.json({
        id: mockOrderId,
        amount: amountPaise,
        currency: "INR",
        receipt,
        isMock: true,
      });
    }

    return NextResponse.json(
      {
        error:
          "Online payment gateway is not configured on this server. Please try again later or contact support.",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
