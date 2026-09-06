import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const newDonation = await prisma.donation.create({
      data: {
        amount: parseFloat(data.amount),
        purpose: data.purpose,
        frequency: data.frequency,
        donorName: data.name,
        donorPhone: data.phone,
        donorEmail: data.email,
        donorPan: data.pan || null,
        paymentStatus: "Pending",
      },
    });

    // In a real application, you would integrate a payment gateway (e.g., Razorpay/Stripe) here
    // and return the order ID or payment session details.

    return NextResponse.json({ success: true, id: newDonation.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to process donation:", error);
    return NextResponse.json({ error: "Failed to process donation" }, { status: 500 });
  }
}
