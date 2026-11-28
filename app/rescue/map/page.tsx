import prisma from "@/lib/prisma";
import Link from "next/link";
import { MapPin, ShieldCheck, AlertTriangle } from "lucide-react";
import HotspotMap, { type HotspotItem } from "@/components/shared/HotspotMap";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community Rescue Heatmap (Anonymized)",
  description:
    "Anonymized street animal rescue corridor map across Tilabad, Kumarpur, Asansol, Raniganj & Durgapur protecting witness privacy.",
};

export default async function RescueHeatmapPage() {
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

  const cells = new Map<string, HotspotItem>();
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

  const hotspots = Array.from(cells.values()).sort((a, b) => b.count - a.count);

  return (
    <main style={{ background: "var(--cream-50)", minHeight: "100vh", paddingTop: "72px" }}>
      <section className="section">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <div style={{ maxWidth: "62ch" }}>
              <span className="editorial-eyebrow" style={{ marginBottom: "0.75rem" }}>
                <MapPin size={13} style={{ display: "inline", marginRight: 5 }} /> Privacy-First Field Intelligence
              </span>
              <h1 style={{ fontSize: "clamp(1.9rem, 4vw, 2.75rem)", marginBottom: "0.65rem" }}>
                Anonymized Street Rescue Heatmap
              </h1>
              <p style={{ color: "var(--stone-600)", margin: 0, lineHeight: 1.65 }}>
                Helping feeders, municipal volunteers, and corporate CSR partners visualize injury-prone zones while strictly stripping all witness names, phone numbers, descriptions, and exact residential pins.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              <Link href="/rescue" className="btn btn-emergency btn-sm">
                <AlertTriangle size={14} style={{ marginRight: 4 }} /> Report Injured Animal
              </Link>
              <Link href="/drives" className="btn btn-outline btn-sm">
                Request Locality Drive →
              </Link>
            </div>
          </div>

          <div className="card card-elevated" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
            <HotspotMap hotspots={hotspots} height={470} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase" }}>Geo-Tagged Zones</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--green-800)" }}>{hotspots.length}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--stone-600)" }}>Aggregated ~330m corridor cells</div>
            </div>
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase" }}>Geo-Tagged Calls</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--terracotta)" }}>{cases.length}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--stone-600)" }}>Pinpointed rescues logged with map coordinates</div>
            </div>
            <div className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
              <ShieldCheck size={20} style={{ color: "var(--green-600)", flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: "0.82rem", color: "var(--stone-600)", lineHeight: 1.55 }}>
                Only reports submitted with optional map pin coordinates appear here; older landmark-only cases remain off-map without exposing reporter data.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
