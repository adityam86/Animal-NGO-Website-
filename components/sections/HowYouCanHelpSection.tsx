"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, ShieldCheck } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import { AYUDAR_LEGAL } from "@/lib/data";

const PRESET_AMOUNTS = [250, 500, 1500, 3000];

const ALLOCATION_NOTES: Record<number, string> = {
  250: "Supports antiseptic dressing supplies and initial street triage kits.",
  500: "Contributes toward emergency vaccination and pain-relief medication.",
  1500: "Helps sustain sanctuary nutrition, diagnostics, and recovery bedding.",
  3000: "Co-funds veterinary surgery, X-rays, or multi-week trauma stabilization.",
};

const WAYS_TO_ACT = [
  {
    code: "Volunteer",
    title: "Join the Field & Shelter Corps",
    description:
      "Assist with weekend feeding routes, transport during emergencies, foster care, or community sterilization coordination.",
    href: "/volunteer",
    cta: "Apply as a Volunteer",
  },
  {
    code: "Adopt or Sponsor",
    title: "Give a Recovered Resident Permanence",
    description:
      "Open your home to a vaccinated, socialized dog or cat—or sponsor long-term care for elderly shelter residents and cows.",
    href: "/adoption",
    cta: "Explore Adoption & Sponsorship",
  },
  {
    code: "Report",
    title: "Trigger Immediate Road Rescue",
    description:
      "Spotted an injured street dog, cat, or calf in distress? Log GPS coordinates and an image for our rapid dispatch team.",
    href: "/rescue",
    cta: "Report an Injured Animal",
  },
];

