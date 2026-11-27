import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, readBoundedJson } from "@/lib/security";
import { adoptionCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ success: false, error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rate = await checkDistributedRateLimit(`adoption-create:${ip}`, 6, 15 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many applications submitted. Please wait and try again." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const bodyResult = await readBoundedJson(request, 64 * 1024);
    if (!bodyResult.ok) {
      return NextResponse.json(
        { success: false, error: bodyResult.error },
        { status: bodyResult.status }
      );
    }

    const parsed = adoptionCreateSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    if (data.animalId) {
      const animalExists = await prisma.animal.findUnique({
        where: { id: data.animalId },
        select: { id: true },
      });
      if (!animalExists) {
        return NextResponse.json(
          { success: false, error: "Selected animal record was not found." },
          { status: 404 }
        );
      }
    }

    const application = await prisma.adoptionApplication.create({
      data: {
        applicantName: data.applicantName,
        age: data.age,
        phone: data.phone,
        email: data.email,
        address: data.address,
        occupation: data.occupation || "",
        hasPets: data.hasPets,
        petDetails: data.petDetails || null,
        homeType: data.homeType,
        familyMembers: data.familyMembers,
        reason: data.reason,
        animalId: data.animalId || null,
        status: "Submitted",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error("Adoption error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
