import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);
    const rate = await checkDistributedRateLimit(`rescue-track:${ip}`, 60, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many status lookups. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }

    const { id } = await params;
    const cleanId = id?.trim();
    if (!cleanId || cleanId.length > 80) {
      return NextResponse.json({ error: "Invalid rescue case ID" }, { status: 400 });
    }

    // Explicitly exclude reporterName, reporterPhone, reporterEmail, photoUrl, and free-text notes
    // so public status tracking never leaks caller personally identifiable information or raw incident photos.
    const rescueCase = await prisma.rescueCase.findUnique({
      where: { id: cleanId },
      select: {
        id: true,
        animalType: true,
        emergencyLevel: true,
        location: true,
        assignedTeam: true,
        status: true,
        reportedAt: true,
        history: {
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          select: {
            id: true,
            status: true,
            time: true,
            done: true,
          },
        },
      },
    });

    if (!rescueCase) {
      return NextResponse.json({ error: "Rescue case not found" }, { status: 404 });
    }

    // Redact exact GPS coordinates from public tracking responses
    const redactedLocation = rescueCase.location
      ? rescueCase.location
          .replace(/\(GPS:\s*-?\d+\.?\d*,\s*-?\d+\.?\d*\)/gi, "(Location logged with dispatch)")
          .replace(/GPS:\s*-?\d+\.?\d*,\s*-?\d+\.?\d*/gi, "Location logged with dispatch")
      : rescueCase.location;

    return NextResponse.json(
      {
        ...rescueCase,
        location: redactedLocation,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to fetch rescue case:", error);
    return NextResponse.json({ error: "Failed to fetch rescue case" }, { status: 500 });
  }
}
