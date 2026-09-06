"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import PulseBeacon from "@/components/motion/PulseBeacon";

export default function HeroSection() {
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      {/* Background image with gentle parallax/zoom feel */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <motion.div
          initial={{ scale: 1.08 }}
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
        {/* Cinematic Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, rgba(15,10,5,0.85) 0%, rgba(15,10,5,0.60) 50%, rgba(15,10,5,0.20) 100%)",
        }} />
      </div>

      <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "7rem", paddingBottom: "4rem" }}>
        <div style={{ maxWidth: 640 }}>
          {/* Tag / Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.6rem",
              padding: "0.45rem 1.1rem",
              background: "hsla(26,88%,50%,0.22)",
              border: "1px solid hsla(26,88%,50%,0.45)",
              borderRadius: "var(--radius-full)",
              color: "var(--saffron-300)",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
              backdropFilter: "blur(8px)",
            }}>
              <PulseBeacon color="var(--saffron-400)" size={8} pulseScale={2.5} />
              Ayudar Animal Welfare Foundation
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              color: "white",
              fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
              lineHeight: 1.1,
              marginBottom: "1.25rem",
              fontWeight: 600,
            }}
          >
            Every Animal Deserves a
            <br />
            <span style={{ color: "var(--saffron-400)" }}>Second Chance</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              color: "hsla(0,0%,100%,0.85)",
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              lineHeight: 1.75,
              marginBottom: "2.5rem",
              maxWidth: 520,
            }}
          >
            We rescue, heal, and find loving homes for injured and abandoned animals across Raniganj, Asansol & Durgapur.
            Report an animal in distress — our team responds 24/7.
          </motion.p>

          {/* CTAs with tactile spring hover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}
          >
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link href="/rescue" className="btn btn-emergency btn-lg" style={{ boxShadow: "0 8px 20px hsla(0, 80%, 45%, 0.4)" }}>
                🚨 Report an Animal
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link href="/donate" className="btn btn-white btn-lg">
                ❤️ Donate Now
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link href="/adoption" className="btn btn-outline btn-lg" style={{ borderColor: "rgba(255,255,255,0.6)", color: "white" }}>
                Adopt a Pet
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            style={{
              display: "flex", flexWrap: "wrap", gap: "1.5rem",
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: "1px solid hsla(0,0%,100%,0.15)",
            }}
          >
            {[
              { n: "1,250+", label: "Animals Rescued" },
              { n: "420+", label: "Adopted" },
              { n: "₹4.2L+", label: "Medical Aid" },
              { n: "24/7", label: "Emergency Response" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.75 + idx * 0.1 }}
              >
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--saffron-400)", fontFamily: "var(--font-display)", lineHeight: 1 }}>
                  {stat.n}
                </div>
                <div style={{ fontSize: "0.75rem", color: "hsla(0,0%,100%,0.6)", marginTop: "0.25rem" }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll cue with smooth bounce */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem",
          color: "hsla(0,0%,100%,0.5)", fontSize: "0.7rem", letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        <span>Scroll</span>
        <div style={{ width: 1, height: 32, background: "hsla(0,0%,100%,0.3)" }} />
      </motion.div>
    </section>
  );
}
