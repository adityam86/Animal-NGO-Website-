"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AnimalCard from "@/components/shared/AnimalCard";
import FadeIn from "@/components/motion/FadeIn";

const types = ["All", "Dog", "Cat", "Cow", "Other"];
const statuses = ["All", "Available for Adoption", "Sponsored", "Under Treatment"];

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    async function fetchAnimals() {
      try {
        const res = await fetch("/api/animals");
        if (res.ok) {
          const data = await res.json();
          setAnimals(data);
        }
      } catch (err) {
        console.error("Failed to fetch animals:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnimals();
  }, []);

  const filtered = animals.filter((a) => {
    const typeOk = typeFilter === "All" || a.type === typeFilter;
    const statusOk = statusFilter === "All" || a.status === statusFilter;
    return typeOk && statusOk;
  });

  return (
    <main style={{ paddingTop: "68px" }}>
      {/* Header */}
      <section style={{ background: "var(--stone-800)", paddingBlock: "4.5rem 3.5rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <FadeIn direction="up" distance={20}>
            <div className="section-tag" style={{ background: "hsla(26,88%,50%,0.2)", color: "var(--saffron-300)" }}>
              Meet Our Animals
            </div>
            <h1 style={{ color: "white", marginBottom: "0.75rem" }}>Every Animal Has a Story</h1>
            <p style={{ color: "hsla(0,0%,100%,0.75)", maxWidth: 540, marginInline: "auto", fontSize: "1.05rem", lineHeight: 1.7 }}>
              Browse animals rescued and cared for at Ayudar. Each one is vaccinated, healthy, and waiting for your love.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Filters */}
      <section
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--cream-200)",
          padding: "1.25rem 0",
          position: "sticky",
          top: "68px",
          zIndex: 100,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}
      >
        <div className="container">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center" }}>
            {/* Type filters */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Type:
              </span>
              {types.map((t) => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setTypeFilter(t)}
                  style={{
                    padding: "0.35rem 0.95rem",
                    borderRadius: "var(--radius-full)",
                    border: "1.5px solid",
                    borderColor: typeFilter === t ? "var(--saffron-500)" : "var(--cream-300)",
                    background: typeFilter === t ? "var(--saffron-50)" : "white",
                    color: typeFilter === t ? "var(--saffron-700)" : "var(--stone-600)",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {t}
                </motion.button>
              ))}
            </div>

            {/* Status filters */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Status:
              </span>
              {statuses.map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: "0.35rem 0.95rem",
                    borderRadius: "var(--radius-full)",
                    border: "1.5px solid",
                    borderColor: statusFilter === s ? "var(--green-500)" : "var(--cream-300)",
                    background: statusFilter === s ? "var(--green-50)" : "white",
                    color: statusFilter === s ? "var(--green-700)" : "var(--stone-600)",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Animals Grid */}
      <section className="section" style={{ background: "var(--cream-50)", minHeight: "50vh" }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--stone-500)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🐾</div>
              <div>Loading animals...</div>
            </div>
          ) : filtered.length === 0 ? (
            <FadeIn direction="up">
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--stone-500)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🐾</div>
                <h3>No animals match your filters</h3>
                <p>Try adjusting the filters above.</p>
              </div>
            </FadeIn>
          ) : (
            <motion.div
              layout
              style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "center" }}
            >
              <AnimatePresence>
                {filtered.map((animal) => (
                  <motion.div
                    key={animal.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AnimalCard {...animal} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--saffron-50)", paddingBlock: "3.5rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <FadeIn direction="up" distance={20}>
            <h2 style={{ marginBottom: "1rem" }}>Can&apos;t Adopt? You Can Still Help</h2>
            <p style={{ maxWidth: 480, marginInline: "auto", marginBottom: "2rem", color: "var(--stone-600)", lineHeight: 1.7 }}>
              Sponsor an animal&apos;s monthly care, volunteer at the shelter, or donate to our medical fund.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link href="/sponsor" className="btn btn-primary">
                  Sponsor an Animal
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link href="/volunteer" className="btn btn-outline">
                  Volunteer
                </Link>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
