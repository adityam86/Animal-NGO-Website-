import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

/**
 * Generalizes the location for public status tracking so exact GPS coordinates,
 * house/flat numbers, and private caller address specifics are never exposed publicly.
 */
function generalizePublicLocation(rawLocation: string | null | undefined): string {
  if (!rawLocation) return "Location logged with dispatch";

  // 1. Strip raw GPS coordinates
  let loc = rawLocation
    .replace(/\(?GPS:?\s*-?\d+\.?\d*,\s*-?\d+\.?\d*\)?/gi, "")
    .trim();

  // 2. Strip precise door/house/flat/apartment/plot numbers
  loc = loc
    .replace(/\b(flat|house|plot|door|room|shop|building|bldg|no\.?|#)\s*[\w\d\/-]+/gi, "")
    .replace(/\b\d+[\/-]\d+\b/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[,.\s-]+|[,.\s-]+$/g, "")
    .trim();

  return loc ? `${loc} (Location logged with dispatch)` : "Location logged with dispatch";
}

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

    // Redact exact GPS coordinates and precise house/flat address from public tracking response
    const sanitizedLocation = generalizePublicLocation(rescueCase.location);

    return NextResponse.json(
      {
        ...rescueCase,
        location: sanitizedLocation,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to fetch rescue case:", error);
    return NextResponse.json({ error: "Failed to fetch rescue case" }, { status: 500 });
  }
}
