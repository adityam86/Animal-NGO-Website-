"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";

const PROGRAMS = [
  {
    number: "01",
    title: "Street Animal Rescue",
    summary:
      "Emergency response for road accidents, open wounds, distemper symptoms, and distressed street animals across Raniganj and neighbouring towns.",
    cta: "Report an Emergency",
    href: "/rescue",
  },
  {
    number: "02",
    title: "Veterinary & Trauma Care",
    summary:
      "First-aid stabilization, antibiotic courses, sterile dressing, anti-rabies vaccination, and post-operative recovery under supervised clinical care.",
    cta: "Support Medical Care",
    href: "/donate",
  },
  {
    number: "03",
    title: "Gaushala & Large Animal Shelter",
    summary:
      "Dedicated protective shelter, clean green fodder, fresh water, and hoof/wound treatment for abandoned, aging, and injured cows and calves.",
    cta: "Explore Our Gaushala",
    href: "/cow-care",
  },
  {
    number: "04",
    title: "Rehabilitation & Adoption",
    summary:
      "Thorough health screening, temperament socialization, house checks, and responsible lifetime rehoming for recovered dogs and cats.",
    cta: "Meet Adoptable Animals",
    href: "/adoption",
  },
];

export default function WhatWeDo() {
  return (
    <section
      className="section"
      aria-labelledby="what-we-do-heading"
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--cream-200)",
      }}
    >
      <div className="container">
        <FadeIn direction="up" distance={12}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "1.5rem",
              marginBottom: "clamp(2.5rem, 4vw, 3.5rem)",
            }}
          >
            <div>
              <span className="editorial-eyebrow" style={{ marginBottom: "0.85rem" }}>
                What We Do
              </span>
              <h2
                id="what-we-do-heading"
                style={{
                  fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)",
                  color: "var(--stone-900)",
                  margin: 0,
                  maxWidth: "20ch",
                }}
              >
                Four pillars of frontline care and shelter.
              </h2>
            </div>

            <Link
              href="/shelter"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "var(--stone-700)",
                textDecoration: "none",
                borderBottom: "1px solid var(--cream-300)",
                paddingBottom: "0.2rem",
              }}
            >
              Visit Sanctuary Overview <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </FadeIn>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
            gap: "2.25rem clamp(1.75rem, 3vw, 2.75rem)",
          }}
        >
          {PROGRAMS.map((program, idx) => (
            <FadeIn key={program.number} delay={idx * 0.06} direction="up" distance={12}>
              <div
                style={{
                  borderTop: "2px solid var(--stone-800)",
                  paddingTop: "1.35rem",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1.25rem",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.95rem",
                      color: "var(--saffron-600)",
                      fontWeight: 600,
                      marginBottom: "0.65rem",
                    }}
                  >
                    {program.number}
                  </span>
                  <h3
                    style={{
                      fontSize: "1.28rem",
                      color: "var(--stone-900)",
                      marginBottom: "0.65rem",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {program.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.92rem",
                      color: "var(--stone-600)",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {program.summary}
                  </p>
                </div>

                <Link
                  href={program.href}
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
                  {program.cta} <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
