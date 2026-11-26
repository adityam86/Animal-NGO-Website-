import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, sponsorshipId, donationId } =
      await request.json();

    const markCompleted = async () => {
      if (sponsorshipId) {
        await prisma.sponsorship.update({
          where: { id: sponsorshipId },
          data: {
            paymentStatus: "Completed",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
          },
        });
      }
      if (donationId) {
        await prisma.donation.update({
          where: { id: donationId },
          data: { paymentStatus: "Completed" },
        });
      }
    };

    // Mock verification for testing / demo mode
    if (!process.env.RAZORPAY_KEY_SECRET || String(razorpay_order_id || "").startsWith("order_mock_")) {
      console.warn("Using mock payment verification");
      await markCompleted();
      return NextResponse.json({ success: true, verified: true });
    }

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await markCompleted();
      return NextResponse.json({ success: true, verified: true });
    } else {
      if (sponsorshipId) {
        await prisma.sponsorship.update({
          where: { id: sponsorshipId },
          data: { paymentStatus: "Failed" },
        });
      }
      if (donationId) {
        await prisma.donation.update({
          where: { id: donationId },
          data: { paymentStatus: "Failed" },
        });
      }
      return NextResponse.json(
        { success: false, verified: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
