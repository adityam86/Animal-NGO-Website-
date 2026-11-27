"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IMPACT_STATS } from "@/lib/data";
import FadeIn from "@/components/motion/FadeIn";

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const steps = 50;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.25 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div
      ref={ref}
      style={{
        fontSize: "clamp(2.2rem, 3.8vw, 3.1rem)",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        color: "var(--green-700)",
        lineHeight: 1,
      }}
    >
      {count.toLocaleString("en-IN")}
      {suffix}
    </div>
  );
}

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export default function ImpactStats({ stats = IMPACT_STATS }: { stats?: StatItem[] }) {
  return (
    <section style={{ background: "white", borderBottom: "1px solid var(--cream-200)" }}>
      <div className="container" style={{ paddingBlock: "4.5rem" }}>
        <FadeIn direction="up" distance={20}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-tag" style={{ background: "var(--sage-tint, var(--green-50))", color: "var(--green-700)" }}>
              Live Impact Bento
            </div>
            <h2>Real-World Proof, Every Single Day</h2>
            <p style={{ maxWidth: 540, marginInline: "auto", marginTop: "0.65rem", color: "var(--stone-600)" }}>
              Measured rescue dispatches, sterilizations, adoptions, and active sanctuary residents across our care units.
            </p>
          </div>
        </FadeIn>

        {/* Asymmetrical Bento Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {/* Metric Tiles */}
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.08} direction="up" distance={18}>
              <div
                style={{
                  padding: "2rem 1.5rem",
                  background: i % 2 === 0 ? "var(--sage-tint, var(--green-50))" : "var(--cream-50)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--cream-200)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E07A5F", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.85rem" }}>
                  {["01 • Field Rescue", "02 • ABC & Medical", "03 • Vetted Homes", "04 • Active Sanctuary"][i] || "Impact"}
                </div>
                <div>
                  <CountUp target={stat.value} suffix={stat.suffix} />
                  <div style={{ color: "var(--stone-700)", fontSize: "0.95rem", fontWeight: 600, marginTop: "0.55rem" }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}

          {/* Candid Snapshot Bento Tiles */}
          <FadeIn delay={0.32} direction="up" distance={18}>
            <div style={{ position: "relative", minHeight: 200, borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid var(--cream-200)", height: "100%" }}>
              <Image src="/images/shelter_banner.jpg" alt="Inside Ayudar care shelter" fill style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(30,58,47,0.88), transparent 65%)" }} />
              <div style={{ position: "absolute", bottom: "1rem", left: "1rem", right: "1rem", color: "white" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>In-House Recovery Kennels</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.82)" }}>Daily feeding &amp; ICU nursing care</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.4} direction="up" distance={18}>
            <div style={{ position: "relative", minHeight: 200, borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid var(--cream-200)", height: "100%" }}>
              <Image src="/images/volunteer_banner.jpg" alt="Ayudar community volunteers" fill style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(30,58,47,0.88), transparent 65%)" }} />
              <div style={{ position: "absolute", bottom: "1rem", left: "1rem", right: "1rem", color: "white" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Community Sterilization Drives</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.82)" }}>Humane street population &amp; rabies control</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
