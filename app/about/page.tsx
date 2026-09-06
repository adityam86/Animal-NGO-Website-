import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/motion/FadeIn";
import HoverCard from "@/components/motion/HoverCard";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Ayudar Animal Welfare Foundation — our story, mission, team, and impact since 2018.",
};

const team = [
  { name: "Dr. Priya Sharma", role: "Chief Veterinary Officer", since: "2018" },
  { name: "Arjun Dey", role: "Rescue Operations Head", since: "2019" },
  { name: "Kavya Nair", role: "Adoption & Volunteer Coordinator", since: "2020" },
  { name: "Ravi Mukherjee", role: "Gaushala Manager", since: "2018" },
];

const timeline = [
  { year: "2018", event: "Ayudar founded in Raniganj with 2 volunteers and a single rescued dog named Tommy." },
  { year: "2019", event: "First formal shelter established. 86 animals rescued in our first full year." },
  { year: "2020", event: "Gaushala launched. First cow rescue during lockdown — Nandini, who inspired our cow care program." },
  { year: "2021", event: "Adoption program formalized. 120+ animals found homes. First corporate donation received." },
  { year: "2023", event: "Mobile veterinary van launched. Expanded operations to Asansol and Durgapur." },
  { year: "2025", event: "1,000th animal rescued — Bruno. ₹50L+ in medical aid provided to date." },
];

const transparencyStats = [
  { label: "Total Donations Received", value: "₹12,45,000" },
  { label: "Medical Expenses", value: "₹5,80,000" },
  { label: "Food & Nutrition", value: "₹3,20,000" },
  { label: "Shelter Operations", value: "₹2,10,000" },
  { label: "Rescue Operations", value: "₹85,000" },
  { label: "Administrative", value: "₹50,000" },
];

