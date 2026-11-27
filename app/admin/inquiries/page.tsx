import prisma from "@/lib/prisma";
import Link from "next/link";
import { updateContactInquiryStatus } from "../actions";
import type { Prisma } from "@prisma/client";

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const status = sp.status?.trim() || "All";

  const where: Prisma.ContactInquiryWhereInput = {};
  if (status && status !== "All") {
    where.status = status;
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  const inquiries = await prisma.contactInquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>Contact Inquiries</h1>
        <p style={{ color: "var(--stone-500)", margin: 0 }}>
          Review and track messages received via the public Contact form.
        </p>
      </div>

      {/* Filter Bar */}
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
          placeholder="Search name, email, topic, or message..."
          className="form-input"
          style={{ flex: 1, minWidth: 200 }}
        />
        <select name="status" defaultValue={status} className="form-select" style={{ width: 170 }}>
          <option value="All">All Statuses</option>
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Archived">Archived</option>
        </select>
        <button type="submit" className="btn btn-primary btn-sm">
          Filter
        </button>
        {(q || status !== "All") && (
          <Link href="/admin/inquiries" className="btn btn-outline btn-sm">
            Reset
          </Link>
        )}
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {inquiries.length === 0 ? (
          <div
            style={{
              background: "var(--color-surface)",
              padding: "3rem",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--cream-200)",
              textAlign: "center",
              color: "var(--stone-500)",
            }}
          >
            No inquiries match your filter.
          </div>
        ) : (
          inquiries.map((inq) => (
            <div
              key={inq.id}
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--cream-200)",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--stone-900)" }}>
                    {inq.subject}
                  </div>
                  <div style={{ fontSize: "0.84rem", color: "var(--stone-600)", marginTop: "0.2rem" }}>
                    From <strong>{inq.name}</strong> ({inq.email}
                    {inq.phone ? ` • ${inq.phone}` : ""}) •{" "}
                    {inq.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <span
                  style={{
                    padding: "0.25rem 0.7rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background:
                      inq.status === "Resolved"
                        ? "var(--green-100)"
                        : inq.status === "In Progress"
                        ? "hsl(210, 85%, 94%)"
                        : "var(--saffron-100)",
                    color:
                      inq.status === "Resolved"
                        ? "var(--green-700)"
                        : inq.status === "In Progress"
                        ? "hsl(210, 80%, 35%)"
                        : "var(--saffron-800)",
                  }}
                >
                  {inq.status}
                </span>
              </div>

              <p
                style={{
                  background: "var(--cream-50)",
                  padding: "0.9rem 1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--cream-200)",
                  fontSize: "0.9rem",
                  color: "var(--stone-700)",
                  marginBottom: "1rem",
                  lineHeight: 1.6,
                }}
              >
                {inq.message}
              </p>

              <form
                action={updateContactInquiryStatus.bind(null, inq.id)}
                style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}
              >
                <select name="status" defaultValue={inq.status} className="form-select" style={{ width: 160 }}>
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Archived">Archived</option>
                </select>
                <input
                  name="adminNotes"
                  defaultValue={inq.adminNotes || ""}
                  placeholder="Internal staff follow-up notes..."
                  className="form-input"
                  style={{ flex: 1, minWidth: 220 }}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Update Inquiry
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
