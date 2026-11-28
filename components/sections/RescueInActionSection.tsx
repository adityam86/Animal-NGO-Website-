"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowRight, Search } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";

interface RescueInActionSectionProps {
  loggedReportsCount?: number;
}

const DISPATCH_STEPS = [
  {
    code: "01",
    title: "Location & Photographic Intake",
    detail:
      "Witnesses submit GPS coordinates, injury severity, and a photograph directly through our rapid rescue desk.",
  },
  {
    code: "02",
    title: "Field Responder Dispatch",
    detail:
      "Our on-call rescue volunteers receive the location pin and dispatch transport for stabilization on-site or transfer.",
  },
  {
    code: "03",
    title: "Veterinary Triage & Sanctuary Recovery",
    detail:
      "Animals receive wound dressing, fracture immobilization, vaccination, and sheltered convalescence until safe.",
  },
];

export default function RescueInActionSection({
  loggedReportsCount = 0,
}: RescueInActionSectionProps) {
  return (
    <section
      className="section"
      aria-labelledby="rescue-action-heading"
      style={{
        background: "var(--forest-deep)",
        color: "#FAF7F2",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "clamp(2.5rem, 5vw, 4.5rem)",
            alignItems: "start",
          }}
        >
          {/* Left: Emergency Protocol & Actions */}
          <FadeIn direction="up" distance={14}>
            <div>
              <span
                className="editorial-eyebrow"
                style={{
                  color: "#E07A5F",
                  marginBottom: "1rem",
                }}
              >
                Rescue in Action · Field Dispatch
              </span>

              <h2
                id="rescue-action-heading"
                style={{
                  fontSize: "clamp(2rem, 3.6vw, 2.75rem)",
                  lineHeight: 1.14,
                  color: "#FAF7F2",
                  marginBottom: "1.1rem",
                }}
              >
                When an animal is hurt on the road, minutes decide survival.
              </h2>

              <p
                style={{
                  fontSize: "0.98rem",
                  lineHeight: 1.75,
                  color: "rgba(250, 247, 242, 0.78)",
                  maxWidth: "52ch",
                  marginBottom: "2rem",
                }}
              >
                Hit-and-run trauma, severe infections, and trapped calves require immediate coordinated response.
                Every online report generates a trackable sanctuary dossier ID so callers can follow triage updates.
              </p>

              {/* Step List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  marginBottom: "2.25rem",
                  borderTop: "1px solid rgba(250, 247, 242, 0.14)",
                  paddingTop: "1.5rem",
                }}
              >
                {DISPATCH_STEPS.map((step) => (
                  <div
                    key={step.code}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "36px 1fr",
                      gap: "1rem",
                      alignItems: "baseline",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.95rem",
                        color: "#E07A5F",
                        fontWeight: 600,
                      }}
                    >
                      {step.code}
                    </span>
                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.98rem",
                          fontWeight: 600,
                          color: "#FAF7F2",
                          margin: "0 0 0.25rem",
                        }}
                      >
                        {step.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.86rem",
                          lineHeight: 1.6,
                          color: "rgba(250, 247, 242, 0.72)",
                          margin: 0,
                        }}
                      >
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Distinct Rescue Action Controls */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", alignItems: "center" }}>
                <Link
                  href="/rescue"
                  className="btn btn-terracotta"
                  style={{ borderRadius: "var(--radius-sm)" }}
                >
                  <AlertCircle size={17} aria-hidden="true" />
                  Report an Injured Animal
                </Link>

                <Link
                  href="/rescue/track"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    padding: "0.78rem 1.3rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(250, 247, 242, 0.28)",
                    color: "#FAF7F2",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  <Search size={15} aria-hidden="true" />
                  Track Active Case
                </Link>
              </div>

              {loggedReportsCount > 0 && (
                <p
                  style={{
                    marginTop: "1rem",
                    fontSize: "0.78rem",
                    color: "rgba(250, 247, 242, 0.62)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {loggedReportsCount} field dispatch report{loggedReportsCount === 1 ? "" : "s"} currently logged in the sanctuary database.
                </p>
              )}
            </div>
          </FadeIn>

          {/* Right: Documentary Photo Composition */}
          <FadeIn direction="up" delay={0.1} distance={14}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.15fr 1fr",
                  gap: "1rem",
                }}
              >
                <figure style={{ margin: 0, gridRow: "span 2" }}>
                  <div
                    className="editorial-photo-wrap"
                    style={{
                      position: "relative",
                      height: "100%",
                      minHeight: "340px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid rgba(250, 247, 242, 0.14)",
                    }}
                  >
                    <Image
                      src="/images/dog_bruno.jpg"
                      alt="Recovering community dog receiving post-trauma care at the sanctuary"
                      fill
                      style={{ objectFit: "cover", objectPosition: "center 30%" }}
                      sizes="(max-width: 768px) 100vw, 28vw"
                    />
                  </div>
                </figure>

                <figure style={{ margin: 0 }}>
                  <div
                    className="editorial-photo-wrap"
                    style={{
                      position: "relative",
                      aspectRatio: "4 / 3",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid rgba(250, 247, 242, 0.14)",
                    }}
                  >
                    <Image
                      src="/images/dog_ruby.jpg"
                      alt="Young street pup resting safely after veterinary deworming and care"
                      fill
                      style={{ objectFit: "cover", objectPosition: "center 25%" }}
                      sizes="(max-width: 768px) 100vw, 24vw"
                    />
                  </div>
                </figure>

                <figure style={{ margin: 0 }}>
                  <div
                    className="editorial-photo-wrap"
                    style={{
                      position: "relative",
                      aspectRatio: "4 / 3",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid rgba(250, 247, 242, 0.14)",
                    }}
                  >
                    <Image
                      src="/images/cat_mia.jpg"
                      alt="Rescued kitten monitored during nutritional recovery at Ayudar"
                      fill
                      style={{ objectFit: "cover", objectPosition: "center 30%" }}
                      sizes="(max-width: 768px) 100vw, 24vw"
                    />
                  </div>
                </figure>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.75rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid rgba(250, 247, 242, 0.14)",
                  fontSize: "0.78rem",
                  color: "rgba(250, 247, 242, 0.68)",
                }}
              >
                <span>
                  Sanctuary intake, stabilization &amp; supervised recovery — Asansol &amp; Raniganj field records
                </span>
                <Link
                  href="/stories"
                  style={{
                    color: "#E07A5F",
                    textDecoration: "none",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  View documented journeys <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
