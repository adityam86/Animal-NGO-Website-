import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const fundraisers = await prisma.medicalFundraiser.findMany({
      where: { isActive: true },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        animalName: true,
        species: true,
        summary: true,
        purpose: true,
        goalInr: true,
        image: true,
        animalId: true,
        createdAt: true,
        donations: {
          where: { paymentStatus: "Completed" },
          select: { amount: true },
        },
      },
    });

    const formatted = fundraisers.map((f) => {
      const raisedAmount = f.donations.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
      return {
        id: f.id,
        title: f.title,
        animalName: f.animalName,
        species: f.species,
        summary: f.summary,
        purpose: f.purpose,
        goalInr: f.goalInr,
        raisedAmount,
        donorCount: f.donations.length,
        image: f.image,
        animalId: f.animalId,
        createdAt: f.createdAt.toISOString(),
      };
    });

    return NextResponse.json(
      { fundraisers: formatted },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to load active fundraisers:", error);
    return NextResponse.json({ fundraisers: [] }, { status: 200 });
  }
}
