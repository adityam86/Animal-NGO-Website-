"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FadeIn from "@/components/motion/FadeIn";

export default function DonateCTA() {
  const amounts = [100, 500, 1000, 2500, 5000];

  return (
    <section
      className="section"
      style={{
        background: "linear-gradient(135deg, var(--saffron-600) 0%, var(--saffron-500) 60%, hsl(28,85%,58%) 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative ambient bubbles */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "hsla(0,0%,100%,0.06)" }} />
      <div style={{ position: "absolute", bottom: -60, left: -40, width: 240, height: 240, borderRadius: "50%", background: "hsla(0,0%,100%,0.06)" }} />
      <div style={{ position: "absolute", top: "30%", left: "30%", width: 160, height: 160, borderRadius: "50%", background: "hsla(0,0%,100%,0.04)" }} />

      <div className="container" style={{ position: "relative", textAlign: "center" }}>
        <FadeIn direction="up" distance={24}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1.1rem",
              background: "hsla(0,0%,100%,0.2)",
              borderRadius: "var(--radius-full)",
              color: "white",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
              backdropFilter: "blur(6px)",
            }}
          >
            ❤️ Make a Difference
          </div>

          <h2 style={{ color: "white", fontSize: "clamp(1.8rem, 3.8vw, 2.85rem)", marginBottom: "1rem" }}>
            Help Us Save More Lives
          </h2>
          <p
            style={{
              color: "hsla(0,0%,100%,0.9)",
              fontSize: "1.05rem",
              maxWidth: 540,
              marginInline: "auto",
              marginBottom: "2.5rem",
              lineHeight: 1.75,
            }}
          >
            Your donation directly funds emergency rescue, veterinary surgery, food, and shelter for street animals who have nowhere else to go.
          </p>

          {/* Quick amount chips with tactile spring motion */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.85rem",
              justifyContent: "center",
              marginBottom: "2.25rem",
            }}
          >
            {amounts.map((amount) => (
              <motion.div key={amount} whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.94 }}>
                <Link
                  href={`/donate?amount=${amount}`}
                  style={{
                    display: "inline-block",
                    padding: "0.65rem 1.5rem",
                    background: "hsla(0,0%,100%,0.2)",
                    border: "1.5px solid hsla(0,0%,100%,0.5)",
                    borderRadius: "var(--radius-full)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  ₹{amount.toLocaleString("en-IN")}
                </Link>
              </motion.div>
            ))}

            <motion.div whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.94 }}>
              <Link
                href="/donate"
                style={{
                  display: "inline-block",
                  padding: "0.65rem 1.5rem",
                  background: "hsla(0,0%,100%,0.2)",
                  border: "1.5px solid hsla(0,0%,100%,0.5)",
                  borderRadius: "var(--radius-full)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  backdropFilter: "blur(4px)",
                }}
              >
                Custom ✏️
              </Link>
            </motion.div>
          </div>

          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-block" }}>
            <Link
              href="/donate"
              className="btn btn-white btn-lg"
              style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.15)", fontSize: "1.05rem" }}
            >
              Donate Now — Save a Life
            </Link>
          </motion.div>

          <p style={{ color: "hsla(0,0%,100%,0.7)", fontSize: "0.82rem", marginTop: "1.75rem" }}>
            🔒 Secure payment via Razorpay &nbsp;|&nbsp; 80G Tax Exemption Available
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