export default function AboutPage() {
  return (
    <main style={{ paddingTop: "68px" }}>
      {/* Hero */}
      <section style={{ background: "var(--stone-800)", color: "white", paddingBlock: "5rem 3.5rem" }}>
        <div className="container" style={{ maxWidth: 720, textAlign: "center" }}>
          <FadeIn direction="up" distance={20}>
            <div className="section-tag" style={{ background: "hsla(26,88%,50%,0.2)", color: "var(--saffron-300)" }}>
              Our Story
            </div>
            <h1 style={{ color: "white", marginBottom: "1rem" }}>
              Born from Compassion, Built on Action
            </h1>
            <p style={{ color: "hsla(0,0%,100%,0.8)", fontSize: "1.1rem", lineHeight: 1.8 }}>
              Ayudar was founded in 2018 by a group of animal lovers in Raniganj who believed that every life — no matter how small or helpless — deserves protection, care, and dignity.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section" style={{ background: "var(--cream-50)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            {[
              {
                icon: "🎯",
                title: "Our Mission",
                color: "var(--saffron-500)",
                bg: "var(--saffron-50)",
                text: "To rescue, rehabilitate, and rehome injured and abandoned animals across the Raniganj-Asansol-Durgapur region, while educating communities about humane treatment of all animals.",
              },
              {
                icon: "🌟",
                title: "Our Vision",
                color: "var(--green-500)",
                bg: "var(--green-50)",
                text: "A world where every animal is treated with kindness — where no animal suffers on the street, and every abandoned pet finds a loving home.",
              },
              {
                icon: "💛",
                title: "Our Values",
                color: "hsl(42,90%,45%)",
                bg: "hsl(42,90%,96%)",
                text: "Compassion without discrimination. Transparency in all our work. Accountability to our donors and animals. Community-first in all decisions.",
              },
            ].map((item, idx) => (
              <FadeIn key={item.title} delay={idx * 0.1} direction="up" distance={20}>
                <HoverCard lift={6} scale={1.015} style={{ height: "100%" }}>
                  <div
                    style={{
                      background: item.bg,
                      borderRadius: "var(--radius-xl)",
                      padding: "2.25rem 2rem",
                      border: `1px solid ${item.color}30`,
                      height: "100%",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{item.icon}</div>
                    <h3 style={{ color: item.color, marginBottom: "0.75rem" }}>{item.title}</h3>
                    <p style={{ fontSize: "0.925rem", lineHeight: 1.75, margin: 0, color: "var(--stone-700)" }}>{item.text}</p>
                  </div>
                </HoverCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <FadeIn direction="up" distance={20}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div className="section-tag">Our Journey</div>
              <h2>From 2 Volunteers to a Movement</h2>
            </div>
          </FadeIn>

          <div style={{ maxWidth: 700, marginInline: "auto", position: "relative" }}>
            {/* Connecting vertical line */}
            <div style={{ position: "absolute", left: "1.5rem", top: 10, bottom: 10, width: 2, background: "var(--cream-200)" }} />
            {timeline.map((item, i) => (
              <FadeIn key={item.year} delay={i * 0.08} direction="up" distance={15}>
                <div style={{ display: "flex", gap: "2rem", marginBottom: "2.5rem", position: "relative" }}>
                  {/* Year badge */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: i === timeline.length - 1 ? "var(--saffron-500)" : "white",
                      border: "3px solid var(--saffron-400)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      color: i === timeline.length - 1 ? "white" : "var(--saffron-600)",
                      zIndex: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    {item.year}
                  </div>
                  <div style={{ paddingTop: "0.65rem" }}>
                    <p style={{ fontSize: "0.95rem", lineHeight: 1.75, color: "var(--stone-700)", margin: 0 }}>{item.event}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section" style={{ background: "var(--cream-50)" }}>
        <div className="container">
          <FadeIn direction="up" distance={20}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="section-tag">Our Team</div>
              <h2>The People Behind the Paws</h2>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {team.map((member, idx) => (
              <FadeIn key={member.name} delay={idx * 0.1} direction="up" distance={20}>
                <HoverCard lift={6} scale={1.02}>
                  <div className="card" style={{ padding: "1.75rem 1.5rem", textAlign: "center", borderRadius: "var(--radius-xl)" }}>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--saffron-200), var(--saffron-400))",
                        marginInline: "auto",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.75rem",
                        boxShadow: "0 4px 12px rgba(249, 115, 22, 0.2)",
                      }}
                    >
                      🧑‍⚕️
                    </div>
                    <h4 style={{ fontSize: "1.05rem", marginBottom: "0.35rem", color: "var(--stone-800)" }}>{member.name}</h4>
                    <p style={{ fontSize: "0.82rem", color: "var(--saffron-600)", fontWeight: 600, margin: 0 }}>{member.role}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--stone-400)", marginTop: "0.25rem" }}>Since {member.since}</p>
                  </div>
                </HoverCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <FadeIn direction="up" distance={20}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="section-tag">Transparency</div>
              <h2>Where Your Money Goes</h2>
              <p style={{ maxWidth: 520, marginInline: "auto", marginTop: "0.75rem", color: "var(--stone-600)" }}>
                We believe donors deserve to know exactly how their contributions are used. Here&apos;s our current year breakdown.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", maxWidth: 840, marginInline: "auto" }}>
            {transparencyStats.map((stat, idx) => (
              <FadeIn key={stat.label} delay={idx * 0.07} direction="up" distance={15}>
                <HoverCard lift={4} scale={1.02}>
                  <div
                    style={{
                      background: "var(--cream-50)",
                      borderRadius: "var(--radius-lg)",
                      padding: "1.5rem",
                      border: "1px solid var(--cream-200)",
                    }}
                  >
                    <div style={{ fontSize: "1.45rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--saffron-500)", marginBottom: "0.25rem" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--stone-600)", fontWeight: 500 }}>{stat.label}</div>
                  </div>
                </HoverCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--saffron-50)", paddingBlock: "3.5rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <FadeIn direction="up" distance={20}>
            <h2 style={{ marginBottom: "1rem" }}>Be Part of Our Story</h2>
            <p style={{ maxWidth: 480, marginInline: "auto", marginBottom: "2rem", color: "var(--stone-600)", lineHeight: 1.7 }}>
              Whether you donate, volunteer, adopt, or simply share — you help us write the next chapter.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/volunteer" className="btn btn-primary">
                Become a Volunteer
              </Link>
              <Link href="/donate" className="btn btn-outline">
                Donate
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
