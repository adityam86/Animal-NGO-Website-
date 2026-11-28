import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, readBoundedJson } from "@/lib/security";
import { donationCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rate = await checkDistributedRateLimit(`donate-init:${ip}`, 15, 15 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many donation attempts. Please wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const bodyResult = await readBoundedJson(request, 32 * 1024);
    if (!bodyResult.ok) {
      return NextResponse.json({ error: bodyResult.error }, { status: bodyResult.status });
    }

    const parsed = donationCreateSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid donation details." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const normalizedFreq =
      d.frequency.toLowerCase() === "monthly" ? "Monthly" : "One-time";

    let validFundraiserId: string | null = null;
    if (d.fundraiserId && typeof prisma.medicalFundraiser?.findUnique === "function") {
      const fundraiser = await prisma.medicalFundraiser.findUnique({
        where: { id: d.fundraiserId },
        select: { id: true, isActive: true },
      });
      if (fundraiser?.isActive) {
        validFundraiserId = fundraiser.id;
      }
    }

    const newDonation = await prisma.donation.create({
      data: {
        amount: d.amount,
        purpose: d.purpose,
        frequency: normalizedFreq,
        donorName: d.name,
        donorPhone: d.phone,
        donorEmail: d.email,
        donorPan: d.pan || null,
        fundraiserId: validFundraiserId,
        paymentStatus: "Pending",
      },
      select: {
        id: true,
        amount: true,
        purpose: true,
        frequency: true,
      },
    });

    return NextResponse.json({ success: true, ...newDonation }, { status: 201 });
  } catch (error) {
    console.error("Failed to process donation:", error);
    return NextResponse.json({ error: "Failed to process donation" }, { status: 500 });
  }
}
