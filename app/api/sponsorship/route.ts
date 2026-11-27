import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SPONSORSHIP_TIERS_INR } from "@/lib/payment";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOriginRequest, readBoundedJson } from "@/lib/security";
import { sponsorshipCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ success: false, error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const rate = await checkDistributedRateLimit(`sponsorship-init:${ip}`, 15, 15 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many sponsorship attempts. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const bodyResult = await readBoundedJson(request, 32 * 1024);
    if (!bodyResult.ok) {
      return NextResponse.json(
        { success: false, error: bodyResult.error },
        { status: bodyResult.status }
      );
    }

    const parsed = sponsorshipCreateSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Invalid sponsorship details.",
        },
        { status: 400 }
      );
    }

    const d = parsed.data;
    if (d.animalId) {
      const animalExists = await prisma.animal.findUnique({
        where: { id: d.animalId },
        select: { id: true },
      });
      if (!animalExists) {
        return NextResponse.json(
          { success: false, error: "Selected animal was not found." },
          { status: 404 }
        );
      }
    }

    const serverAmount = SPONSORSHIP_TIERS_INR[d.tier];
    if (!serverAmount) {
      return NextResponse.json(
        { success: false, error: "Invalid sponsorship tier selected." },
        { status: 400 }
      );
    }

    const sponsorship = await prisma.sponsorship.create({
      data: {
        sponsorName: d.sponsorName,
        sponsorPhone: d.sponsorPhone,
        sponsorEmail: d.sponsorEmail,
        animalId: d.animalId || null,
        tier: d.tier,
        frequency: d.frequency,
        amount: serverAmount,
        paymentStatus: "Pending",
      },
      select: {
        id: true,
        tier: true,
        amount: true,
        frequency: true,
        paymentStatus: true,
      },
    });

    return NextResponse.json({ success: true, sponsorship }, { status: 201 });
  } catch (error) {
    console.error("Sponsorship error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record sponsorship" },
      { status: 500 }
    );
  }
}
