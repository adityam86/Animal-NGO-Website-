"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import FadeIn from "@/components/motion/FadeIn";
import { AYUDAR_LEGAL, DONATION_AMOUNTS, DONATION_IMPACT_MAP } from "@/lib/data";

export default function DonateCTA() {
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [selectedAmount, setSelectedAmount] = useState<number>(1500);
  const [customAmount, setCustomAmount] = useState<string>("");

  const effectiveAmount = customAmount ? Math.max(0, parseInt(customAmount, 10) || 0) : selectedAmount;

  const impactPreview = customAmount
    ? effectiveAmount >= 3500
      ? "Sponsors critical medical recovery, vaccines & shelter meals"
      : effectiveAmount >= 500
      ? "Feeds & medicates injured street animals directly at our shelter"
      : "Every single rupee buys bandages, ORS & nutritious meals"
    : DONATION_IMPACT_MAP[selectedAmount] || "Direct medical & nutritional aid";

  return (
    <section
      className="section"
      style={{
        background: "linear-gradient(135deg, #1E3A2F 0%, #152B22 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(224, 122, 95, 0.12)" }} />
      <div style={{ position: "absolute", bottom: -60, left: -40, width: 240, height: 240, borderRadius: "50%", background: "rgba(230, 239, 233, 0.08)" }} />

      <div className="container" style={{ position: "relative" }}>
        <FadeIn direction="up" distance={24}>
          <div
            style={{
              maxWidth: 760,
              marginInline: "auto",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              borderRadius: "var(--radius-xl)",
              padding: "clamp(1.75rem, 4vw, 3rem)",
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 1.05rem",
                background: "rgba(224, 122, 95, 0.22)",
                border: "1px solid rgba(224, 122, 95, 0.4)",
                borderRadius: "var(--radius-full)",
                color: "#fed7aa",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              ❤️ Quick Impact Donation
            </div>

            <h2 style={{ color: "white", fontSize: "clamp(1.75rem, 3.6vw, 2.65rem)", marginBottom: "0.75rem" }}>
              Turn Compassion Into Immediate Care
            </h2>
            <p style={{ color: "rgba(250, 247, 242, 0.85)", fontSize: "1rem", maxWidth: 540, marginInline: "auto", marginBottom: "1.75rem", lineHeight: 1.7 }}>
              Choose a preset impact tier and proceed straight to secure UPI / GPay / Card checkout via Razorpay.
            </p>

            {/* Monthly / One-Time Toggle */}
            <div style={{ display: "inline-flex", background: "rgba(0,0,0,0.28)", borderRadius: "999px", padding: "0.3rem", marginBottom: "1.5rem" }}>
              {(["one-time", "monthly"] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  style={{
                    padding: "0.45rem 1.2rem",
                    borderRadius: "999px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    background: frequency === freq ? "#E07A5F" : "transparent",
                    color: "white",
                  }}
                >
                  {freq === "one-time" ? "One-Time Gift" : "Monthly Care"}
                </button>
              ))}
            </div>

            {/* Preset Rupee Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginBottom: "1.25rem" }}>
              {DONATION_AMOUNTS.slice(0, 3).map((amt) => {
                const active = !customAmount && selectedAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount("");
                    }}
                    style={{
                      padding: "0.7rem 1.5rem",
                      borderRadius: "var(--radius-full)",
                      border: `2px solid ${active ? "#E07A5F" : "rgba(255,255,255,0.3)"}`,
                      background: active ? "#E07A5F" : "rgba(255,255,255,0.08)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                  >
                    ₹{amt.toLocaleString("en-IN")}
                  </button>
                );
              })}

              <input
                type="number"
                min="10"
                placeholder="Custom ₹"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                aria-label="Custom donation amount in rupees"
                style={{
                  width: 125,
                  padding: "0.65rem 1rem",
                  borderRadius: "var(--radius-full)",
                  border: `2px solid ${customAmount ? "#E07A5F" : "rgba(255,255,255,0.3)"}`,
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  fontWeight: 700,
                  textAlign: "center",
                  outline: "none",
                }}
              />
            </div>

            {/* Dynamic Live Impact Preview */}
            <div
              style={{
                display: "inline-block",
                padding: "0.65rem 1.25rem",
                borderRadius: "var(--radius-lg)",
                background: "rgba(230, 239, 233, 0.14)",
                color: "#bbf7d0",
                fontWeight: 600,
                fontSize: "0.92rem",
                marginBottom: "1.75rem",
              }}
            >
              ✨ Impact Preview: {impactPreview}
            </div>

            <div>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-block" }}>
                <Link
                  href={`/donate?amount=${effectiveAmount || 500}&frequency=${frequency}#donate-form`}
                  className="btn btn-terracotta btn-lg"
                  style={{ boxShadow: "0 10px 26px rgba(224, 122, 95, 0.45)", fontSize: "1.05rem" }}
                >
                  Proceed to Donate ₹{(effectiveAmount || 500).toLocaleString("en-IN")} ({frequency === "monthly" ? "Monthly" : "Once"}) →
                </Link>
              </motion.div>
            </div>

            <p style={{ color: "rgba(250, 247, 242, 0.72)", fontSize: "0.8rem", marginTop: "1.35rem", marginBottom: 0 }}>
              🔒 UPI / GPay / Cards via Razorpay • 80G Tax Exempt (URN: {AYUDAR_LEGAL.urn80G})
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
