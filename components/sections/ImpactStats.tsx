"use client";

import { useEffect, useRef, useState } from "react";
import { IMPACT_STATS } from "@/lib/data";
import FadeIn from "@/components/motion/FadeIn";
import HoverCard from "@/components/motion/HoverCard";

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
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
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div
      ref={ref}
      style={{
        fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        color: "var(--saffron-500)",
        lineHeight: 1,
      }}
    >
      {count.toLocaleString("en-IN")}
      {suffix}
    </div>
  );
}

export default function ImpactStats() {
  return (
    <section style={{ background: "white", borderBottom: "1px solid var(--cream-200)" }}>
      <div className="container" style={{ paddingBlock: "4.5rem" }}>
        {/* Header */}
        <FadeIn direction="up" distance={20}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-tag">Our Impact</div>
            <h2>Lives Changed, One Animal at a Time</h2>
            <p style={{ maxWidth: 520, marginInline: "auto", marginTop: "0.75rem", color: "var(--stone-600)" }}>
              Every number here represents a life saved, a family united, and a story of compassion across our region.
            </p>
          </div>
        </FadeIn>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2rem",
          }}
        >
          {IMPACT_STATS.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1} direction="up" distance={20}>
              <HoverCard lift={8} scale={1.02}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "2.25rem 1.5rem",
                    background: "var(--cream-50)",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--cream-200)",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                  }}
                >
                  {/* Decorative ambient circle */}
                  <div
                    style={{
                      position: "absolute",
                      top: -24,
                      right: -24,
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      background: i % 2 === 0 ? "var(--saffron-100)" : "var(--green-100)",
                      opacity: 0.6,
                    }}
                  />
                  <CountUp target={stat.value} suffix={stat.suffix} />
                  <div
                    style={{
                      color: "var(--stone-700)",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      marginTop: "0.6rem",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              </HoverCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
