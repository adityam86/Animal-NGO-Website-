"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ExternalLink, ArrowRight } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import { AYUDAR_LEGAL, CONTACT_INFO } from "@/lib/data";

export default function SanctuaryContactSection() {
  return (
    <section
      className="section"
      aria-labelledby="sanctuary-contact-heading"
      style={{
        background: "var(--cream-100)",
        borderTop: "1px solid var(--cream-200)",
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
              marginBottom: "2.5rem",
            }}
          >
            <div>
              <span className="editorial-eyebrow" style={{ marginBottom: "0.75rem" }}>
                Sanctuary Desk &amp; Directions
              </span>
              <h2
                id="sanctuary-contact-heading"
                style={{
                  fontSize: "clamp(1.85rem, 3.2vw, 2.45rem)",
                  color: "var(--stone-900)",
                  margin: 0,
                }}
              >
                Reach our team in Raniganj &amp; Asansol.
              </h2>
            </div>

            <Link
              href="/contact"
              className="btn btn-primary"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              Send a Sanctuary Inquiry <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </FadeIn>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Card 1: Location */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--cream-200)",
              borderRadius: "var(--radius-md)",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--green-600)",
                fontSize: "0.76rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.85rem",
              }}
            >
              <MapPin size={15} aria-hidden="true" />
              <span>Sanctuary &amp; Gaushala</span>
            </div>
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.65,
                color: "var(--stone-800)",
                fontWeight: 500,
                marginBottom: "0.75rem",
              }}
            >
              {CONTACT_INFO.address}
            </p>
            <p
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                fontSize: "0.84rem",
                color: "var(--stone-500)",
                marginBottom: "1rem",
              }}
            >
              <Clock size={14} aria-hidden="true" />
              <span>{CONTACT_INFO.hours}</span>
            </p>
            <a
              href={AYUDAR_LEGAL.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--saffron-600)",
                textDecoration: "none",
              }}
            >
              Open Directions on Google Maps <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>

          {/* Card 2: Rescue & Email */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--cream-200)",
              borderRadius: "var(--radius-md)",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--saffron-600)",
                fontSize: "0.76rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.85rem",
              }}
            >
              <Phone size={15} aria-hidden="true" />
              <span>Emergency &amp; Communication</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: "0.9rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--stone-400)" }}>24/7 Rescue Desk</div>
                <a
                  href={`tel:${CONTACT_INFO.emergencyPhone.replace(/\s+/g, "")}`}
                  style={{ fontWeight: 600, color: "var(--stone-800)", textDecoration: "none" }}
                >
                  {CONTACT_INFO.emergencyPhone}
                </a>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--stone-400)" }}>General &amp; Adoptions</div>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontWeight: 500,
                    color: "var(--stone-700)",
                    textDecoration: "none",
                  }}
                >
                  <Mail size={13} aria-hidden="true" />
                  <span>{CONTACT_INFO.email}</span>
                </a>
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--stone-500)", marginTop: "0.25rem" }}>
                [Admin Placeholder: Confirm active field phone numbers &amp; @ayudarindia.com mail forward]
              </div>
            </div>
          </div>

          {/* Card 3: Statutory Transparency */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--cream-200)",
              borderRadius: "var(--radius-md)",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                fontSize: "0.76rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--stone-600)",
                marginBottom: "0.85rem",
              }}
            >
              Public Trust Credentials
            </div>
            <dl
              style={{
                margin: 0,
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "0.45rem 1rem",
                fontSize: "0.84rem",
              }}
            >
              <dt style={{ color: "var(--stone-500)" }}>Trust Reg.</dt>
              <dd style={{ margin: 0, fontWeight: 600, color: "var(--stone-800)" }}>{AYUDAR_LEGAL.regNo}</dd>
              <dt style={{ color: "var(--stone-500)" }}>80G URN</dt>
              <dd style={{ margin: 0, fontWeight: 600, color: "var(--stone-800)" }}>{AYUDAR_LEGAL.urn80G}</dd>
              <dt style={{ color: "var(--stone-500)" }}>CSR-1</dt>
              <dd style={{ margin: 0, fontWeight: 600, color: "var(--stone-800)" }}>{AYUDAR_LEGAL.csrRegNo}</dd>
              <dt style={{ color: "var(--stone-500)" }}>NITI Aayog</dt>
              <dd style={{ margin: 0, fontWeight: 600, color: "var(--stone-800)" }}>{AYUDAR_LEGAL.nitiAayogId}</dd>
            </dl>
            <p style={{ fontSize: "0.75rem", color: "var(--stone-500)", marginTop: "0.85rem", marginBottom: 0 }}>
              [Admin Placeholder: Official social channel handles awaiting administrator configuration]
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
