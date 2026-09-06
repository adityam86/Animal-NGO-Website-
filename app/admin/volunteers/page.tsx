import prisma from "@/lib/prisma";
import { updateVolunteerStatus } from "../actions";

export default async function AdminVolunteersPage() {
  const volunteers = await prisma.volunteer.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Volunteers</h1>
          <p style={{ color: "var(--stone-500)" }}>Manage volunteer applications.</p>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--stone-100)", borderBottom: "1px solid var(--cream-200)", textAlign: "left" }}>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Name & Contact</th>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Location</th>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "1rem", fontSize: "0.85rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--stone-500)" }}>
                  No volunteer applications yet.
                </td>
              </tr>
            ) : volunteers.map((vol) => (
              <tr key={vol.id} style={{ borderBottom: "1px solid var(--cream-200)" }}>
                <td style={{ padding: "1rem" }}>
                  <div style={{ fontWeight: 600 }}>{vol.name} (Age: {vol.age})</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--stone-500)" }}>{vol.phone} | {vol.email}</div>
                </td>
                <td style={{ padding: "1rem", color: "var(--stone-600)" }}>{vol.location}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ 
                    padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700,
                    background: vol.status === "Approved" ? "var(--green-100)" : vol.status === "Rejected" ? "var(--red-100)" : "var(--saffron-100)",
                    color: vol.status === "Approved" ? "var(--green-700)" : vol.status === "Rejected" ? "var(--red-700)" : "var(--saffron-700)"
                  }}>
                    {vol.status}
                  </span>
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  {vol.status === "Pending" && (
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <form action={async () => { "use server"; await updateVolunteerStatus(vol.id, "Approved"); }}>
                        <button type="submit" style={{ background: "var(--green-100)", color: "var(--green-700)", border: "none", padding: "0.4rem 0.8rem", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>Approve</button>
                      </form>
                      <form action={async () => { "use server"; await updateVolunteerStatus(vol.id, "Rejected"); }}>
                        <button type="submit" style={{ background: "var(--red-100)", color: "var(--red-700)", border: "none", padding: "0.4rem 0.8rem", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>Reject</button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
