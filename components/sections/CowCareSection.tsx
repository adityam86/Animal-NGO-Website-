import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/motion/FadeIn";
import HoverCard from "@/components/motion/HoverCard";

export default function CowCareSection() {
  const cowStats = [
    { n: "68", label: "Cows in Shelter" },
    { n: "12", label: "Pregnant Rescued" },
    { n: "24", label: "Sponsorships Active" },
    { n: "100%", label: "Daily Feeding" },
  ];

  return (
    <section className="section" style={{ background: "white" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem", alignItems: "center" }}>
          {/* Image */}
          <FadeIn direction="left" distance={30}>
            <div style={{ position: "relative", borderRadius: "var(--radius-2xl)", overflow: "hidden", aspectRatio: "4/3", boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}>
              <Image src="/images/cow_care_banner.jpg" alt="Rescued cows at Ayudar Gaushala" fill style={{ objectFit: "cover" }} />
              <div style={{
                position: "absolute", bottom: "1.5rem", left: "1.5rem",
                background: "rgba(255,255,255,0.96)",
                borderRadius: "var(--radius-lg)",
                padding: "1rem 1.25rem",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                backdropFilter: "blur(8px)",
              }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--green-600)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                  🐄 Ayudar Gaushala
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--stone-700)", fontWeight: 600 }}>
                  Safe Haven for Rescued Cows
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Content */}
          <FadeIn direction="right" distance={30}>
            <div>
              <div className="section-tag" style={{ background: "var(--green-50)", color: "var(--green-700)" }}>🐄 Cow Care</div>
              <h2 style={{ marginBottom: "1rem" }}>
                Our Gaushala — A Sacred Duty
              </h2>
              <p style={{ marginBottom: "1rem", lineHeight: 1.8, color: "var(--stone-600)" }}>
                Cows are at the heart of our work. Our dedicated Gaushala houses rescued cows — from injured highway cows to abandoned dairy animals — and provides them with medical care, nutritious daily feeding, and a permanent safe home.
              </p>
              <p style={{ marginBottom: "2rem", lineHeight: 1.8, color: "var(--stone-600)" }}>
                Many of our cows are old, disabled, or pregnant when rescued. We ensure they live their remaining years in dignity and comfort.
              </p>

              {/* Cow stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
                {cowStats.map((stat) => (
                  <HoverCard key={stat.label} lift={4} scale={1.02}>
                    <div style={{ background: "var(--green-50)", borderRadius: "var(--radius-lg)", padding: "1.1rem", border: "1px solid var(--green-100)" }}>
                      <div style={{ fontSize: "1.85rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--green-600)" }}>{stat.n}</div>
                      <div style={{ fontSize: "0.82rem", color: "var(--green-800)", fontWeight: 600, marginTop: "0.2rem" }}>{stat.label}</div>
                    </div>
                  </HoverCard>
                ))}
              </div>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/cow-care" className="btn btn-green">
                  Learn About Cow Care
                </Link>
                <Link href="/sponsor" className="btn btn-outline">
                  Sponsor a Cow
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
