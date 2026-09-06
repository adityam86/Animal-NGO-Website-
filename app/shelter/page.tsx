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
      <section style={{ position: "relative", minHeight: 460, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Image src="/images/shelter_banner.jpg" alt="Ayudar Animal Shelter" fill style={{ objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(5,15,5,0.88) 0%, rgba(5,15,5,0.5) 60%, transparent 100%)" }} />
        </div>
        <div className="container" style={{ position: "relative" }}>
          <div style={{ maxWidth: 560 }}>
            <div className="section-tag" style={{ background: "hsla(142,55%,35%,0.25)", color: "var(--green-200)" }}>Our Shelter</div>
            <h1 style={{ color: "white", marginBottom: "0.75rem" }}>A Safe Place Called Home</h1>
            <p style={{ color: "hsla(0,0%,100%,0.8)", fontSize: "1.05rem", lineHeight: 1.8 }}>
              Our shelter is more than a building — it's the place where animals begin their journey from pain to hope. Every corner is designed for animal wellbeing.
            </p>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section style={{ background: "var(--green-600)", paddingBlock: "2.5rem" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1.5rem", textAlign: "center" }}>
            {[
              { n: "186", label: "Currently Sheltered" },
              { n: "4", label: "Facility Sections" },
              { n: "24/7", label: "Staff On-Duty" },
              { n: "3", label: "Vets on Team" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: "2.25rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "white" }}>{s.n}</div>
                <div style={{ fontSize: "0.82rem", color: "hsla(0,0%,100%,0.65)", marginTop: "0.2rem" }}>{s.label}</div>
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
          <p style={{ marginBottom: "2rem" }}>Running a shelter for 186 animals takes enormous resources. Your donation keeps our doors open.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/donate?purpose=Shelter" className="btn btn-primary">Donate to Shelter</Link>
            <Link href="/volunteer" className="btn btn-green">Volunteer at Shelter</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
