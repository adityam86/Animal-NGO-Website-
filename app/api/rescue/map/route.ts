import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type HotspotCell = {
  cellId: string;
  lat: number;
  lng: number;
  count: number;
  criticalCount: number;
  speciesSummary: Record<string, number>;
  latestReportedAt: string;
};

/**
 * Returns privacy-safe rescue hotspots aggregated into ~330m grid cells
 * (rounded to ~0.003 degrees). Zero reporter PII, zero descriptions, zero exact street addresses.
 */
export async function GET() {
  try {
    const cases = await prisma.rescueCase.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        animalType: true,
        emergencyLevel: true,
        reportedAt: true,
        latitude: true,
        longitude: true,
      },
      orderBy: { reportedAt: "desc" },
      take: 400,
    });

    const cells = new Map<string, HotspotCell>();

    for (const c of cases) {
      if (typeof c.latitude !== "number" || typeof c.longitude !== "number") continue;
      const gridLat = Number((Math.round(c.latitude / 0.003) * 0.003).toFixed(4));
      const gridLng = Number((Math.round(c.longitude / 0.003) * 0.003).toFixed(4));
      const key = `${gridLat},${gridLng}`;

      const existing = cells.get(key);
      const species = c.animalType || "Animal";
      const iso = c.reportedAt.toISOString();

      if (!existing) {
        cells.set(key, {
          cellId: key,
          lat: gridLat,
          lng: gridLng,
          count: 1,
          criticalCount: c.emergencyLevel === "Critical" ? 1 : 0,
          speciesSummary: { [species]: 1 },
          latestReportedAt: iso,
        });
      } else {
        existing.count += 1;
        if (c.emergencyLevel === "Critical") existing.criticalCount += 1;
        existing.speciesSummary[species] = (existing.speciesSummary[species] || 0) + 1;
        if (iso > existing.latestReportedAt) existing.latestReportedAt = iso;
      }
    }

    return NextResponse.json(
      {
        hotspots: Array.from(cells.values()).sort((a, b) => b.count - a.count),
        totalGeoCases: cases.length,
        gridResolutionMeters: 330,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to fetch rescue heatmap data:", error);
    return NextResponse.json({ hotspots: [], totalGeoCases: 0, gridResolutionMeters: 330 });
  }
}
