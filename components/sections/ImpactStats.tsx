"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Info } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import { AYUDAR_LEGAL } from "@/lib/data";

export interface VerifiedImpactData {
  totalAnimalsRecorded: number;
  animalsAdopted: number;
  rescueReportsLogged: number;
  activeVolunteers: number;
  sheltersOperating: number;
  storiesPublished: number;
}

interface ImpactStatsProps {
  stats: VerifiedImpactData;
}

export default function ImpactStats({ stats }: ImpactStatsProps) {
  const verifiedMetrics = [
    {
      value: stats.totalAnimalsRecorded,
      label: "Sanctuary Animal Profiles",
      note: "Active & historical profiles registered in Ayudar's digital database",
    },
    {
      value: stats.animalsAdopted,
      label: "Adoptions Recorded",
      note: "Verified permanent placements tracked in the sanctuary ledger",
    },
    {
      value: stats.rescueReportsLogged,
      label: "Rescue Reports Logged",
      note: "Field emergency cases submitted and tracked digitally",
    },
    {
      value: stats.activeVolunteers,
      label: "Registered Volunteers",
      note: "Community members enrolled for rescue, feeding & foster duty",
    },
  ];

  return (
    <section
      className="section"
      aria-labelledby="verified-impact-heading"
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
              marginBottom: "clamp(2.25rem, 4vw, 3.25rem)",
            }}
          >
            <div>
              <span className="editorial-eyebrow" style={{ marginBottom: "0.8rem" }}>
                Verified Registry Figures
              </span>
              <h2
                id="verified-impact-heading"
                style={{
                  fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)",
                  color: "var(--stone-900)",
                  margin: 0,
                  maxWidth: "24ch",
                }}
              >
                Transparent records, without inflated numbers.
              </h2>
            </div>

            <Link
              href="/about"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "var(--green-600)",
                textDecoration: "none",
              }}
            >
              Inspect Legal &amp; Audit Certificates <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </FadeIn>

        {/* Live Database Metrics Row */}
        <div className="impact-metrics-grid">
          {verifiedMetrics.map((metric, idx) => (
            <FadeIn key={metric.label} delay={idx * 0.05} direction="up" distance={10}>
              <div
                style={{
                  padding: "1.5rem 1.4rem",
                  background: "var(--cream-50)",
                  border: "1px solid var(--cream-200)",
                  borderTop: "2px solid var(--green-600)",
                  borderRadius: "var(--radius-sm)",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2.25rem, 4vw, 2.9rem)",
                    fontWeight: 600,
                    color: "var(--stone-900)",
                    lineHeight: 1.05,
                    marginBottom: "0.5rem",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {metric.value}
                </div>
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "var(--stone-800)",
                    marginBottom: "0.35rem",
                  }}
                >
                  {metric.label}
                </div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    lineHeight: 1.55,
                    color: "var(--stone-500)",
                    margin: 0,
                  }}
                >
                  {metric.note}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Statutory Trust + Honest Admin Placeholder Ledger */}
        <FadeIn direction="up" delay={0.12} distance={10}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: "1.25rem",
              padding: "1.35rem 1.5rem",
              background: "var(--cream-100)",
              border: "1px solid var(--cream-200)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <CheckCircle2
                size={18}
                style={{ color: "var(--green-600)", flexShrink: 0, marginTop: "2px" }}
                aria-hidden="true"
              />
              <div style={{ fontSize: "0.86rem", color: "var(--stone-700)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--stone-900)" }}>Verified Organizational Registry:</strong>{" "}
                {stats.sheltersOperating > 0
                  ? `${stats.sheltersOperating} active sanctuary ${stats.sheltersOperating === 1 ? "facility" : "facilities"}`
                  : "Sanctuary operations"}{" "}
                and {stats.storiesPublished} documented recovery {stats.storiesPublished === 1 ? "story" : "stories"} live in PostgreSQL.
                Trust Reg: {AYUDAR_LEGAL.regNo} · NITI Aayog: {AYUDAR_LEGAL.nitiAayogId}.
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <Info
                size={18}
                style={{ color: "var(--saffron-600)", flexShrink: 0, marginTop: "2px" }}
                aria-hidden="true"
              />
              <div style={{ fontSize: "0.84rem", color: "var(--stone-600)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--stone-800)" }}>
                  [Admin Placeholder — Audited Historical Records]:
                </strong>{" "}
                Pre-2026 field rescues, lifetime ABC sterilizations, and audited annual financial reports
                will appear here once verified ledger figures are uploaded by sanctuary administration.
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      <style jsx>{`
        .impact-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1.35rem;
          margin-bottom: 2.25rem;
        }
        @media (max-width: 979px) {
          .impact-metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 559px) {
          .impact-metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
