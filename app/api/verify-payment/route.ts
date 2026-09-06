import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, sponsorshipId } = await request.json();

    // Mock verification for local testing
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Using mock payment verification");
      if (sponsorshipId) {
        await prisma.sponsorship.update({
          where: { id: sponsorshipId },
          data: { paymentStatus: "Completed", razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id }
        });
      }
      return NextResponse.json({ success: true, verified: true });
    }

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      if (sponsorshipId) {
        await prisma.sponsorship.update({
          where: { id: sponsorshipId },
          data: { paymentStatus: "Completed", razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id }
        });
      }
      return NextResponse.json({ success: true, verified: true });
    } else {
      if (sponsorshipId) {
        await prisma.sponsorship.update({
          where: { id: sponsorshipId },
          data: { paymentStatus: "Failed" }
        });
      }
      return NextResponse.json(
        { success: false, verified: false, error: "Invalid signature" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verification failed:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
