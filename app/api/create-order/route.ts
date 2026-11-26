import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { amount, purpose } = await request.json();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    // For local testing / presentation mode without live Razorpay keys, create a mock order
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      console.warn("Razorpay keys missing, using mock order for testing");
      return NextResponse.json({
        id: `order_mock_${Date.now()}`,
        amount: Math.round(numericAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        isMock: true,
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(numericAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { purpose: String(purpose || "Ayudar Welfare") },
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ ...order, isMock: false });
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
