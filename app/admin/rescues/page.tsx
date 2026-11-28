import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { updateRescueStatus } from "../actions";
import type { Prisma } from "@prisma/client";

export default async function AdminRescuesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const statusFilter = sp.status?.trim() || "All";
  const priorityFilter = sp.priority?.trim() || "All";

  const where: Prisma.RescueCaseWhereInput = {};
  if (statusFilter !== "All") where.status = statusFilter;
  if (priorityFilter !== "All") where.emergencyLevel = priorityFilter;
  if (q) {
    where.OR = [
      { animalType: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { reporterName: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const rescues = await prisma.rescueCase.findMany({
    where,
    include: { history: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
    orderBy: { reportedAt: "desc" },
  });

  const availableStatuses = ["Reported", "Assigned", "On The Way", "Rescued", "Treatment", "Closed"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Rescue Cases ({rescues.length})</h1>
          <p style={{ color: "var(--stone-500)", margin: 0 }}>
            Manage emergency rescue dispatches, caller coordination, and field progress.
          </p>
        </div>
      </div>

      {/* Filters */}
      <form
        method="GET"
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
          background: "var(--color-surface)",
          padding: "1rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--cream-200)",
        }}
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search animal, location, reporter, notes..."
          className="form-input"
          style={{ flex: 1, minWidth: 200 }}
        />
        <select name="priority" defaultValue={priorityFilter} className="form-select" style={{ width: 155 }}>
          <option value="All">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Normal">Normal</option>
        </select>
        <select name="status" defaultValue={statusFilter} className="form-select" style={{ width: 165 }}>
          <option value="All">All Statuses</option>
          {availableStatuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary btn-sm">Filter</button>
        {(q || statusFilter !== "All" || priorityFilter !== "All") && (
          <Link href="/admin/rescues" className="btn btn-outline btn-sm">Reset</Link>
        )}
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {rescues.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", color: "var(--stone-500)" }}>
            No rescue cases match your filter.
          </div>
        ) : (
          rescues.map((rescue) => {
            const legacyMatch = rescue.description?.match(/\[Incident Photo:\s*([^\]]+)\]/);
            const cleanDesc = rescue.description?.replace(/\[Incident Photo:\s*[^\]]+\]/, "").trim();
            const photoUrl = rescue.photoUrl || (legacyMatch ? legacyMatch[1].trim() : null);

            return (
              <div key={rescue.id} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid var(--cream-200)", background: "var(--stone-50)", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div style={{ minWidth: 200, flex: 1 }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--stone-400)", marginBottom: "0.2rem" }}>
                      CASE ID: {rescue.id}
                    </div>
                    <div style={{ fontSize: "1.08rem", fontWeight: 700, color: "var(--stone-800)", lineHeight: 1.25 }}>
                      {rescue.animalType} at {rescue.location}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      background:
                        rescue.emergencyLevel === "Critical"
                          ? "var(--red-100)"
                          : rescue.emergencyLevel === "High"
                          ? "var(--saffron-100)"
                          : "var(--green-100)",
                      color:
                        rescue.emergencyLevel === "Critical"
                          ? "var(--red-700)"
                          : rescue.emergencyLevel === "High"
                          ? "var(--saffron-700)"
                          : "var(--green-700)",
                    }}
                  >
                    {rescue.emergencyLevel} Priority
                  </div>
                </div>

                <div className="admin-two-col-content">
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "0.95rem", marginBottom: "0.75rem", color: "var(--stone-500)" }}>Field Details</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.5rem 1.25rem", fontSize: "0.92rem" }}>
                      <div style={{ fontWeight: 600 }}>Reporter:</div>
                      <div>
                        {rescue.reporterName} • <a href={`tel:${rescue.reporterPhone}`} style={{ color: "var(--green-700)", fontWeight: 600 }}>{rescue.reporterPhone}</a>
                        {rescue.reporterEmail ? ` • ${rescue.reporterEmail}` : ""}
                      </div>

                      <div style={{ fontWeight: 600 }}>Location:</div>
                      <div>
                        {rescue.location}
                        {(() => {
                          const match = rescue.location?.match(/GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
                          if (!match) return null;
                          return (
                            <div style={{ marginTop: "4px" }}>
                              <a
                                href={`https://www.google.com/maps?q=${match[1]},${match[2]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: "0.8rem", color: "var(--green-700)", fontWeight: 700, textDecoration: "none" }}
                              >
                                📍 Open Live GPS in Google Maps ↗
                              </a>
                            </div>
                          );
                        })()}
                      </div>

                      <div style={{ fontWeight: 600 }}>Team:</div>
                      <div>{rescue.assignedTeam || "Unassigned"}</div>

                      <div style={{ fontWeight: 600 }}>Notes:</div>
                      <div>
                        <div style={{ color: "var(--stone-600)" }}>{cleanDesc || rescue.description || "N/A"}</div>
                        {rescue.latitude != null && rescue.longitude != null && (
                          <div style={{ marginTop: "6px" }}>
                            <a
                              href={`https://www.google.com/maps?q=${rescue.latitude},${rescue.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: "0.8rem", color: "var(--green-700)", fontWeight: 700, textDecoration: "none" }}
                            >
                              📍 Open Exact Incident Pin ({rescue.latitude.toFixed(4)}, {rescue.longitude.toFixed(4)}) ↗
                            </a>
                          </div>
                        )}
                        {photoUrl && (
                          <div style={{ marginTop: "8px" }}>
                            <a href={photoUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
                              <Image
                                src={photoUrl}
                                alt="Incident photo"
                                width={180}
                                height={90}
                                unoptimized
                                style={{
                                  height: "85px",
                                  width: "auto",
                                  maxWidth: "180px",
                                  objectFit: "cover",
                                  borderRadius: "var(--radius-sm)",
                                  border: "1px solid var(--cream-300)",
                                }}
                              />
                            </a>
                          </div>
                        )}
                        {rescue.audioUrl && (
                          <div style={{ marginTop: "8px" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--stone-600)", marginBottom: "4px" }}>
                              Private Witness Voice Note:
                            </div>
                            <audio controls src={rescue.audioUrl} style={{ width: "100%", maxWidth: 320, height: 36 }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="admin-two-col-right">
                    <h3 style={{ fontSize: "0.95rem", marginBottom: "0.75rem", color: "var(--stone-500)" }}>Update Dispatch Status</h3>
                    <div style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
                      Current Status: <strong style={{ color: "var(--green-700)" }}>{rescue.status}</strong>
                    </div>

                    <form
                      action={async (formData) => {
                        "use server";
                        const newStatus = formData.get("status") as string;
                        if (newStatus) {
                          await updateRescueStatus(rescue.id, newStatus);
                        }
                      }}
                      style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                    >
                      <select name="status" defaultValue={rescue.status} className="form-select" style={{ flex: 1, minWidth: 160 }}>
                        {availableStatuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button type="submit" className="btn btn-primary btn-sm">Update</button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
