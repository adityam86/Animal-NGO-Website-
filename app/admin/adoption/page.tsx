import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { approveAdoption, scheduleAdoptionVisit, rejectAdoption, updateAdoptionStatus } from "./actions";
import { Check, Calendar, X, Heart, Home, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Adoption Applications | Admin",
};

export default async function AdminAdoptionPage() {
  const applications = await prisma.adoptionApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: { animal: true },
  });

  const total = applications.length;
  const pending = applications.filter((a) => a.status === "Pending" || a.status === "Under Review").length;
  const scheduled = applications.filter((a) => a.status === "Interview Scheduled" || a.status === "Interview").length;
  const approved = applications.filter((a) => a.status === "Approved" || a.status === "Adopted").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Adoption Application Review</h1>
          <p style={{ color: "var(--stone-500)", margin: 0 }}>
            Evaluate prospective pet parents, schedule visits, and finalize adoptions with one click.
          </p>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Applications</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--stone-900)", marginTop: "0.25rem" }}>{total}</div>
        </div>
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--saffron-700)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pending Review</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--saffron-600)", marginTop: "0.25rem" }}>{pending}</div>
        </div>
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "hsl(210, 80%, 40%)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Visits Scheduled</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "hsl(210, 80%, 45%)", marginTop: "0.25rem" }}>{scheduled}</div>
        </div>
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--green-700)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Approved / Adopted</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--green-600)", marginTop: "0.25rem" }}>{approved}</div>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: "white", borderRadius: "var(--radius-xl)", border: "1px solid var(--cream-200)", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--cream-100)", borderBottom: "1px solid var(--cream-200)" }}>
                <th style={{ padding: "1rem 1.25rem", fontSize: "0.78rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Applicant</th>
                <th style={{ padding: "1rem 1.25rem", fontSize: "0.78rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Target Animal</th>
                <th style={{ padding: "1rem 1.25rem", fontSize: "0.78rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Home & Background</th>
                <th style={{ padding: "1rem 1.25rem", fontSize: "0.78rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "1rem 1.25rem", fontSize: "0.78rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>Workflow Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--stone-500)" }}>
                    No adoption applications submitted yet.
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const isApproved = app.status === "Approved" || app.status === "Adopted";
                  const isRejected = app.status === "Rejected";
                  const isScheduled = app.status === "Interview Scheduled" || app.status === "Interview";

                  return (
                    <tr key={app.id} style={{ borderBottom: "1px solid var(--cream-200)", verticalAlign: "top" }}>
                      {/* Applicant */}
                      <td style={{ padding: "1.25rem" }}>
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--stone-900)" }}>
                          {app.applicantName}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "var(--stone-500)", marginTop: "0.2rem" }}>
                          Age: {app.age} • {app.occupation}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "var(--stone-600)", marginTop: "0.35rem" }}>
                          📞 <a href={`tel:${app.phone}`} style={{ color: "inherit", textDecoration: "underline" }}>{app.phone}</a>
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "var(--stone-600)" }}>
                          ✉️ <a href={`mailto:${app.email}`} style={{ color: "inherit", textDecoration: "underline" }}>{app.email}</a>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--stone-400)", marginTop: "0.35rem" }}>
                          Submitted {new Date(app.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </td>

                      {/* Animal */}
                      <td style={{ padding: "1.25rem" }}>
                        {app.animal ? (
                          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                            <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", overflow: "hidden", position: "relative", flexShrink: 0, background: "var(--cream-100)" }}>
                              {app.animal.image && (
                                <Image src={app.animal.image} alt={app.animal.name} fill style={{ objectFit: "cover" }} />
                              )}
                            </div>
                            <div>
                              <Link href={`/animals/${app.animal.id}`} target="_blank" style={{ fontWeight: 700, color: "var(--saffron-700)", textDecoration: "none" }}>
                                {app.animal.name} ↗
                              </Link>
                              <div style={{ fontSize: "0.78rem", color: "var(--stone-500)" }}>
                                {app.animal.type} • {app.animal.breed}
                              </div>
                              <div style={{ marginTop: "0.2rem" }}>
                                <span style={{
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  padding: "0.15rem 0.5rem",
                                  borderRadius: "var(--radius-full)",
                                  background: app.animal.status === "Adopted" ? "var(--green-100)" : "var(--cream-200)",
                                  color: app.animal.status === "Adopted" ? "var(--green-700)" : "var(--stone-700)"
                                }}>
                                  Animal Status: {app.animal.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: "var(--stone-500)", fontStyle: "italic", fontSize: "0.85rem" }}>
                            General Inquiry (Any companion)
                          </span>
                        )}
                      </td>

                      {/* Home & Background */}
                      <td style={{ padding: "1.25rem", maxWidth: "260px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--stone-800)" }}>
                          <Home size={14} style={{ color: "var(--saffron-600)" }} /> {app.homeType} ({app.familyMembers} family members)
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--stone-600)", marginTop: "0.25rem" }}>
                          Has other pets: <strong>{app.hasPets ? "Yes" : "No"}</strong>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--stone-500)", marginTop: "0.25rem" }}>
                          📍 {app.address}
                        </div>
                        {app.reason && (
                          <div style={{
                            marginTop: "0.5rem",
                            padding: "0.5rem 0.65rem",
                            background: "var(--cream-50)",
                            borderLeft: "3px solid var(--saffron-400)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.78rem",
                            color: "var(--stone-700)",
                            lineHeight: 1.4
                          }}>
                            &ldquo;{app.reason}&rdquo;
                          </div>
                        )}
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: "1.25rem" }}>
                        <div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              padding: "0.35rem 0.75rem",
                              borderRadius: "var(--radius-full)",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              background: isApproved
                                ? "var(--green-100)"
                                : isRejected
                                ? "hsl(0, 85%, 95%)"
                                : isScheduled
                                ? "hsl(210, 85%, 94%)"
                                : "var(--saffron-100)",
                              color: isApproved
                                ? "var(--green-700)"
                                : isRejected
                                ? "hsl(0, 75%, 40%)"
                                : isScheduled
                                ? "hsl(210, 80%, 35%)"
                                : "var(--saffron-800)",
                            }}
                          >
                            {isApproved && "🎉 "}
                            {isScheduled && "📅 "}
                            {isRejected && "❌ "}
                            {(!isApproved && !isScheduled && !isRejected) && "⏳ "}
                            {app.status}
                          </span>
                        </div>

                        {/* Quick Manual Override Form */}
                        <form
                          action={async (formData) => {
                            "use server";
                            const newStatus = formData.get("status") as string;
                            await updateAdoptionStatus(app.id, newStatus);
                          }}
                          style={{ marginTop: "0.6rem", display: "flex", gap: "0.3rem" }}
                        >
                          <select
                            name="status"
                            defaultValue={app.status}
                            style={{
                              padding: "0.2rem 0.4rem",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--cream-200)",
                              background: "white",
                              fontSize: "0.75rem",
                              color: "var(--stone-600)",
                              cursor: "pointer",
                            }}
                          >
                            <option>Pending</option>
                            <option>Under Review</option>
                            <option>Interview Scheduled</option>
                            <option>Approved</option>
                            <option>Rejected</option>
                            <option>Adopted</option>
                          </select>
                          <button
                            type="submit"
                            style={{
                              padding: "0.2rem 0.4rem",
                              background: "var(--stone-200)",
                              color: "var(--stone-700)",
                              border: "none",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Set
                          </button>
                        </form>
                      </td>

                      {/* 1-Click Workflow Actions */}
                      <td style={{ padding: "1.25rem", textAlign: "right" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", alignItems: "flex-end" }}>
                          {/* Approve & Mark Adopted */}
                          <form action={approveAdoption.bind(null, app.id)}>
                            <button
                              type="submit"
                              disabled={isApproved}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.35rem",
                                padding: "0.45rem 0.85rem",
                                background: isApproved ? "var(--green-50)" : "var(--green-600)",
                                color: isApproved ? "var(--green-700)" : "white",
                                border: isApproved ? "1px solid var(--green-200)" : "none",
                                borderRadius: "var(--radius-md)",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                cursor: isApproved ? "default" : "pointer",
                                opacity: isApproved ? 0.8 : 1,
                                transition: "all 0.2s",
                                boxShadow: isApproved ? "none" : "0 2px 6px rgba(22, 163, 74, 0.2)",
                              }}
                            >
                              <Check size={14} />
                              {isApproved ? "Approved & Adopted" : "Approve & Mark Adopted"}
                            </button>
                          </form>

                          {/* Schedule Visit */}
                          {!isApproved && !isRejected && (
                            <form action={scheduleAdoptionVisit.bind(null, app.id)}>
                              <button
                                type="submit"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  padding: "0.4rem 0.75rem",
                                  background: isScheduled ? "hsl(210, 85%, 94%)" : "white",
                                  color: "hsl(210, 80%, 35%)",
                                  border: "1px solid hsl(210, 70%, 80%)",
                                  borderRadius: "var(--radius-md)",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                <Calendar size={13} />
                                Schedule Shelter Visit
                              </button>
                            </form>
                          )}

                          {/* Reject */}
                          {!isRejected && (
                            <form action={rejectAdoption.bind(null, app.id)}>
                              <button
                                type="submit"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  padding: "0.35rem 0.7rem",
                                  background: "transparent",
                                  color: "hsl(0, 65%, 45%)",
                                  border: "1px solid hsl(0, 65%, 85%)",
                                  borderRadius: "var(--radius-md)",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                <X size={12} /> Reject Application
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
