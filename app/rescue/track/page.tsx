"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import FadeIn from "@/components/motion/FadeIn";
import PulseBeacon from "@/components/motion/PulseBeacon";

export default function TrackRescuePage() {
  const [inputId, setInputId] = useState("");
  const [searched, setSearched] = useState(false);
  const [found, setFound] = useState<any>(null);

  const emergencyColors: Record<string, string> = {
    Critical: "hsl(0,75%,45%)",
    High: "hsl(28,88%,50%)",
    Normal: "hsl(45,90%,40%)",
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/rescue/${inputId.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setFound(data);
      } else {
        setFound(null);
      }
    } catch (err) {
      console.error(err);
      setFound(null);
    }
    setSearched(true);
  };

  return (
    <main style={{ paddingTop: "68px", minHeight: "80vh", background: "var(--cream-50)" }}>
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <FadeIn direction="up" distance={20}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div className="section-tag">Track Rescue</div>
              <h1 style={{ marginBottom: "0.75rem" }}>Track Your Rescue Case</h1>
              <p style={{ color: "var(--stone-600)" }}>Enter the Rescue ID you received after submitting your report.</p>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <input
                value={inputId}
                onChange={(e) => {
                  setInputId(e.target.value);
                  setSearched(false);
                }}
                className="form-input"
                placeholder="e.g. RES-2026-00125"
                style={{ flex: 1, fontSize: "1rem" }}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="btn btn-primary"
                style={{ gap: "0.4rem" }}
              >
                <Search size={16} /> Track
              </motion.button>
            </form>

            {/* Demo hint */}
            <div
              style={{
                marginBottom: "2rem",
                padding: "0.85rem 1rem",
                background: "var(--saffron-50)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--saffron-200)",
                fontSize: "0.85rem",
                color: "var(--stone-600)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>💡</span>
              <div>
                Demo: Click to try{" "}
                <strong
                  style={{ cursor: "pointer", color: "var(--saffron-700)", textDecoration: "underline" }}
                  onClick={() => setInputId("RES-2026-00125")}
                >
                  RES-2026-00125
                </strong>
              </div>
            </div>
          </FadeIn>

          {/* Result: Not found */}
          {searched && !found && (
            <FadeIn direction="up">
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  background: "white",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--cream-200)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔍</div>
                <h3>Case Not Found</h3>
                <p style={{ marginTop: "0.5rem", color: "var(--stone-600)" }}>
                  No rescue case matches that ID. Please double-check the ID or call our helpline.
                </p>
              </div>
            </FadeIn>
          )}

          {/* Result: Found */}
          {found && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: "white",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--cream-200)",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.07)",
              }}
            >
              {/* Case header */}
              <div style={{ background: "var(--stone-800)", padding: "1.75rem 2rem", color: "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "hsla(0,0%,100%,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                      Rescue Case
                    </div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.05em", fontFamily: "var(--font-display)" }}>
                      {found.id}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.4rem 1.1rem",
                      borderRadius: "var(--radius-full)",
                      background: emergencyColors[found.emergencyLevel] || "var(--saffron-500)",
                      color: "white",
                      fontWeight: 800,
                      fontSize: "0.82rem",
                      letterSpacing: "0.05em",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                  >
                    <PulseBeacon color="#ffffff" size={8} pulseScale={2.5} />
                    <span>{found.emergencyLevel}</span>
                  </div>
                </div>
              </div>

              {/* Case details */}
              <div style={{ padding: "1.75rem 2rem", borderBottom: "1px solid var(--cream-200)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  {[
                    { label: "Animal Type", value: found.animalType },
                    {
                      label: "Location",
                      value: (
                        <div>
                          <div>{found.location}</div>
                          {(() => {
                            const match = found.location?.match(/GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
                            if (match) {
                              return (
                                <a
                                  href={`https://www.google.com/maps?q=${match[1]},${match[2]}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontSize: "0.8rem",
                                    color: "var(--saffron-600)",
                                    fontWeight: 700,
                                    marginTop: "4px",
                                    textDecoration: "none",
                                  }}
                                >
                                  📍 View on Google Maps ↗
                                </a>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      ),
                    },
                    { label: "Assigned Team", value: found.assignedTeam || "Rapid Dispatch Unit 1" },
                    { label: "Current Status", value: found.status },
                  ].map((item) => (
                    <div key={item.label}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--stone-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>
                        {item.label}
                      </div>
                      <div style={{ fontWeight: 600, color: "var(--stone-800)", fontSize: "0.95rem" }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {found.description && (() => {
                  const photoMatch = found.description.match(/\[Incident Photo:\s*([^\]]+)\]/);
                  const cleanDesc = found.description.replace(/\[Incident Photo:\s*[^\]]+\]/, "").trim();
                  const photoUrl = photoMatch ? photoMatch[1].trim() : null;

                  return (
                    <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {cleanDesc && (
                        <div style={{ padding: "0.85rem 1rem", background: "var(--cream-50)", borderRadius: "var(--radius-md)" }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--stone-400)", textTransform: "uppercase", marginBottom: "0.35rem" }}>
                            Description
                          </div>
                          <p style={{ fontSize: "0.875rem", margin: 0, color: "var(--stone-700)", lineHeight: 1.6 }}>{cleanDesc}</p>
                        </div>
                      )}
                      {photoUrl && (
                        <div style={{ padding: "0.85rem 1rem", background: "var(--cream-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--cream-200)" }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--stone-400)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                            Incident Photo
                          </div>
                          <a href={photoUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
                            <img
                              src={photoUrl}
                              alt="Incident photo"
                              style={{ maxHeight: 240, maxWidth: "100%", borderRadius: "var(--radius-md)", objectFit: "cover", border: "1px solid var(--cream-300)" }}
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Status timeline */}
              <div style={{ padding: "1.75rem 2rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--stone-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1.25rem" }}>
                  Live Status Timeline
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {found.history.map((step: any, i: number) => {
                    const isCurrent = step.status === found.status;
                    return (
                      <div key={step.status} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: step.done ? "var(--green-500)" : "var(--cream-200)",
                            color: step.done ? "white" : "var(--stone-400)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            border: isCurrent ? "2px solid var(--saffron-400)" : "none",
                            boxShadow: isCurrent ? "0 0 10px rgba(249, 115, 22, 0.4)" : "none",
                          }}
                        >
                          {step.done ? "✓" : i + 1}
                        </div>
                        <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: step.done ? 700 : 400, color: step.done ? "var(--stone-800)" : "var(--stone-400)", fontSize: "0.92rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                            {step.status}
                            {isCurrent && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  fontSize: "0.72rem",
                                  background: "var(--saffron-100)",
                                  color: "var(--saffron-800)",
                                  padding: "0.15rem 0.55rem",
                                  borderRadius: "var(--radius-full)",
                                  fontWeight: 700,
                                }}
                              >
                                <PulseBeacon color="var(--saffron-600)" size={6} pulseScale={2.2} />
                                ACTIVE
                              </span>
                            )}
                          </span>
                          {step.time && <span style={{ fontSize: "0.78rem", color: "var(--stone-400)" }}>{step.time}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} style={{ display: "inline-block" }}>
              <Link href="/rescue" className="btn btn-outline">
                Submit Another Report
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
