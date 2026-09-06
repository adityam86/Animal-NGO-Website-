"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/motion/FadeIn";
import PulseBeacon from "@/components/motion/PulseBeacon";

export default function EmergencyRescueBanner() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, hsl(0,75%,35%) 0%, hsl(0,80%,45%) 100%)",
        paddingBlock: "3.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "hsla(0,0%,100%,0.05)" }} />
      <div style={{ position: "absolute", bottom: -60, left: -20, width: 160, height: 160, borderRadius: "50%", background: "hsla(0,0%,100%,0.05)" }} />

      <div className="container">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem", alignItems: "center", justifyContent: "space-between" }}>
          <FadeIn direction="left" distance={25} style={{ maxWidth: 560 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <PulseBeacon color="#ffffff" size={10} pulseScale={2.8} />
                <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "hsla(0,0%,100%,0.85)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Emergency Rescue — Available 24/7
                </div>
              </div>
              <h2 style={{ color: "white", fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)", marginBottom: "0.85rem", lineHeight: 1.2 }}>
                Spotted an Injured or Abandoned Animal?
              </h2>
              <p style={{ color: "hsla(0,0%,100%,0.85)", lineHeight: 1.75, fontSize: "1rem", margin: 0 }}>
                Don&apos;t wait — our rescue team is ready 24/7. Report through our form or call our emergency number immediately.
                We reach most locations within <strong style={{ color: "white" }}>30 minutes</strong>.
              </p>
            </div>
          </FadeIn>

          <FadeIn direction="right" distance={25}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} style={{ width: "100%" }}>
                <Link
                  href="/rescue"
                  className="btn btn-white btn-lg"
                  style={{ minWidth: 220, justifyContent: "center", width: "100%", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                >
                  🚨 Report an Animal
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} style={{ width: "100%" }}>
                <a
                  href="tel:+919800000000"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.65rem",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    textDecoration: "none",
                    padding: "0.75rem 1.5rem",
                    background: "hsla(0,0%,100%,0.16)",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid hsla(0,0%,100%,0.35)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Phone size={18} /> +91 98000 00000
                </a>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
