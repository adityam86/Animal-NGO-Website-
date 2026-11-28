"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import { AYUDAR_LEGAL } from "@/lib/data";

export default function MissionSection() {
  return (
    <section
      className="section"
      aria-labelledby="mission-heading"
      style={{
        background: "var(--cream-50)",
        borderBottom: "1px solid var(--cream-200)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "clamp(2.5rem, 5vw, 5rem)",
            alignItems: "center",
          }}
        >
          {/* Left: Editorial Narrative */}
          <FadeIn direction="up" distance={14}>
            <div>
              <span className="editorial-eyebrow" style={{ marginBottom: "1rem" }}>
                Our Mission · Reg. {AYUDAR_LEGAL.regNo}
              </span>

              <h2
                id="mission-heading"
                style={{
                  fontSize: "clamp(2rem, 3.6vw, 2.85rem)",
                  lineHeight: 1.14,
                  color: "var(--stone-900)",
                  marginBottom: "1.5rem",
                  maxWidth: "18ch",
                }}
              >
                To stand between neglected street animals and needless suffering.
              </h2>

              <blockquote
                style={{
                  margin: "0 0 1.5rem",
                  paddingLeft: "1.25rem",
                  borderLeft: "2px solid var(--saffron-500)",
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: "clamp(1.1rem, 1.5vw, 1.25rem)",
                  lineHeight: 1.55,
                  color: "var(--stone-800)",
                }}
              >
                &ldquo;{AYUDAR_LEGAL.mission}&rdquo;
              </blockquote>

              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.8,
                  color: "var(--stone-600)",
                  maxWidth: "56ch",
                  marginBottom: "1.25rem",
                }}
              >
                Operating from Tilabad, Kumarpur (Asansol) and serving Raniganj and Durgapur across West Bengal,{" "}
                <strong style={{ color: "var(--stone-800)", fontWeight: 600 }}>
                  {AYUDAR_LEGAL.name}
                </strong>{" "}
                provides emergency roadside rescue, veterinary stabilization, dedicated gaushala shelter,
                and community vaccination for dogs, cats, and injured livestock that have nowhere else to turn.
              </p>

              <p
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.75,
                  color: "var(--stone-600)",
                  maxWidth: "56ch",
                  marginBottom: "1.75rem",
                }}
              >
                Registered under West Bengal Trust Act ({AYUDAR_LEGAL.regNo}), NITI Aayog Darpan (
                {AYUDAR_LEGAL.nitiAayogId}), CSR-1 ({AYUDAR_LEGAL.csrRegNo}), and Section 80G tax exemption (
                {AYUDAR_LEGAL.urn80G}), every contribution is directed toward verified field rescues, medical
                care, and dignified sanctuary upkeep.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--cream-200)",
                }}
              >
                <Link
                  href="/about"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    color: "var(--stone-900)",
                    textDecoration: "none",
                    borderBottom: "1.5px solid var(--saffron-500)",
                    paddingBottom: "0.2rem",
                  }}
                >
                  Read Our Charter &amp; Governance <ArrowRight size={15} aria-hidden="true" />
                </Link>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.8rem",
                    color: "var(--green-600)",
                    fontWeight: 600,
                  }}
                >
                  <ShieldCheck size={15} aria-hidden="true" />
                  Verified 80G Non-Profit Trust
                </span>
              </div>
            </div>
          </FadeIn>

          {/* Right: Documentary Sanctuary Photograph */}
          <FadeIn direction="up" delay={0.08} distance={14}>
            <figure style={{ margin: 0 }}>
              <div
                className="editorial-photo-wrap"
                style={{
                  position: "relative",
                  aspectRatio: "4 / 5",
                  maxHeight: "540px",
                  width: "100%",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--cream-200)",
                  background: "var(--cream-200)",
                }}
              >
                <Image
                  src="/images/cow_lakshmi.jpg"
                  alt="Rescued calf Resting peacefully under sanctuary shelter at Ayudar Gaushala"
                  fill
                  style={{ objectFit: "cover", objectPosition: "center 35%" }}
                  sizes="(max-width: 768px) 100vw, 48vw"
                />
              </div>
              <figcaption
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "1rem",
                  marginTop: "0.85rem",
                  paddingTop: "0.65rem",
                  borderTop: "1px solid var(--cream-200)",
                  fontSize: "0.78rem",
                  color: "var(--stone-500)",
                }}
              >
                <span>Sanctuary Gaushala &amp; Rehabilitation Wing, Asansol</span>
                <span style={{ color: "var(--stone-400)", fontVariantNumeric: "tabular-nums" }}>
                  Archive Photograph
                </span>
              </figcaption>
            </figure>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
