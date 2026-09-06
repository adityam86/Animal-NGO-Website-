import prisma from "@/lib/prisma";
import { updateRescueStatus } from "../actions";

export default async function AdminRescuesPage() {
  const rescues = await prisma.rescueCase.findMany({
    include: { history: true },
    orderBy: { reportedAt: 'desc' }
  });

  const availableStatuses = [
    "Report Received",
    "Assigned to Team",
    "Team Dispatched",
    "Rescued",
    "In Treatment",
    "Completed"
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Rescue Cases</h1>
          <p style={{ color: "var(--stone-500)" }}>Manage emergency rescue cases and update their statuses.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {rescues.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", color: "var(--stone-500)" }}>
            No rescue cases reported yet.
          </div>
        ) : rescues.map(rescue => (
          <div key={rescue.id} style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", borderBottom: "1px solid var(--cream-200)", background: "var(--stone-50)" }}>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--stone-400)", marginBottom: "0.25rem" }}>CASE ID: {rescue.id}</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--stone-800)" }}>{rescue.animalType} at {rescue.location}</div>
              </div>
              <div style={{ 
                padding: "0.5rem 1rem", borderRadius: "var(--radius-full)", fontSize: "0.85rem", fontWeight: 700,
                background: rescue.emergencyLevel === "Critical" ? "var(--red-100)" : rescue.emergencyLevel === "High" ? "var(--saffron-100)" : "var(--green-100)",
                color: rescue.emergencyLevel === "Critical" ? "var(--red-700)" : rescue.emergencyLevel === "High" ? "var(--saffron-700)" : "var(--green-700)"
              }}>
                {rescue.emergencyLevel} Priority
              </div>
            </div>
            
            <div style={{ padding: "1.5rem", display: "flex", gap: "2rem" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "0.95rem", marginBottom: "0.75rem", color: "var(--stone-500)" }}>Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.5rem 1.5rem", fontSize: "0.95rem" }}>
                  <div style={{ fontWeight: 600 }}>Location:</div>
                  <div>
                    {rescue.location}
                    {(() => {
                      const match = rescue.location?.match(/GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
                      if (match) {
                        return (
                          <div style={{ marginTop: "4px" }}>
                            <a
                              href={`https://www.google.com/maps?q=${match[1]},${match[2]}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "0.8rem",
                                color: "var(--saffron-600)",
                                fontWeight: 700,
                                textDecoration: "none",
                              }}
                            >
                              📍 Open Live GPS in Google Maps ↗
                            </a>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div style={{ fontWeight: 600 }}>Team:</div>
                  <div>{rescue.assignedTeam}</div>
                  <div style={{ fontWeight: 600 }}>Description:</div>
                  <div>
                    {(() => {
                      const photoMatch = rescue.description?.match(/\[Incident Photo:\s*([^\]]+)\]/);
                      const cleanDesc = rescue.description?.replace(/\[Incident Photo:\s*[^\]]+\]/, "").trim();
                      const photoUrl = photoMatch ? photoMatch[1].trim() : null;
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <span style={{ color: "var(--stone-600)" }}>{cleanDesc || rescue.description || "N/A"}</span>
                          {photoUrl && (
                            <div style={{ marginTop: "4px" }}>
                              <a href={photoUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
                                <img
                                  src={photoUrl}
                                  alt="Incident photo"
                                  style={{
                                    height: "80px",
                                    width: "auto",
                                    maxWidth: "180px",
                                    objectFit: "cover",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--cream-300)",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                  }}
                                />
                              </a>
                              <div style={{ fontSize: "0.75rem", color: "var(--stone-400)", marginTop: "2px" }}>📷 Click to enlarge</div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div style={{ flex: 1, borderLeft: "1px solid var(--cream-200)", paddingLeft: "2rem" }}>
                <h3 style={{ fontSize: "0.95rem", marginBottom: "0.75rem", color: "var(--stone-500)" }}>Update Status</h3>
                <div style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Current Status: <strong style={{ color: "var(--saffron-600)" }}>{rescue.status}</strong>
                </div>
                
                <form action={async (formData) => {
                  "use server";
                  const newStatus = formData.get("status") as string;
                  if (newStatus) {
                    await updateRescueStatus(rescue.id, newStatus);
                  }
                }} style={{ display: "flex", gap: "0.5rem" }}>
                  <select name="status" className="form-input" style={{ flex: 1, padding: "0.5rem" }}>
                    <option value="">Select next status...</option>
                    {availableStatuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button type="submit" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>Update</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
