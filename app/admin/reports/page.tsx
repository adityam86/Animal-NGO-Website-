import prisma from "@/lib/prisma";
import { Download, FileText, TrendingUp, ShieldAlert, Heart, HeartHandshake } from "lucide-react";

export default async function AdminReportsPage() {
  const [
    completedDonationsCount,
    pendingDonationsCount,
    failedDonationsCount,
    completedDonationsSum,
    completedSponsorshipsCount,
    completedSponsorshipsSum,
    rescuesCount,
    completedRescuesCount,
    adoptionsCount,
    adoptionsApprovedCount,
    donationsByPurpose,
    rescuesByType,
  ] = await Promise.all([
    prisma.donation.count({ where: { paymentStatus: "Completed" } }),
    prisma.donation.count({ where: { paymentStatus: "Pending" } }),
    prisma.donation.count({ where: { paymentStatus: "Failed" } }),
    prisma.donation.aggregate({
      where: { paymentStatus: "Completed" },
      _sum: { amount: true },
    }),
    prisma.sponsorship.count({ where: { paymentStatus: "Completed" } }),
    prisma.sponsorship.aggregate({
      where: { paymentStatus: "Completed" },
      _sum: { amount: true },
    }),
    prisma.rescueCase.count(),
    prisma.rescueCase.count({ where: { status: { in: ["Completed", "Closed"] } } }),
    prisma.adoptionApplication.count(),
    prisma.adoptionApplication.count({ where: { status: { in: ["Approved", "Adopted"] } } }),
    prisma.donation.groupBy({
      by: ["purpose"],
      where: { paymentStatus: "Completed" },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.rescueCase.groupBy({
      by: ["animalType"],
      _count: { id: true },
    }),
  ]);

  const totalDonated = completedDonationsSum._sum.amount || 0;
  const totalSponsored = completedSponsorshipsSum._sum.amount || 0;
  const conversionRate =
    adoptionsCount > 0 ? Math.round((adoptionsApprovedCount / adoptionsCount) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>Reports &amp; Export</h1>
        <p style={{ color: "var(--stone-500)" }}>
          Verified revenue performance, rescue outcomes, and authenticated CSV ledger exports.
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem",
        }}
      >
        <div style={{ background: "var(--color-surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--stone-500)" }}>Verified Donations</span>
            <TrendingUp size={20} color="var(--green-600)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--stone-800)", fontFamily: "var(--font-display)" }}>
            ₹{totalDonated.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--stone-500)", marginTop: "0.25rem" }}>
            {completedDonationsCount} paid • {pendingDonationsCount} pending • {failedDonationsCount} failed
          </div>
        </div>

        <div style={{ background: "var(--color-surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--stone-500)" }}>Verified Sponsorships</span>
            <HeartHandshake size={20} color="#0d9488" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--stone-800)", fontFamily: "var(--font-display)" }}>
            ₹{totalSponsored.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--stone-500)", marginTop: "0.25rem" }}>
            {completedSponsorshipsCount} active verified sponsors
          </div>
        </div>

        <div style={{ background: "var(--color-surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--stone-500)" }}>Rescues Handled</span>
            <ShieldAlert size={20} color="var(--saffron-600)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--stone-800)", fontFamily: "var(--font-display)" }}>
            {rescuesCount}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--stone-500)", marginTop: "0.25rem" }}>
            {completedRescuesCount} completed / closed cases
          </div>
        </div>

        <div style={{ background: "var(--color-surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--stone-500)" }}>Adoption Match Rate</span>
            <Heart size={20} color="#2563eb" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--stone-800)", fontFamily: "var(--font-display)" }}>
            {conversionRate}%
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--stone-500)", marginTop: "0.25rem" }}>
            {adoptionsApprovedCount} of {adoptionsCount} applications approved
          </div>
        </div>
      </div>

      {/* CSV Downloads Section */}
      <div style={{ background: "var(--color-surface)", padding: "1.75rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1.25rem" }}>📥 Export Authenticated CSV Ledgers</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
          {[
            {
              title: "Donations Ledger",
              desc: "Verified payments, pending/failed audit trail, donor PAN references, and transaction IDs.",
              href: "/api/reports/donations",
            },
            {
              title: "Sponsorships Ledger",
              desc: "Recurring and one-time animal sponsorships, plan tiers, and payment statuses.",
              href: "/api/reports/sponsorships",
            },
            {
              title: "Rescue Cases Tracker",
              desc: "Reported field emergencies, locations, assigned rescue teams, and resolution statuses.",
              href: "/api/reports/rescues",
            },
            {
              title: "Adoption Applications",
              desc: "Prospective adopter questionnaires, home details, target animals, and interview status.",
              href: "/api/reports/adoptions",
            },
          ].map((card) => (
            <div
              key={card.href}
              style={{
                padding: "1.35rem",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--cream-200)",
                background: "var(--cream-50)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1rem", marginBottom: "0.45rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FileText size={17} /> {card.title}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--stone-500)", margin: 0 }}>{card.desc}</p>
              </div>
              <a href={card.href} download className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start", gap: "0.5rem" }}>
                <Download size={14} /> Download CSV
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Categorized Stats Charts */}
      <div className="admin-split-1-1">
        {/* Completed Donations by Purpose */}
        <div style={{ background: "var(--color-surface)", padding: "1.75rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>💰 Verified Funds Allocation</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {donationsByPurpose.map((item) => {
              const amount = item._sum.amount || 0;
              const percent = totalDonated > 0 ? Math.round((amount / totalDonated) * 100) : 0;
              return (
                <div key={item.purpose}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--stone-700)", marginBottom: "0.25rem" }}>
                    <span>
                      {item.purpose} ({item._count.id} verified)
                    </span>
                    <strong>
                      ₹{amount.toLocaleString("en-IN")} ({percent}%)
                    </strong>
                  </div>
                  <div style={{ height: 7, background: "var(--cream-100)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${percent}%`, background: "var(--green-600)", borderRadius: "var(--radius-full)" }} />
                  </div>
                </div>
              );
            })}
            {donationsByPurpose.length === 0 && (
              <p style={{ fontSize: "0.85rem", color: "var(--stone-400)" }}>No verified completed donation data yet.</p>
            )}
          </div>
        </div>

        {/* Rescues by Animal Type */}
        <div style={{ background: "var(--color-surface)", padding: "1.75rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>🏥 Rescues by Animal Class</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {rescuesByType.map((item) => {
              const count = item._count.id;
              const percent = rescuesCount > 0 ? Math.round((count / rescuesCount) * 100) : 0;
              return (
                <div key={item.animalType}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--stone-700)", marginBottom: "0.25rem" }}>
                    <span>{item.animalType}</span>
                    <strong>
                      {count} cases ({percent}%)
                    </strong>
                  </div>
                  <div style={{ height: 7, background: "var(--cream-100)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${percent}%`, background: "var(--saffron-500)", borderRadius: "var(--radius-full)" }} />
                  </div>
                </div>
              );
            })}
            {rescuesByType.length === 0 && (
              <p style={{ fontSize: "0.85rem", color: "var(--stone-400)" }}>No rescue case data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
