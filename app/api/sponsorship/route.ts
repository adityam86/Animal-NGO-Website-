import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
    if (tier && String(tier).includes("-")) {
      const parsed = parseFloat(String(tier).split("-")[1].trim());
      if (Number.isFinite(parsed) && parsed > 0) {
        amount = parsed;
      }
    }

    const sponsorship = await prisma.sponsorship.create({
      data: {
        sponsorName: String(sponsorName || "").trim(),
        sponsorPhone: String(sponsorPhone || "").trim(),
        sponsorEmail: String(sponsorEmail || "").trim(),
        animalId: animalId || null,
        tier: String(tier || "Food - 500"),
        frequency: String(frequency || "Monthly"),
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
