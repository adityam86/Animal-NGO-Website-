import prisma from "@/lib/prisma";
import Link from "next/link";
import { Download, FileText, TrendingUp, ShieldAlert, Heart, Activity } from "lucide-react";

export default async function AdminReportsPage() {
  const [
    donationsCount,
    donationsSum,
    rescuesCount,
    adoptionsCount,
    adoptionsApprovedCount,
    donationsByPurpose,
    rescuesByType
  ] = await Promise.all([
    prisma.donation.count(),
    prisma.donation.aggregate({ _sum: { amount: true } }),
    prisma.rescueCase.count(),
    prisma.adoptionApplication.count(),
    prisma.adoptionApplication.count({ where: { status: "Adopted" } }),
    prisma.donation.groupBy({
      by: ["purpose"],
      _sum: { amount: true },
      _count: { id: true }
    }),
    prisma.rescueCase.groupBy({
      by: ["animalType"],
      _count: { id: true }
    })
  ]);

  const totalDonated = donationsSum._sum.amount || 0;
  const conversionRate = adoptionsCount > 0 
    ? Math.round((adoptionsApprovedCount / adoptionsCount) * 100) 
    : 0;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>Reports & Export</h1>
        <p style={{ color: "var(--stone-500)" }}>Analyze platform performance, track KPIs, and export system data to CSV.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--stone-500)" }}>Total Funds Raised</span>
            <TrendingUp size={20} color="var(--green-500)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--stone-800)", fontFamily: "var(--font-display)" }}>
            ₹{totalDonated.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--stone-500)", marginTop: "0.25rem" }}>From {donationsCount} donations</div>
        </div>

        <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--stone-500)" }}>Total Rescues Logged</span>
            <ShieldAlert size={20} color="var(--saffron-500)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--stone-800)", fontFamily: "var(--font-display)" }}>
            {rescuesCount}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--stone-500)", marginTop: "0.25rem" }}>Emergency cases handled</div>
        </div>

        <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--stone-500)" }}>Adoption Match Rate</span>
            <Heart size={20} color="var(--blue-500)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--stone-800)", fontFamily: "var(--font-display)" }}>
            {conversionRate}%
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--stone-500)", marginTop: "0.25rem" }}>{adoptionsApprovedCount} of {adoptionsCount} applications</div>
        </div>
      </div>

      {/* CSV Downloads Section */}
      <div style={{ background: "white", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>📥 Export Raw Data to CSV</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          
          {/* Donations Report Card */}
          <div style={{ padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", background: "var(--cream-50)", display: "flex", flexDirection: "column", justifyContent: "space-between", height: 160 }}>
            <div>
              <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={18} /> Donations Ledger
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--stone-500)", margin: 0 }}>Full history of donations, sponsors, amounts, PAN cards, and statuses.</p>
            </div>
            <a href="/api/reports/donations" download className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start", gap: "0.5rem" }}>
              <Download size={14} /> Download CSV
            </a>
          </div>

          {/* Rescues Report Card */}
          <div style={{ padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", background: "var(--cream-50)", display: "flex", flexDirection: "column", justifyContent: "space-between", height: 160 }}>
            <div>
              <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={18} /> Rescue Cases Tracker
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--stone-500)", margin: 0 }}>All reported emergencies, locations, assigned teams, and statuses.</p>
            </div>
            <a href="/api/reports/rescues" download className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start", gap: "0.5rem" }}>
              <Download size={14} /> Download CSV
            </a>
          </div>

          {/* Adoptions Report Card */}
          <div style={{ padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)", background: "var(--cream-50)", display: "flex", flexDirection: "column", justifyContent: "space-between", height: 160 }}>
            <div>
              <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={18} /> Adoption Applications
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--stone-500)", margin: 0 }}>Full applicant information, target animals, home checks, and review status.</p>
            </div>
            <a href="/api/reports/adoptions" download className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start", gap: "0.5rem" }}>
              <Download size={14} /> Download CSV
            </a>
          </div>

        </div>
      </div>

      {/* Categorized Stats Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        
        {/* Donations by Purpose */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>💰 Allocation of Funds</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {donationsByPurpose.map((item) => {
              const amount = item._sum.amount || 0;
              const percent = totalDonated > 0 ? Math.round((amount / totalDonated) * 100) : 0;
              return (
                <div key={item.purpose}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--stone-700)", marginBottom: "0.25rem" }}>
                    <span>{item.purpose} ({item._count.id} transactions)</span>
                    <strong>₹{amount.toLocaleString("en-IN")} ({percent}%)</strong>
                  </div>
                  <div style={{ height: 6, background: "var(--cream-100)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${percent}%`, background: "var(--saffron-500)", borderRadius: "var(--radius-full)" }} />
                  </div>
                </div>
              );
            })}
            {donationsByPurpose.length === 0 && <p style={{ fontSize: "0.85rem", color: "var(--stone-400)" }}>No donation data available.</p>}
          </div>
        </div>

        {/* Rescues by Animal Type */}
        <div style={{ background: "white", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--cream-200)" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>🏥 Rescues by Animal Class</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {rescuesByType.map((item) => {
              const count = item._count.id;
              const percent = rescuesCount > 0 ? Math.round((count / rescuesCount) * 100) : 0;
              return (
                <div key={item.animalType}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--stone-700)", marginBottom: "0.25rem" }}>
                    <span>{item.animalType}</span>
                    <strong>{count} cases ({percent}%)</strong>
                  </div>
                  <div style={{ height: 6, background: "var(--cream-100)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${percent}%`, background: "var(--green-600)", borderRadius: "var(--radius-full)" }} />
                  </div>
                </div>
              );
            })}
            {rescuesByType.length === 0 && <p style={{ fontSize: "0.85rem", color: "var(--stone-400)" }}>No rescue case data available.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
