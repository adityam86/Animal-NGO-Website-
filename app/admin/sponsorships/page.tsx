import prisma from "@/lib/prisma";
import Link from "next/link";
import { Download } from "lucide-react";
import { updateSponsorshipStatus } from "../actions";
import type { Prisma } from "@prisma/client";

export default async function AdminSponsorshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const status = sp.status?.trim() || "All";

  const where: Prisma.SponsorshipWhereInput = {};
  if (status && status !== "All") {
    where.paymentStatus = status;
  }
  if (q) {
    where.OR = [
      { sponsorName: { contains: q, mode: "insensitive" } },
      { sponsorEmail: { contains: q, mode: "insensitive" } },
      { tier: { contains: q, mode: "insensitive" } },
    ];
  }

  const [sponsorships, completedAgg] = await Promise.all([
    prisma.sponsorship.findMany({
      where,
      include: { animal: { select: { id: true, name: true, type: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sponsorship.aggregate({
      where: { paymentStatus: "Completed" },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Sponsorships</h1>
          <p style={{ color: "var(--stone-500)", margin: 0 }}>
            Verified active sponsorships: <strong>{completedAgg._count.id}</strong> (₹
            {(completedAgg._sum.amount || 0).toLocaleString("en-IN")})
          </p>
        </div>
        <a href="/api/reports/sponsorships" download className="btn btn-outline btn-sm" style={{ gap: "0.45rem" }}>
          <Download size={14} /> Export CSV
        </a>
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
          placeholder="Search sponsor name, email, or tier..."
          className="form-input"
          style={{ flex: 1, minWidth: 200 }}
        />
        <select name="status" defaultValue={status} className="form-select" style={{ width: 170 }}>
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button type="submit" className="btn btn-primary btn-sm">
          Filter
        </button>
        {(q || status !== "All") && (
          <Link href="/admin/sponsorships" className="btn btn-outline btn-sm">
            Reset
          </Link>
        )}
      </form>

      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--cream-200)",
          overflow: "hidden",
        }}
      >
        <div className="admin-table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ background: "var(--stone-100)", borderBottom: "1px solid var(--cream-200)", textAlign: "left" }}>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--stone-600)" }}>Sponsor</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--stone-600)" }}>Animal &amp; Plan</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--stone-600)" }}>Payment Status</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--stone-600)" }}>Amount</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--stone-600)", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sponsorships.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2.5rem", textAlign: "center", color: "var(--stone-500)" }}>
                    No sponsorship records match your filter.
                  </td>
                </tr>
              ) : (
                sponsorships.map((spRow) => {
                  const isPaid = spRow.paymentStatus === "Completed";
                  const isFailed = spRow.paymentStatus === "Failed" || spRow.paymentStatus === "Cancelled";
                  return (
                    <tr key={spRow.id} style={{ borderBottom: "1px solid var(--cream-200)" }}>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 700 }}>{spRow.sponsorName}</div>
                        <div style={{ fontSize: "0.82rem", color: "var(--stone-500)" }}>
                          {spRow.sponsorEmail} • {spRow.sponsorPhone}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--stone-400)" }}>
                          {spRow.createdAt.toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 600 }}>
                          {spRow.animal ? `${spRow.animal.name} (${spRow.animal.type})` : "General Sanctuary Pool"}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "var(--stone-500)" }}>
                          {spRow.tier} • {spRow.frequency}
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.65rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: isPaid
                              ? "var(--green-100)"
                              : isFailed
                              ? "hsl(0, 85%, 94%)"
                              : "var(--saffron-100)",
                            color: isPaid
                              ? "var(--green-700)"
                              : isFailed
                              ? "hsl(0, 75%, 38%)"
                              : "var(--saffron-800)",
                          }}
                        >
                          {spRow.paymentStatus}
                        </span>
                        {spRow.razorpayPaymentId && (
                          <div style={{ fontSize: "0.72rem", color: "var(--stone-400)", marginTop: "0.25rem" }}>
                            Ref: {spRow.razorpayPaymentId}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "1rem", fontWeight: 700, color: "var(--green-700)" }}>
                        ₹{spRow.amount.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <form
                          action={async (formData) => {
                            "use server";
                            const next = String(formData.get("status") || "");
                            if (next) await updateSponsorshipStatus(spRow.id, next);
                          }}
                          style={{ display: "inline-flex", gap: "0.35rem" }}
                        >
                          <select
                            name="status"
                            defaultValue={spRow.paymentStatus}
                            className="form-select"
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.78rem", width: 120 }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Failed">Failed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button type="submit" className="btn btn-outline btn-sm" style={{ padding: "0.25rem 0.6rem" }}>
                            Save
                          </button>
                        </form>
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
