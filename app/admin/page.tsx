import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  IndianRupee,
  Heart,
  ShieldAlert,
  HeartHandshake,
  Inbox,
  CheckCircle2,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    totalAnimals,
    activeRescues,
    completedRescues,
    totalVolunteers,
    completedDonationsAgg,
    pendingDonationsCount,
    completedSponsorshipsAgg,
    activeSponsorshipsCount,
    totalAdoptions,
    openInquiriesCount,
    recentRescues,
    recentAdoptions,
  ] = await Promise.all([
    prisma.animal.count(),
    prisma.rescueCase.count({ where: { status: { notIn: ["Completed", "Closed"] } } }),
    prisma.rescueCase.count({ where: { status: { in: ["Completed", "Closed"] } } }),
    prisma.volunteer.count(),
    prisma.donation.aggregate({
      where: { paymentStatus: "Completed" },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.donation.count({ where: { paymentStatus: "Pending" } }),
    prisma.sponsorship.aggregate({
      where: { paymentStatus: "Completed" },
      _sum: { amount: true },
    }),
    prisma.sponsorship.count({ where: { paymentStatus: "Completed" } }),
    prisma.adoptionApplication.count(),
    prisma.contactInquiry.count({ where: { status: { in: ["New", "In Progress"] } } }),
    prisma.rescueCase.findMany({
      take: 5,
      orderBy: { reportedAt: "desc" },
    }),
    prisma.adoptionApplication.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { animal: true },
    }),
  ]);

  const verifiedDonationsSum =
    (completedDonationsAgg._sum.amount || 0) + (completedSponsorshipsAgg._sum.amount || 0);

  return (
    <div>
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "clamp(1.35rem, 3vw, 1.85rem)", marginBottom: "0.35rem", lineHeight: 1.2 }}>
            Operations Command Dashboard
          </h1>
          <p style={{ color: "var(--stone-500)", margin: 0, fontSize: "0.9rem" }}>
            Verified donations, live field rescues, shelter placements, and community outreach.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href="/admin/rescues" className="btn btn-emergency btn-sm" style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}>
            🚨 Dispatch ({activeRescues})
          </Link>
          <Link href="/admin/animals/new" className="btn btn-primary btn-sm" style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem" }}>
            + Intake Animal
          </Link>
        </div>
      </div>

      {/* Stats Grid with Mobile Adaptation */}
      <div className="admin-stats-grid">
        <StatCard
          title="Animals in Care"
          value={totalAnimals}
          sub={`${completedRescues} rescues closed`}
          icon={<Heart size={20} />}
          accentColor="#15803d"
        />
        <StatCard
          title="Active Rescues"
          value={activeRescues}
          sub="Dispatch queue open"
          icon={<ShieldAlert size={20} />}
          accentColor="#dc2626"
        />
        <StatCard
          title="Adoption Requests"
          value={totalAdoptions}
          sub="Screening pipeline"
          icon={<CheckCircle2 size={20} />}
          accentColor="#2563eb"
        />
        <StatCard
          title="Active Sponsors"
          value={activeSponsorshipsCount}
          sub={`₹${(completedSponsorshipsAgg._sum.amount || 0).toLocaleString("en-IN")} verified`}
          icon={<HeartHandshake size={20} />}
          accentColor="#0d9488"
        />
        <StatCard
          title="Volunteers"
          value={totalVolunteers}
          sub={`${openInquiriesCount} open inquiries`}
          icon={<Users size={20} />}
          accentColor="#7c3aed"
        />
        <StatCard
          title="Verified Revenue"
          value={`₹${verifiedDonationsSum.toLocaleString("en-IN")}`}
          sub={`${completedDonationsAgg._count.id} paid • ${pendingDonationsCount} pending`}
          icon={<IndianRupee size={20} />}
          accentColor="#b45309"
        />
      </div>

      {/* Quick Action Notice when open contact inquiries exist */}
      {openInquiriesCount > 0 && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "0.9rem 1.15rem",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface)",
            border: "1px solid var(--cream-200)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.9rem", color: "var(--stone-700)" }}>
            <Inbox size={18} style={{ color: "var(--green-600)" }} />
            <span>
              <strong>{openInquiriesCount}</strong> contact enquiry message{openInquiriesCount > 1 ? "s" : ""} awaiting follow-up.
            </span>
          </div>
          <Link href="/admin/inquiries" className="btn btn-outline btn-sm">
            Review Inbox →
          </Link>
        </div>
      )}

      {/* Activity Feeds */}
      <div className="admin-feeds-grid">
        {/* Recent Rescues */}
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--cream-200)",
            padding: "1.25rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🚨</span>
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Recent Incidents</h2>
            </div>
            <Link
              href="/admin/rescues"
              style={{
                color: "var(--green-700)",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                textDecoration: "none",
                fontSize: "0.8rem",
              }}
            >
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {recentRescues.length === 0 ? (
            <p style={{ color: "var(--stone-500)", fontStyle: "italic", fontSize: "0.88rem" }}>
              No recent rescues reported.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentRescues.map((rescue) => {
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
                        {rescue.animalType} at {rescue.location}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--stone-500)", marginTop: "0.15rem" }}>
                        {rescue.assignedTeam || "Pending Unit"} • Status: {rescue.status}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "0.22rem 0.6rem",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: isCritical ? "rgba(239, 68, 68, 0.12)" : "rgba(245, 158, 11, 0.14)",
                        color: isCritical ? "#dc2626" : "#b45309",
                        border: isCritical ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rescue.emergencyLevel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Adoption Applications */}
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--cream-200)",
            padding: "1.25rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>📋</span>
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Recent Adoptions</h2>
            </div>
            <Link
              href="/admin/adoption"
              style={{
                color: "var(--green-700)",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                textDecoration: "none",
                fontSize: "0.8rem",
              }}
            >
              Review <ArrowRight size={13} />
            </Link>
          </div>

          {recentAdoptions.length === 0 ? (
            <p style={{ color: "var(--stone-500)", fontStyle: "italic", fontSize: "0.88rem" }}>
              No adoption applications yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentAdoptions.map((app) => (
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
                  <span
                    style={{
                      padding: "0.22rem 0.6rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background:
                        app.status === "Approved" || app.status === "Adopted"
                          ? "rgba(21, 128, 61, 0.12)"
                          : "rgba(59, 130, 246, 0.12)",
                      color:
                        app.status === "Approved" || app.status === "Adopted" ? "#15803d" : "#2563eb",
                      border:
                        app.status === "Approved" || app.status === "Adopted"
                          ? "1px solid rgba(21, 128, 61, 0.3)"
                          : "1px solid rgba(59, 130, 246, 0.3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {app.status}
                  </span>
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
  sub,
  icon,
  accentColor,
}: {
  title: string;
  value: string | number;
  sub?: string;
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
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
        <div className="admin-stat-value">{value}</div>
        {sub && (
          <div style={{ fontSize: "0.74rem", color: "var(--stone-500)", marginTop: "0.2rem" }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
