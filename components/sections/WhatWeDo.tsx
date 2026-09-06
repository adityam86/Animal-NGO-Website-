"use client";

import { SERVICES } from "@/lib/data";
import FadeIn from "@/components/motion/FadeIn";
import HoverCard from "@/components/motion/HoverCard";

export default function WhatWeDo() {
  return (
    <section className="section" style={{ background: "var(--cream-50)" }}>
      <div className="container">
        <FadeIn direction="up" distance={20}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-tag">What We Do</div>
            <h2>Comprehensive Care for Every Animal</h2>
            <p style={{ maxWidth: 520, marginInline: "auto", marginTop: "0.75rem", color: "var(--stone-600)" }}>
              From emergency rescue to lifetime shelter, we provide end-to-end welfare for animals who have no one else.
            </p>
          </div>
        </FadeIn>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {SERVICES.map((service, i) => (
            <FadeIn key={service.title} delay={i * 0.08} direction="up" distance={20}>
              <HoverCard lift={6} scale={1.015} style={{ height: "100%" }}>
                <div
                  style={{
                    background: "white",
                    borderRadius: "var(--radius-xl)",
                    padding: "2.25rem 2rem",
                    border: "1px solid var(--cream-200)",
                    cursor: "default",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                >
                  {/* Decorative background accent */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 90,
                      height: 90,
                      background: i % 2 === 0 ? "var(--saffron-50)" : "var(--green-50)",
                      borderRadius: "0 0 0 100%",
                      opacity: 0.7,
                    }}
                  />

                  <div style={{ fontSize: "2.5rem", marginBottom: "1.25rem" }}>{service.icon}</div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "0.6rem", color: "var(--stone-800)" }}>
                    {service.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "var(--stone-600)", margin: 0 }}>
                    {service.description}
                  </p>
                </div>
              </HoverCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
