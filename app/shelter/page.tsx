import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Shelter",
  description: "Learn about Ayudar Animal Shelter — facilities, capacity, and how we care for rescued animals in Raniganj.",
};

const facilities = [
  { icon: "🏠", title: "Dog Kennels", desc: "60+ spacious kennels with individual beds, toys, and ventilation.", capacity: "60 dogs" },
  { icon: "🐱", title: "Cat Wing", desc: "Dedicated cat facility with climbing structures, enrichment, and separate outdoor pens.", capacity: "30 cats" },
  { icon: "🐄", title: "Gaushala", desc: "Open-air cow shelter with proper fencing, shade, water troughs, and green fodder.", capacity: "80 cows" },
  { icon: "🏥", title: "Veterinary Ward", desc: "Fully equipped in-house clinic with ICU, surgery room, and recovery bays.", capacity: "12 beds" },
  { icon: "🌿", title: "Garden & Play Area", desc: "Large open ground for animal exercise, socialization, and enrichment.", capacity: "Open" },
  { icon: "🔬", title: "Quarantine Zone", desc: "Separate quarantine facility for newly arrived animals before integration.", capacity: "8 bays" },
];

export default function ShelterPage() {
  return (
    <main style={{ paddingTop: "68px" }}>
      {/* Hero */}
      <section style={{ position: "relative", minHeight: 460, display: "flex", alignItems: "center", background: "var(--forest-deep)" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Image src="/images/dog_bruno.jpg" alt="Recovered sanctuary dog resting at Ayudar shelter" fill style={{ objectFit: "cover", objectPosition: "center 35%" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(13,28,21,0.90) 0%, rgba(13,28,21,0.58) 60%, rgba(13,28,21,0.22) 100%)" }} />
        </div>
        <div className="container" style={{ position: "relative" }}>
          <div style={{ maxWidth: 560 }}>
            <span className="editorial-eyebrow" style={{ color: "#E07A5F", marginBottom: "0.9rem" }}>Our Sanctuary</span>
            <h1 style={{ color: "#FAF7F2", marginBottom: "0.75rem" }}>A Safe Place to Recover and Heal</h1>
            <p style={{ color: "rgba(250,247,242,0.82)", fontSize: "1.05rem", lineHeight: 1.8 }}>
              Our Raniganj sanctuary provides trauma isolation, supervised veterinary wards, and dedicated spaces for recovering dogs, cats, and cows.
            </p>
          </div>
        </div>
      </section>

      {/* Shelter Overview Strip */}
      <section style={{ background: "var(--forest-deep)", borderTop: "1px solid rgba(250,247,242,0.12)", paddingBlock: "2rem" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "1.5rem", textAlign: "left" }}>
            {[
              { n: "4 Wings", label: "Dedicated Care Zones", note: "Triage ward, kennel recovery, cattery & gaushala" },
              { n: "24/7 Dispatch", label: "Emergency Intake", note: "Field stabilization & night-shift observation" },
              { n: "Supervision", label: "Veterinary Rounds", note: "Daily clinical dressing, vaccination & nutrition" },
              { n: "[Admin Placeholder]", label: "Live Shelter Occupancy", note: "Connect verified ShelterLocation headcount from database" },
            ].map((s) => (
              <div key={s.label} style={{ borderLeft: "2px solid rgba(224,122,95,0.65)", paddingLeft: "1rem" }}>
                <div style={{ fontSize: "1.1rem", fontFamily: "var(--font-display)", fontWeight: 600, color: "#FAF7F2" }}>{s.n}</div>
                <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "rgba(250,247,242,0.88)", marginTop: "0.15rem" }}>{s.label}</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(250,247,242,0.68)", marginTop: "0.15rem" }}>{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="section" style={{ background: "var(--cream-50)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-tag">Facilities</div>
            <h2>What Our Shelter Offers</h2>
            <p style={{ maxWidth: 500, marginInline: "auto", marginTop: "0.75rem" }}>
              Built to the highest standards of animal welfare, our shelter provides everything an animal needs to heal and thrive.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {facilities.map((f) => (
              <div key={f.title} className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "2rem" }}>{f.icon}</span>
                  <span className="badge badge-green" style={{ fontSize: "0.7rem" }}>{f.capacity}</span>
                </div>
                <h3 style={{ fontSize: "1.1rem" }}>{f.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--stone-500)", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily routine */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-tag">Daily Routine</div>
            <h2>A Day in the Life at Ayudar</h2>
          </div>
          <div style={{ maxWidth: 640, marginInline: "auto" }}>
            {[
              { time: "6:00 AM", activity: "Morning feeding — all animals", icon: "🌅" },
              { time: "7:30 AM", activity: "Veterinary rounds — health check for all animals", icon: "🩺" },
              { time: "9:00 AM", activity: "Cleaning & sanitation of all enclosures", icon: "🧹" },
              { time: "11:00 AM", activity: "Exercise & socialization time", icon: "🐕" },
              { time: "1:00 PM", activity: "Medical treatments, dressings, medications", icon: "💊" },
              { time: "4:00 PM", activity: "Evening feeding", icon: "🍽️" },
              { time: "6:00 PM", activity: "Volunteer interaction & enrichment activities", icon: "❤️" },
              { time: "9:00 PM", activity: "Night check — all animals settled and safe", icon: "🌙" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "1.5rem", padding: "1rem 0", borderBottom: i < 7 ? "1px solid var(--cream-200)" : "none", alignItems: "center" }}>
                <div style={{ fontSize: "1.25rem", flexShrink: 0 }}>{item.icon}</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--saffron-600)", minWidth: 70, flexShrink: 0 }}>{item.time}</div>
                <div style={{ fontSize: "0.9rem", color: "var(--stone-600)" }}>{item.activity}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--green-50)", paddingBlock: "3rem", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: 520 }}>
          <h2 style={{ marginBottom: "0.75rem" }}>Support Our Shelter</h2>
          <p style={{ marginBottom: "2rem" }}>Operating trauma wards, daily feeding rounds, and clean recovery enclosures requires consistent community support.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/donate?purpose=Shelter" className="btn btn-primary">Donate to Shelter</Link>
            <Link href="/volunteer" className="btn btn-green">Volunteer at Shelter</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
