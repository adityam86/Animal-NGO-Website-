"use client";

import Image from "next/image";
import Link from "next/link";
import { URGENT_MEDICAL_CASES } from "@/lib/data";
import FadeIn from "@/components/motion/FadeIn";
import HoverCard from "@/components/motion/HoverCard";

export default function UrgentCasesStrip() {
  return (
    <section className="section" style={{ background: "white", borderBottom: "1px solid var(--cream-200)" }}>
      <div className="container">
        <FadeIn direction="up" distance={20}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", marginBottom: "2.5rem" }}>
            <div>
              <div className="section-tag" style={{ background: "var(--emergency-50)", color: "var(--crimson, #D64545)" }}>
                🚨 Urgent Medical Cases
              </div>
              <h2>Animals Needing Treatment Right Now</h2>
              <p style={{ maxWidth: 540, marginTop: "0.5rem", color: "var(--stone-600)", marginBottom: 0 }}>
                Every contribution goes straight to diagnostics, surgical supplies, and recovery nutrition for active hospital residents.
              </p>
            </div>
            <Link href="/donate#urgent-cases" className="btn btn-outline">
              All Fundraisers →
            </Link>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1.5rem" }}>
          {URGENT_MEDICAL_CASES.map((item, idx) => {
            const pct = Math.min(100, Math.round((item.raisedInr / item.goalInr) * 100));
            return (
              <FadeIn key={item.id} delay={idx * 0.08} direction="up" distance={20}>
                <HoverCard lift={5} scale={1.015} style={{ height: "100%" }}>
                  <div
                    className="card"
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: "var(--radius-xl)",
                      background: "var(--cream-50)",
                    }}
                  >
                    <div style={{ position: "relative", height: 210 }}>
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                      <div
                        style={{
                          position: "absolute",
                          top: "0.85rem",
                          left: "0.85rem",
                          padding: "0.28rem 0.75rem",
                          borderRadius: "999px",
                          background: "var(--crimson, #D64545)",
                          color: "white",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                        }}
                      >
                        Urgent Care • {item.species}
                      </div>
                    </div>

                    <div style={{ padding: "1.35rem", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", gap: "1rem" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
                          <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{item.name}</h3>
                          <span style={{ fontSize: "0.76rem", color: "var(--stone-500)", fontWeight: 600 }}>{item.supporters} supporters</span>
                        </div>
                        <p style={{ fontSize: "0.88rem", color: "var(--stone-600)", lineHeight: 1.6, margin: 0 }}>
                          {item.summary}
                        </p>
                      </div>

                      <div>
                        {/* Visual Funding Progress Bar */}
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                          <span style={{ color: "var(--green-700)" }}>₹{item.raisedInr.toLocaleString("en-IN")} raised</span>
                          <span style={{ color: "var(--stone-500)" }}>Goal: ₹{item.goalInr.toLocaleString("en-IN")}</span>
                        </div>
                        <div style={{ height: 9, borderRadius: "999px", background: "var(--cream-200)", overflow: "hidden", marginBottom: "1rem" }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: "linear-gradient(90deg, #1E3A2F 0%, #E07A5F 100%)",
                              borderRadius: "999px",
                            }}
                          />
                        </div>

                        <Link
                          href={`/donate?amount=${item.suggestedAmount}&purpose=${encodeURIComponent(item.purpose)}#donate-form`}
                          className="btn btn-terracotta btn-sm"
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          ❤️ Help {item.name} (₹{item.suggestedAmount.toLocaleString("en-IN")})
                        </Link>
                      </div>
                    </div>
                  </div>
                </HoverCard>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
