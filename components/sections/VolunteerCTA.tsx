import Image from "next/image";
import Link from "next/link";

export default function VolunteerCTA() {
  const activities = ["Animal Rescue", "Photography", "Feeding Programs", "Veterinary Support", "Social Media", "Fundraising"];

  return (
    <section className="section" style={{ background: "var(--cream-50)" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem", alignItems: "center" }}>
          {/* Content */}
          <div>
            <div className="section-tag" style={{ background: "var(--forest-50)", color: "var(--forest-700)" }}>
              🙌 Volunteer
            </div>
            <h2 style={{ marginBottom: "1rem" }}>Join Our Team of Change-Makers</h2>
            <p style={{ marginBottom: "1.5rem", lineHeight: 1.8 }}>
              Our volunteers are the heartbeat of Ayudar. Whether you have two hours a week or two days a month, your time changes lives.
              No experience needed — just compassion.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
              {activities.map((a) => (
                <span key={a} className="badge badge-green" style={{ padding: "0.35rem 0.85rem" }}>
                  {a}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/volunteer" className="btn btn-primary">
                Become a Volunteer
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Ask Questions
              </Link>
            </div>
          </div>

          {/* Image */}
          <div style={{ position: "relative", borderRadius: "var(--radius-xl)", overflow: "hidden", aspectRatio: "4/3" }}>
            <Image src="/images/volunteer_banner.jpg" alt="Ayudar volunteers with rescued animals" fill style={{ objectFit: "cover" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
