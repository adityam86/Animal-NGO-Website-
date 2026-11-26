import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const numericAmount = parseFloat(String(data.amount));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Invalid donation amount" }, { status: 400 });
    }

    const newDonation = await prisma.donation.create({
      data: {
        amount: numericAmount,
        purpose: String(data.purpose || "General Fund"),
        frequency: String(data.frequency || "one-time"),
        donorName: String(data.name || "").trim(),
        donorPhone: String(data.phone || "").trim(),
        donorEmail: String(data.email || "").trim(),
        donorPan: data.pan ? String(data.pan).trim() : null,
        paymentStatus: "Pending",
      },
    });

    return NextResponse.json({ success: true, id: newDonation.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to process donation:", error);
    return NextResponse.json({ error: "Failed to process donation" }, { status: 500 });
  }
}
