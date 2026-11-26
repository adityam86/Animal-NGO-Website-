import prisma from "@/lib/prisma";
import Link from "next/link";
import { Download } from "lucide-react";
import type { Prisma } from "@prisma/client";

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const status = sp.status?.trim() || "All";

  const where: Prisma.DonationWhereInput = {};
  if (status && status !== "All") {
    where.paymentStatus = status;
  }
  if (q) {
    where.OR = [
      { donorName: { contains: q, mode: "insensitive" } },
      { donorEmail: { contains: q, mode: "insensitive" } },
      { purpose: { contains: q, mode: "insensitive" } },
      { razorpayPaymentId: { contains: q, mode: "insensitive" } },
    ];
  }

  const [donations, verifiedAgg, pendingCount] = await Promise.all([
    prisma.donation.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.donation.aggregate({
      where: { paymentStatus: "Completed" },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.donation.count({ where: { paymentStatus: "Pending" } }),
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
          <h1 style={{ marginBottom: "0.25rem" }}>Donations Ledger</h1>
          <p style={{ color: "var(--stone-500)", margin: 0 }}>
            Verified revenue: <strong>₹{(verifiedAgg._sum.amount || 0).toLocaleString("en-IN")}</strong> ({verifiedAgg._count.id} paid • {pendingCount} pending)
          </p>
        </div>
        <a href="/api/reports/donations" download className="btn btn-outline btn-sm" style={{ gap: "0.45rem" }}>
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
          placeholder="Search donor name, email, purpose, or payment ref..."
          className="form-input"
          style={{ flex: 1, minWidth: 200 }}
        />
        <select name="status" defaultValue={status} className="form-select" style={{ width: 170 }}>
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
        <button type="submit" className="btn btn-primary btn-sm">Filter</button>
        {(q || status !== "All") && (
          <Link href="/admin/donations" className="btn btn-outline btn-sm">Reset</Link>
        )}
      </form>

      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", overflow: "hidden" }}>
        <div className="admin-table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 660 }}>
            <thead>
              <tr style={{ background: "var(--stone-100)", borderBottom: "1px solid var(--cream-200)", textAlign: "left" }}>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>ID &amp; Date</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Donor</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Purpose</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "0.9rem 1rem", fontSize: "0.8rem", color: "var(--stone-600)", fontWeight: 700, textTransform: "uppercase", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2.5rem", textAlign: "center", color: "var(--stone-500)" }}>
                    No donations match your filter.
                  </td>
                </tr>
              ) : (
                donations.map((donation) => {
                  const isCompleted = donation.paymentStatus === "Completed";
                  const isFailed = donation.paymentStatus === "Failed";
                  return (
                    <tr key={donation.id} style={{ borderBottom: "1px solid var(--cream-200)" }}>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{donation.id}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--stone-500)" }}>
                          {donation.createdAt.toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div style={{ fontWeight: 600 }}>{donation.donorName}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--stone-500)" }}>
                          {donation.donorEmail} • {donation.donorPhone}
                        </div>
                        {donation.donorPan && (
                          <div style={{ fontSize: "0.74rem", color: "var(--stone-400)" }}>PAN: {donation.donorPan}</div>
                        )}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", color: "var(--stone-600)" }}>
                        <div>{donation.purpose}</div>
                        <span style={{ fontSize: "0.72rem", background: "var(--cream-100)", padding: "0.12rem 0.45rem", borderRadius: "var(--radius-full)", display: "inline-block", marginTop: "0.2rem" }}>
                          {donation.frequency}
                        </span>
                      </td>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span
                          style={{
                            padding: "0.22rem 0.65rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: isCompleted
                              ? "var(--green-100)"
                              : isFailed
                              ? "hsl(0, 85%, 94%)"
                              : "var(--saffron-100)",
                            color: isCompleted
                              ? "var(--green-700)"
                              : isFailed
                              ? "hsl(0, 75%, 40%)"
                              : "var(--saffron-800)",
                          }}
                        >
                          {donation.paymentStatus}
                        </span>
                        {donation.razorpayPaymentId && (
                          <div style={{ fontSize: "0.72rem", color: "var(--stone-400)", marginTop: "0.2rem" }}>
                            {donation.razorpayPaymentId}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", textAlign: "right", fontWeight: 700, color: "var(--green-700)", fontSize: "1.05rem" }}>
                        ₹{donation.amount.toLocaleString("en-IN")}
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
