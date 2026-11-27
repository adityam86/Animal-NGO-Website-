"use client";

import Link from "next/link";
import FadeIn from "@/components/motion/FadeIn";
import BeforeAfterSlider from "@/components/shared/BeforeAfterSlider";

const TRANSFORMATIONS = [
  {
    slug: "bruno-road-to-recovery",
    title: "Bruno — Shattered Leg to Forever Sofa",
    date: "Rescued Mar 2026 • NH-19 Highway",
    story: "Found immobilized after a late-night collision. Three hours of orthopedic surgery and 30 days of rehab helped Bruno sprint into his adopter's arms.",
    beforeImage: "/images/rescue_story_banner.jpg",
    afterImage: "/images/dog_bruno.jpg",
  },
  {
    slug: "lakshmi-the-highway-cow",
    title: "Lakshmi — Highway Distress to Safe Gaushala",
    date: "Rescued Nov 2025 • Durgapur Expressway",
    story: "Rescued malnourished with severe hoof-rot during rush hour. Now healthy, confident, and cared for full-time at our Gaushala sanctuary.",
    beforeImage: "/images/cow_care_banner.jpg",
    afterImage: "/images/cow_lakshmi.jpg",
  },
];

export default function BeforeAfterSection() {
  return (
    <section className="section" style={{ background: "var(--cream-50)" }}>
      <div className="container">
        <FadeIn direction="up" distance={20}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", marginBottom: "2.75rem" }}>
            <div>
              <div className="section-tag" style={{ background: "var(--sage-tint, var(--green-50))", color: "var(--green-700)" }}>
                ✨ Drag to Compare
              </div>
              <h2>Before &amp; After Rescue Transformations</h2>
              <p style={{ maxWidth: 540, marginTop: "0.5rem", color: "var(--stone-600)", marginBottom: 0 }}>
                Slide the handle left and right to see how emergency care, nutrition, and patience change a street animal&apos;s life.
              </p>
            </div>
            <Link href="/stories" className="btn btn-outline">
              Full Transformation Archive →
            </Link>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "2rem" }}>
          {TRANSFORMATIONS.map((item, idx) => (
            <FadeIn key={item.slug} delay={idx * 0.1} direction="up" distance={20}>
              <div
                className="card"
                style={{
                  padding: "1.35rem",
                  borderRadius: "var(--radius-xl)",
                  background: "white",
                }}
              >
                <BeforeAfterSlider
                  beforeImage={item.beforeImage}
                  afterImage={item.afterImage}
                  beforeLabel="Day 1 Rescue"
                  afterLabel="Recovered & Happy"
                  aspectRatio="16/10"
                />
                <div style={{ marginTop: "1.15rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E07A5F", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
                    {item.date}
                  </div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "0.45rem" }}>{item.title}</h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--stone-600)", lineHeight: 1.6, marginBottom: "0.9rem" }}>
                    {item.story}
                  </p>
                  <Link href={`/stories/${item.slug}`} style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--green-700)" }}>
                    Read Full Recovery Timeline →
                  </Link>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