export default function HowYouCanHelpSection() {
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [frequency, setFrequency] = useState<"One-time" | "Monthly">("One-time");

  return (
    <section
      className="section"
      aria-labelledby="how-help-heading"
      style={{
        background: "var(--cream-100)",
        borderBottom: "1px solid var(--cream-200)",
      }}
    >
      <div className="container">
        <FadeIn direction="up" distance={12}>
          <div style={{ marginBottom: "clamp(2.25rem, 4vw, 3rem)" }}>
            <span className="editorial-eyebrow" style={{ marginBottom: "0.8rem" }}>
              How You Can Help
            </span>
            <h2
              id="how-help-heading"
              style={{
                fontSize: "clamp(1.9rem, 3.4vw, 2.65rem)",
                color: "var(--stone-900)",
                margin: 0,
                maxWidth: "24ch",
              }}
            >
              Every rescue depends on public solidarity.
            </h2>
          </div>
        </FadeIn>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "clamp(2rem, 4vw, 3.5rem)",
            alignItems: "stretch",
          }}
        >
          {/* Left Panel: Editorial Direct Donation Selector */}
          <FadeIn direction="up" distance={12}>
            <div
              style={{
                background: "var(--forest-deep)",
                color: "#FAF7F2",
                borderRadius: "var(--radius-md)",
                padding: "clamp(1.75rem, 3.5vw, 2.5rem)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1.75rem",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                    marginBottom: "1.15rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#E07A5F",
                    }}
                  >
                    Direct Medical &amp; Sanctuary Fund
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.75rem",
                      color: "rgba(250, 247, 242, 0.78)",
                    }}
                  >
                    <ShieldCheck size={14} style={{ color: "#E07A5F" }} aria-hidden="true" />
                    80G Exempt
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.5rem, 2.5vw, 1.95rem)",
                    color: "#FAF7F2",
                    marginBottom: "0.75rem",
                  }}
                >
                  Fund emergency surgery, fodder, and post-trauma shelter.
                </h3>

                <p
                  style={{
                    fontSize: "0.92rem",
                    lineHeight: 1.7,
                    color: "rgba(250, 247, 242, 0.76)",
                    marginBottom: "1.5rem",
                  }}
                >
                  Processed securely via Razorpay with instant receipting under {AYUDAR_LEGAL.urn80G}.
                </p>

                {/* Frequency Switcher */}
                <div
                  role="group"
                  aria-label="Donation frequency"
                  style={{
                    display: "inline-grid",
                    gridTemplateColumns: "1fr 1fr",
                    padding: "3px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    marginBottom: "1.25rem",
                  }}
                >
                  {(["One-time", "Monthly"] as const).map((freq) => {
                    const active = frequency === freq;
                    return (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setFrequency(freq)}
                        style={{
                          padding: "0.45rem 1rem",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          background: active ? "#FAF7F2" : "transparent",
                          color: active ? "#152920" : "rgba(250, 247, 242, 0.8)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {freq}
                      </button>
                    );
                  })}
                </div>

                {/* Amount Grid */}
                <div
                  role="group"
                  aria-label="Select donation amount"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: "0.6rem",
                    marginBottom: "1.1rem",
                  }}
                >
                  {PRESET_AMOUNTS.map((amt) => {
                    const active = selectedAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setSelectedAmount(amt)}
                        style={{
                          padding: "0.72rem 0.4rem",
                          borderRadius: "var(--radius-sm)",
                          border: active
                            ? "1.5px solid #E07A5F"
                            : "1px solid rgba(250, 247, 242, 0.2)",
                          background: active ? "#E07A5F" : "rgba(255, 255, 255, 0.05)",
                          color: "#FAF7F2",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "all 0.18s ease",
                        }}
                      >
                        ₹{amt.toLocaleString("en-IN")}
                      </button>
                    );
                  })}
                </div>

                <p
                  style={{
                    fontSize: "0.84rem",
                    lineHeight: 1.6,
                    color: "rgba(250, 247, 242, 0.82)",
                    background: "rgba(255, 255, 255, 0.06)",
                    borderLeft: "2px solid #E07A5F",
                    padding: "0.65rem 0.9rem",
                    margin: 0,
                  }}
                >
                  {ALLOCATION_NOTES[selectedAmount]}
                </p>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem" }}>
                <Link
                  href={`/donate?amount=${selectedAmount}&frequency=${frequency.toLowerCase()}`}
                  className="btn btn-terracotta btn-lg"
                  style={{
                    flex: "1 1 220px",
                    justifyContent: "center",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <Heart size={17} aria-hidden="true" />
                  <span>Proceed with ₹{selectedAmount.toLocaleString("en-IN")}</span>
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Right Panel: Ruled Three Pathways */}
          <FadeIn direction="up" delay={0.08} distance={12}>
            <div
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--cream-200)",
                padding: "clamp(1.5rem, 3.5vw, 2.25rem)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {WAYS_TO_ACT.map((item, idx) => (
                <div
                  key={item.code}
                  style={{
                    paddingTop: idx === 0 ? 0 : "1.5rem",
                    paddingBottom: idx === WAYS_TO_ACT.length - 1 ? 0 : "1.5rem",
                    borderBottom:
                      idx === WAYS_TO_ACT.length - 1 ? "none" : "1px solid var(--cream-200)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--saffron-600)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {item.code}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.25rem",
                      color: "var(--stone-900)",
                      marginBottom: "0.45rem",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      lineHeight: 1.65,
                      color: "var(--stone-600)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {item.description}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", alignItems: "center" }}>
                    <Link
                      href={item.href}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontSize: "0.86rem",
                        fontWeight: 600,
                        color: "var(--green-600)",
                        textDecoration: "none",
                      }}
                    >
                      {item.cta} <ArrowRight size={14} aria-hidden="true" />
                    </Link>

                    {item.code === "Adopt or Sponsor" && (
                      <Link
                        href="/sponsor"
                        style={{
                          fontSize: "0.84rem",
                          fontWeight: 500,
                          color: "var(--stone-600)",
                          textDecoration: "underline",
                        }}
                      >
                        Sponsor Care Monthly
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
