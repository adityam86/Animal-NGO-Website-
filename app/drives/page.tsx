import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, MapPin, ShieldCheck, Syringe, Users } from "lucide-react";
import DriveRequestForm from "@/components/shared/DriveRequestForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ABC Sterilization & Anti-Rabies Drive Calendar",
  description:
    "View upcoming and completed Animal Birth Control (ABC) sterilization and anti-rabies vaccination drives across Asansol, Raniganj & Durgapur.",
};

export default async function DrivesPage() {
  const drives = await prisma.communityDrive.findMany({
    orderBy: [{ date: "asc" }],
  });

  const upcoming = drives.filter((d) => d.status === "Scheduled" || d.status === "Ongoing");
  const past = drives.filter((d) => d.status !== "Scheduled" && d.status !== "Ongoing");

  return (
    <main style={{ background: "var(--cream-50)", minHeight: "100vh", paddingTop: "72px" }}>
      <section
        style={{
          background: "linear-gradient(135deg, #1E3A2F 0%, #244739 65%, #2D5645 100%)",
          color: "white",
          padding: "clamp(3rem, 6vw, 4.5rem) 0",
        }}
      >
        <div className="container">
          <span className="editorial-eyebrow" style={{ color: "#FAF7F2", borderColor: "rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.1)", marginBottom: "0.85rem" }}>
            <Syringe size={13} style={{ display: "inline", marginRight: 5 }} /> Humane Street Population &amp; Rabies Prevention
          </span>
          <h1 style={{ color: "white", fontSize: "clamp(2rem, 4.2vw, 3rem)", marginBottom: "0.85rem" }}>
            ABC Sterilization &amp; Anti-Rabies Drive Calendar
          </h1>
          <p style={{ color: "rgba(250, 247, 242, 0.85)", maxWidth: "60ch", lineHeight: 1.7, margin: 0 }}>
            Tracking community vaccination and humane Animal Birth Control (Catch–Neuter–Vaccinate–Return) camps hosted by Ayudar Animal Welfare Foundation across Asansol, Kumarpur, Raniganj, and Durgapur.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <h2 style={{ fontSize: "1.65rem", marginBottom: "0.25rem" }}>Upcoming Field Camps</h2>
                <p style={{ color: "var(--stone-600)", margin: 0, fontSize: "0.9rem" }}>
                  Published directly by Ayudar field coordinators from our live operations schedule.
                </p>
              </div>
              <Link href="/volunteer" className="btn btn-outline btn-sm">
                Volunteer at a Camp →
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <div className="card" style={{ padding: "1.75rem", textAlign: "center", background: "var(--color-surface)", border: "1px dashed var(--cream-300)" }}>
                <p style={{ color: "var(--stone-700)", fontWeight: 600, marginBottom: "0.4rem" }}>
                  No upcoming camps are published on the public calendar right now.
                </p>
                <p style={{ color: "var(--stone-500)", fontSize: "0.88rem", margin: 0 }}>
                  Use the ward request form below to invite our veterinary team to vaccinate or sterilize community dogs in your neighborhood.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1.25rem" }}>
                {upcoming.map((drive) => (
                  <div key={drive.id} className="card card-elevated" style={{ padding: "1.4rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                      <span className="badge badge-green">{drive.driveType}</span>
                      <span style={{ fontSize: "0.78rem", color: "var(--stone-500)", fontWeight: 600 }}>{drive.status}</span>
                    </div>
                    <h3 style={{ fontSize: "1.15rem", margin: 0 }}>{drive.title}</h3>
                    <div style={{ fontSize: "0.86rem", color: "var(--stone-700)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                      <Calendar size={15} style={{ color: "var(--terracotta)" }} />
                      {new Date(drive.date).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })} · {drive.timeSlot}
                    </div>
                    <div style={{ fontSize: "0.86rem", color: "var(--stone-600)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                      <MapPin size={15} style={{ color: "var(--green-600)" }} />
                      {drive.areaWard}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--stone-600)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                      <Users size={14} style={{ color: "var(--stone-500)" }} />
                      Coordinator: {drive.coordinator}
                    </div>
                    {drive.notes && (
                      <p style={{ fontSize: "0.82rem", color: "var(--stone-600)", margin: "0.25rem 0 0", lineHeight: 1.5 }}>{drive.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <ShieldCheck size={18} style={{ color: "var(--green-600)" }} /> Recent Completed &amp; Archived Drives
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "1rem" }}>
                {past.map((drive) => (
                  <div key={drive.id} className="card" style={{ padding: "1.1rem 1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.35rem" }}>
                      <span className="badge badge-stone">{drive.driveType}</span>
                      <span style={{ color: "var(--stone-500)" }}>{drive.status}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.98rem", marginBottom: "0.25rem" }}>{drive.title}</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--stone-600)" }}>
                      {drive.areaWard} · {new Date(drive.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DriveRequestForm />
        </div>
      </section>
    </main>
  );
}
