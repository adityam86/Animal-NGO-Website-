import prisma from "@/lib/prisma";
import Link from "next/link";
import { updateVolunteerStatus } from "../actions";
import type { Prisma } from "@prisma/client";

export default async function AdminVolunteersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const status = sp.status?.trim() || "All";

  const where: Prisma.VolunteerWhereInput = {};
  if (status !== "All") {
    where.status = status;
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }

  const volunteers = await prisma.volunteer.findMany({
    where,
    include: {
      roles: true,
      availabilities: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>Volunteers ({volunteers.length})</h1>
        <p style={{ color: "var(--stone-500)", margin: 0 }}>
          Review volunteer roles, shift availabilities, and approve active field helpers.
        </p>
      </div>

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
          placeholder="Search volunteer name, email, or city..."
          className="form-input"
          style={{ flex: 1, minWidth: 200 }}
        />
        <select name="status" defaultValue={status} className="form-select" style={{ width: 175 }}>
          <option value="All">All Statuses</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Active">Active</option>
          <option value="Declined">Declined</option>
        </select>
        <button type="submit" className="btn btn-primary btn-sm">Filter</button>
        {(q || status !== "All") && (
          <Link href="/admin/volunteers" className="btn btn-outline btn-sm">Reset</Link>
        )}
      </form>

      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", overflow: "hidden" }}>
        <div className="admin-table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
            <thead>
              <tr style={{ background: "var(--stone-100)", borderBottom: "1px solid var(--cream-200)", textAlign: "left" }}>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Volunteer</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Roles &amp; Availability</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "2.5rem", textAlign: "center", color: "var(--stone-500)" }}>
                    No volunteer applications match your filter.
                  </td>
                </tr>
              ) : (
                volunteers.map((vol) => {
                  const isApproved = vol.status === "Approved" || vol.status === "Active";
                  const isRejected = vol.status === "Rejected" || vol.status === "Declined";

                  return (
                    <tr key={vol.id} style={{ borderBottom: "1px solid var(--cream-200)", verticalAlign: "top" }}>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 700 }}>
                          {vol.name} <span style={{ fontWeight: 500, color: "var(--stone-500)" }}>(Age {vol.age})</span>
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "var(--stone-500)", marginTop: "0.15rem" }}>
                          {vol.phone} • {vol.email}
                        </div>
                        {vol.location && (
                          <div style={{ fontSize: "0.78rem", color: "var(--stone-400)", marginTop: "0.15rem" }}>
                            📍 {vol.location}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.4rem" }}>
                          {vol.roles.length > 0 ? (
                            vol.roles.map((r) => (
                              <span
                                key={r.id}
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 600,
                                  padding: "0.15rem 0.55rem",
                                  borderRadius: "var(--radius-full)",
                                  background: "var(--green-50)",
                                  color: "var(--green-800)",
                                  border: "1px solid var(--green-100)",
                                }}
                              >
                                {r.role}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: "0.78rem", color: "var(--stone-400)" }}>No roles specified</span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.76rem", color: "var(--stone-500)" }}>
                          Shifts:{" "}
                          {vol.availabilities.length > 0
                            ? vol.availabilities.map((a) => a.availability).join(", ")
                            : "Flexible"}
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.7rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: isApproved
                              ? "var(--green-100)"
                              : isRejected
                              ? "hsl(0, 85%, 94%)"
                              : "var(--saffron-100)",
                            color: isApproved
                              ? "var(--green-700)"
                              : isRejected
                              ? "hsl(0, 75%, 40%)"
                              : "var(--saffron-800)",
                          }}
                        >
                          {vol.status}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.45rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {!isApproved && (
                            <form
                              action={async () => {
                                "use server";
                                await updateVolunteerStatus(vol.id, "Approved");
                              }}
                            >
                              <button
                                type="submit"
                                style={{
                                  background: "var(--green-100)",
                                  color: "var(--green-800)",
                                  border: "1px solid var(--green-200)",
                                  padding: "0.35rem 0.75rem",
                                  borderRadius: "var(--radius-md)",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  fontSize: "0.8rem",
                                }}
                              >
                                Approve
                              </button>
                            </form>
                          )}
                          {!isRejected && (
                            <form
                              action={async () => {
                                "use server";
                                await updateVolunteerStatus(vol.id, "Declined");
                              }}
                            >
                              <button
                                type="submit"
                                style={{
                                  background: "transparent",
                                  color: "hsl(0, 72%, 42%)",
                                  border: "1px solid hsl(0, 65%, 85%)",
                                  padding: "0.35rem 0.7rem",
                                  borderRadius: "var(--radius-md)",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  fontSize: "0.8rem",
                                }}
                              >
                                Decline
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
