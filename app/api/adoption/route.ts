import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      applicantName,
      age,
      phone,
      email,
      address,
      occupation,
      hasPets,
      homeType,
      familyMembers,
      reason,
      animalId,
    } = body;

    const application = await prisma.adoptionApplication.create({
      data: {
        applicantName,
        age: Number(age),
        phone,
        email,
        address,
        occupation: occupation || "",
        hasPets: Boolean(hasPets),
        homeType,
        familyMembers: Number(familyMembers) || 1,
        reason,
        animalId: animalId || null,
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Adoption error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
