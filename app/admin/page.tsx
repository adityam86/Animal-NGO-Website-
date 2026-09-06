import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Activity, Users, IndianRupee, Heart, ShieldAlert, CheckCircle, Clock } from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    totalAnimals,
    activeRescues,
    totalVolunteers,
    donationsAgg,
    recentRescues,
    totalAdoptions,
    totalSponsorships,
    recentAdoptions
  ] = await Promise.all([
    prisma.animal.count(),
    prisma.rescueCase.count({ where: { status: { not: "Completed" } } }),
    prisma.volunteer.count(),
    prisma.donation.aggregate({ _sum: { amount: true } }),
    prisma.rescueCase.findMany({
      take: 5,
      orderBy: { reportedAt: 'desc' }
    }),
    prisma.adoptionApplication.count(),
    prisma.sponsorship.count(),
    prisma.adoptionApplication.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { animal: true }
    })
  ]);

  const totalDonations = donationsAgg._sum.amount || 0;

  return (
    <div>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.35rem, 3vw, 1.85rem)", marginBottom: "0.35rem", lineHeight: 1.2 }}>
            Operations Command Dashboard
          </h1>
          <p style={{ color: "var(--stone-500)", margin: 0, fontSize: "0.9rem" }}>
            Real-time rescue monitoring, animal status overview, and community engagement.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href="/admin/rescues" className="btn btn-emergency btn-sm" style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}>
            🚨 Dispatch
          </Link>
          <Link href="/admin/animals/new" className="btn btn-primary btn-sm" style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}>
            + Intake
          </Link>
        </div>
      </div>

      {/* Stats Grid with Mobile 2-Column Adaptation */}
      <div className="admin-stats-grid">
        <StatCard title="Animals Rescued" value={totalAnimals} icon={<Heart size={20} />} accentColor="#22c55e" />
        <StatCard title="Active Rescues" value={activeRescues} icon={<ShieldAlert size={20} />} accentColor="#f97316" />
        <StatCard title="Adoption Requests" value={totalAdoptions} icon={<Users size={20} />} accentColor="#3b82f6" />
        <StatCard title="Sponsorships" value={totalSponsorships} icon={<CheckCircle size={20} />} accentColor="#10b981" />
        <StatCard title="Volunteers" value={totalVolunteers} icon={<Users size={20} />} accentColor="#8b5cf6" />
        <StatCard title="Donations" value={`₹${totalDonations.toLocaleString('en-IN')}`} icon={<IndianRupee size={20} />} accentColor="#eab308" />
      </div>

      {/* Activity Feeds */}
      <div className="admin-feeds-grid">
        {/* Recent Rescues */}
        <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--cream-200)", padding: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🚨</span>
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Recent Incidents</h2>
            </div>
            <Link href="/admin/rescues" style={{ color: "var(--saffron-600)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem", textDecoration: "none", fontSize: "0.8rem" }}>
              View All <ArrowRight size={13} />
            </Link>
          </div>
          
          {recentRescues.length === 0 ? (
            <p style={{ color: "var(--stone-500)", fontStyle: "italic", fontSize: "0.88rem" }}>No recent rescues reported.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentRescues.map(rescue => {
                const isCritical = rescue.emergencyLevel === "Critical";
                return (
                  <div
                    key={rescue.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.85rem 0.95rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--cream-200)",
                      background: "var(--cream-50)",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <div style={{ minWidth: 160, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--stone-800)" }}>
                        {rescue.animalType} • #{rescue.id.slice(-6).toUpperCase()}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--stone-500)", marginTop: "0.15rem" }}>
                        📍 {rescue.location}
                      </div>
                    </div>
                    <div>
                      <span style={{
                        padding: "0.22rem 0.6rem",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: isCritical ? "rgba(239, 68, 68, 0.12)" : "rgba(249, 115, 22, 0.12)",
                        color: isCritical ? "#dc2626" : "#ea580c",
                        border: isCritical ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(249, 115, 22, 0.3)",
                        whiteSpace: "nowrap",
                      }}>
                        {rescue.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Adoptions */}
        <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--cream-200)", padding: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🐾</span>
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Adoptions</h2>
            </div>
            <Link href="/admin/adoption" style={{ color: "var(--saffron-600)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem", textDecoration: "none", fontSize: "0.8rem" }}>
              View All <ArrowRight size={13} />
            </Link>
          </div>
          
          {recentAdoptions.length === 0 ? (
            <p style={{ color: "var(--stone-500)", fontStyle: "italic", fontSize: "0.88rem" }}>No adoption applications pending.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentAdoptions.map(app => (
                <div
                  key={app.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.85rem 0.95rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--cream-200)",
                    background: "var(--cream-50)",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ minWidth: 160, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--stone-800)" }}>
                      {app.applicantName}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--stone-500)", marginTop: "0.15rem" }}>
                      Target: {app.animal?.name || "Companion"} • {app.homeType}
                    </div>
                  </div>
                  <div>
                    <span style={{
                      padding: "0.22rem 0.6rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background: app.status === "Approved" || app.status === "Adopted" ? "rgba(34, 197, 94, 0.12)" : "rgba(59, 130, 246, 0.12)",
                      color: app.status === "Approved" || app.status === "Adopted" ? "#16a34a" : "#2563eb",
                      border: app.status === "Approved" || app.status === "Adopted" ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(59, 130, 246, 0.3)",
                      whiteSpace: "nowrap",
                    }}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  accentColor,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div
      className="admin-stat-card"
      style={{
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            background: `${accentColor}18`,
            color: accentColor,
            padding: "0.45rem",
            borderRadius: "var(--radius-md)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--stone-500)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {title}
        </div>
      </div>
      <div>
        <div className="admin-stat-value">
          {value}
        </div>
      </div>
    </div>
  );
}
