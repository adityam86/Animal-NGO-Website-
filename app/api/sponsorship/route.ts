import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sponsorName,
      sponsorPhone,
      sponsorEmail,
      animalId,
      tier,
      frequency,
    } = body;

    // Parse amount from tier (e.g. "Food - 500" -> 500)
    let amount = 500;
    if (tier && tier.includes("-")) {
      amount = parseFloat(tier.split("-")[1].trim());
    }

    const sponsorship = await prisma.sponsorship.create({
      data: {
        sponsorName,
        sponsorPhone,
        sponsorEmail,
        animalId: animalId || null,
        tier,
        frequency,
        amount,
        paymentStatus: "Pending",
      },
    });

    return NextResponse.json({ success: true, sponsorship });
  } catch (error) {
    console.error("Sponsorship error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record sponsorship" },
      { status: 500 }
    );
  }
}
