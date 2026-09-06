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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", marginBottom: "0.35rem" }}>Operations Command Dashboard</h1>
          <p style={{ color: "var(--stone-500)", margin: 0, fontSize: "0.95rem" }}>
            Real-time rescue monitoring, animal status overview, and community engagement.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/admin/rescues" className="btn btn-emergency btn-sm" style={{ fontSize: "0.82rem" }}>
            🚨 Emergency Dispatch
          </Link>
          <Link href="/admin/animals/new" className="btn btn-primary btn-sm" style={{ fontSize: "0.82rem" }}>
            + Intake Animal
          </Link>
        </div>
      </div>

      {/* Stats Grid with 3px Accent Lines */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        <StatCard title="Total Animals Rescued" value={totalAnimals} icon={<Heart size={22} />} accentColor="#22c55e" />
        <StatCard title="Active Rescues" value={activeRescues} icon={<ShieldAlert size={22} />} accentColor="#f97316" />
        <StatCard title="Adoption Requests" value={totalAdoptions} icon={<Users size={22} />} accentColor="#3b82f6" />
        <StatCard title="Active Sponsorships" value={totalSponsorships} icon={<CheckCircle size={22} />} accentColor="#10b981" />
        <StatCard title="Registered Volunteers" value={totalVolunteers} icon={<Users size={22} />} accentColor="#8b5cf6" />
        <StatCard title="Total Donations" value={`₹${totalDonations.toLocaleString('en-IN')}`} icon={<IndianRupee size={22} />} accentColor="#eab308" />
      </div>

      {/* Activity Feeds */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Recent Rescues */}
        <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--cream-200)", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🚨</span>
              <h2 style={{ fontSize: "1.15rem", margin: 0 }}>Recent Incidents</h2>
            </div>
            <Link href="/admin/rescues" style={{ color: "var(--saffron-600)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem", textDecoration: "none", fontSize: "0.82rem" }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          {recentRescues.length === 0 ? (
            <p style={{ color: "var(--stone-500)", fontStyle: "italic", fontSize: "0.9rem" }}>No recent rescues reported.</p>
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
                      padding: "0.9rem 1rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--cream-200)",
                      background: "var(--cream-50)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--stone-800)" }}>
                        {rescue.animalType} • Case #{rescue.id.slice(-6).toUpperCase()}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--stone-500)", marginTop: "0.2rem" }}>
                        📍 {rescue.location}
                      </div>
                    </div>
                    <div>
                      <span style={{
                        padding: "0.25rem 0.65rem",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: isCritical ? "rgba(239, 68, 68, 0.12)" : "rgba(249, 115, 22, 0.12)",
                        color: isCritical ? "#dc2626" : "#ea580c",
                        border: isCritical ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(249, 115, 22, 0.3)",
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
        <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--cream-200)", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🐾</span>
              <h2 style={{ fontSize: "1.15rem", margin: 0 }}>Adoption Applications</h2>
            </div>
            <Link href="/admin/adoption" style={{ color: "var(--saffron-600)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem", textDecoration: "none", fontSize: "0.82rem" }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          {recentAdoptions.length === 0 ? (
            <p style={{ color: "var(--stone-500)", fontStyle: "italic", fontSize: "0.9rem" }}>No adoption applications pending.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentAdoptions.map(app => (
                <div
                  key={app.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.9rem 1rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--cream-200)",
                    background: "var(--cream-50)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--stone-800)" }}>
                      {app.applicantName}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--stone-500)", marginTop: "0.2rem" }}>
                      Target: {app.animal?.name || "Any Companion"} • {app.homeType}
                    </div>
                  </div>
                  <div>
                    <span style={{
                      padding: "0.25rem 0.65rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      background: app.status === "Approved" || app.status === "Adopted" ? "rgba(34, 197, 94, 0.12)" : "rgba(59, 130, 246, 0.12)",
                      color: app.status === "Approved" || app.status === "Adopted" ? "#16a34a" : "#2563eb",
                      border: app.status === "Approved" || app.status === "Adopted" ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(59, 130, 246, 0.3)",
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
      style={{
        background: "var(--color-surface)",
        padding: "1.35rem 1.25rem",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--cream-200)",
        borderTop: `3px solid ${accentColor}`,
        display: "flex",
        alignItems: "flex-start",
        gap: "1rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      <div
        style={{
          background: `${accentColor}18`,
          color: accentColor,
          padding: "0.75rem",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: "0.74rem",
            fontWeight: 700,
            color: "var(--stone-500)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.25rem",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "var(--stone-900)",
            fontFamily: "var(--font-display)",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
