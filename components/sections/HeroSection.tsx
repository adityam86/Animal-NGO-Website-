"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowRight, Heart, Phone } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ParallaxImage from "@/components/motion/ParallaxImage";
import PulseBeacon from "@/components/motion/PulseBeacon";
import { AYUDAR_LEGAL, CONTACT_INFO } from "@/lib/data";

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="hero-headline"
      style={{
        position: "relative",
        minHeight: "min(88vh, 780px)",
        display: "flex",
        alignItems: "flex-end",
        background: "#12241B",
        color: "#FAF7F2",
        overflow: "hidden",
      }}
    >
      {/* Full-Bleed Authentic Rescue Photograph with Subtle Parallax */}
      <ParallaxImage
        offset={22}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <Image
          src="/images/hero_banner.jpg"
          alt="Rescued community dog sheltered and cared for outdoors by Ayudar Animal Welfare Foundation"
          fill
          priority
          style={{
            objectFit: "cover",
            objectPosition: "62% 32%",
          }}
          sizes="100vw"
        />
      </ParallaxImage>

      {/* Balanced Dark Forest-Green Scrim Overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(102deg, rgba(13, 28, 21, 0.92) 0%, rgba(16, 34, 25, 0.78) 44%, rgba(16, 34, 25, 0.36) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to top, rgba(12, 24, 18, 0.88) 0%, rgba(12, 24, 18, 0.25) 45%, rgba(12, 24, 18, 0.32) 100%)",
        }}
      />

      {/* Foreground Content */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 2,
          paddingTop: "clamp(7rem, 12vw, 9rem)",
          paddingBottom: "clamp(3.25rem, 6vw, 4.75rem)",
        }}
      >
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: "680px" }}
        >
          {/* Editorial Region & Dispatch Indicator */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.65rem",
              marginBottom: "1.35rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.11em",
              textTransform: "uppercase",
              color: "rgba(250, 247, 242, 0.82)",
            }}
          >
            <PulseBeacon color="#E07A5F" size={8} />
            <span>{AYUDAR_LEGAL.name} · Raniganj &amp; Asansol</span>
          </div>

          {/* Editorial Headline */}
          <h1
            id="hero-headline"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 6vw, 4.35rem)",
              fontWeight: 600,
              lineHeight: 1.07,
              letterSpacing: "-0.025em",
              color: "#FAF7F2",
              margin: "0 0 1.4rem",
            }}
          >
            Every street life
            <br />
            deserves a{" "}
            <em
              style={{
                fontStyle: "italic",
                fontWeight: 500,
                color: "#E07A5F",
              }}
            >
              second chance
            </em>
            .
          </h1>

          {/* Concise Supporting Description */}
          <p
            style={{
              fontSize: "clamp(1rem, 1.35vw, 1.15rem)",
              lineHeight: 1.72,
              color: "rgba(250, 247, 242, 0.84)",
              maxWidth: "52ch",
              margin: "0 0 2.15rem",
            }}
          >
            24/7 emergency street animal rescue, trauma medicine, protective gaushala shelter,
            and responsible adoption across Paschim Bardhaman. Registered under Section 80G &amp; NITI Aayog.
          </p>

          {/* Distinct Primary & Rescue Action CTAs */}
          <div className="hero-cta-group">
            <Link
              href="/donate"
              className="btn btn-terracotta btn-lg hero-cta-btn"
              style={{
                borderRadius: "var(--radius-sm)",
                gap: "0.6rem",
              }}
            >
              <Heart size={18} aria-hidden="true" />
              <span>Donate to Save a Life</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

            <Link
              href="/rescue"
              className="btn btn-lg hero-cta-btn hero-rescue-btn"
              style={{
                borderRadius: "var(--radius-sm)",
                background: "rgba(17, 38, 28, 0.82)",
                color: "#FAF7F2",
                border: "1.5px solid rgba(250, 247, 242, 0.62)",
                gap: "0.6rem",
                backdropFilter: "blur(6px)",
              }}
            >
              <AlertCircle size={18} style={{ color: "#E07A5F" }} aria-hidden="true" />
              <span>Report an Injured Animal</span>
            </Link>
          </div>

          {/* Quiet Rescue Helpline & Track Ledger Line */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.85rem 1.75rem",
              marginTop: "2rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(250, 247, 242, 0.14)",
              fontSize: "0.84rem",
              color: "rgba(250, 247, 242, 0.72)",
            }}
          >
            <a
              href={`tel:${CONTACT_INFO.emergencyPhone.replace(/\s+/g, "")}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                color: "#FAF7F2",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <Phone size={14} style={{ color: "#E07A5F" }} aria-hidden="true" />
              <span>Emergency Line: {CONTACT_INFO.emergencyPhone}</span>
            </a>

            <Link
              href="/rescue/track"
              style={{
                color: "rgba(250, 247, 242, 0.78)",
                textDecoration: "none",
                borderBottom: "1px solid rgba(224, 122, 95, 0.5)",
                paddingBottom: "1px",
              }}
            >
              Track a submitted rescue ID →
            </Link>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .hero-cta-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.9rem;
          align-items: stretch;
        }
        :global(.hero-rescue-btn:hover) {
          background: rgba(184, 50, 50, 0.92) !important;
          border-color: #E07A5F !important;
          color: #FFFFFF !important;
        }
        @media (max-width: 639px) {
          .hero-cta-group {
            flex-direction: column;
          }
          :global(.hero-cta-btn) {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
