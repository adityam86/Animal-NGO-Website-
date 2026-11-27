"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import PulseBeacon from "@/components/motion/PulseBeacon";
import { AYUDAR_LEGAL } from "@/lib/data";

export default function HeroSection() {
  return (
    <section style={{ position: "relative", minHeight: "94vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      {/* Background image */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <motion.div
          initial={{ scale: 1.07 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          style={{ width: "100%", height: "100%", position: "relative" }}
        >
          <Image
            src="/images/hero_banner.jpg"
            alt="A rescued dog being cared for by an Ayudar volunteer"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center 30%" }}
          />
        </motion.div>
        {/* Deep Forest & Warm Earth Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(105deg, rgba(20, 40, 31, 0.92) 0%, rgba(30, 58, 47, 0.72) 52%, rgba(20, 38, 30, 0.28) 100%)",
          }}
        />
      </div>

      <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "7.5rem", paddingBottom: "4.5rem" }}>
        <div style={{ maxWidth: 660 }}>
          {/* Verification Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.45rem 1.1rem",
                background: "rgba(230, 239, 233, 0.14)",
                border: "1px solid rgba(230, 239, 233, 0.35)",
                borderRadius: "var(--radius-full)",
                color: "#E6EFE9",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "1.4rem",
                backdropFilter: "blur(8px)",
              }}
            >
              <PulseBeacon color="#E07A5F" size={8} pulseScale={2.5} />
              {AYUDAR_LEGAL.shortName} • {AYUDAR_LEGAL.tagline} • Reg. {AYUDAR_LEGAL.regNo}
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              color: "white",
              fontSize: "clamp(2.45rem, 5.5vw, 4.1rem)",
              lineHeight: 1.08,
              marginBottom: "1.25rem",
              fontWeight: 600,
            }}
          >
            Every street life deserves a{" "}
            <span style={{ color: "#E07A5F" }}>second chance</span>
          </motion.h1>

          {/* Official Mission + Local Scope */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              color: "rgba(250, 247, 242, 0.88)",
              fontSize: "clamp(1rem, 2vw, 1.18rem)",
              lineHeight: 1.75,
              marginBottom: "2.25rem",
              maxWidth: 550,
            }}
          >
            {AYUDAR_LEGAL.mission} Rapid 24/7 street rescue, veterinary surgery, gaushala shelter, and vetted adoptions across Raniganj, Asansol &amp; Durgapur.
          </motion.p>

          {/* Dual-Intent CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}
          >
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link href="/donate" className="btn btn-terracotta btn-lg" style={{ boxShadow: "0 10px 26px rgba(224, 122, 95, 0.42)" }}>
                ❤️ Donate to Save a Life
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link href="/rescue" className="btn btn-emergency btn-lg" style={{ boxShadow: "0 8px 22px rgba(214, 69, 69, 0.42)" }}>
                🚨 Found an Injured Animal? (Ayuda)
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust & 80G Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.75rem",
              marginTop: "3rem",
              paddingTop: "1.75rem",
              borderTop: "1px solid rgba(255,255,255,0.16)",
            }}
          >
            {[
              { n: "1,250+", label: "Animals Rescued" },
              { n: "420+", label: "Happy Adoptions" },
              { n: "80G Exempt", label: `URN: ${AYUDAR_LEGAL.urn80G}` },
              { n: "24/7 Ayuda", label: "Emergency Dispatch" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.75 + idx * 0.08 }}
              >
                <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#E07A5F", fontFamily: "var(--font-display)", lineHeight: 1.1 }}>
                  {stat.n}
                </div>
                <div style={{ fontSize: "0.75rem", color: "rgba(250, 247, 242, 0.68)", marginTop: "0.25rem" }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
