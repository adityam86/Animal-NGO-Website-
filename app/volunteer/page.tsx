"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import FadeIn from "@/components/motion/FadeIn";
import HoverCard from "@/components/motion/HoverCard";

const volunteerRoles = [
  "Animal Rescue",
  "Feeding Programs",
  "Photography",
  "Videography",
  "Social Media",
  "Fundraising",
  "Veterinary Support",
  "Event Management",
];

const availability = ["Weekdays", "Weekends", "Evenings only", "Full-time (temporary)"];

export default function VolunteerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedAvail, setSelectedAvail] = useState<string[]>([]);

  const toggleRole = (r: string) =>
    setSelectedRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  const toggleAvail = (a: string) =>
    setSelectedAvail((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoles.length === 0) {
      alert("Please select at least one role.");
      return;
    }
    try {
      const name = (document.getElementById("vol-name") as HTMLInputElement).value;
      const age = (document.getElementById("vol-age") as HTMLInputElement).value;
      const phone = (document.getElementById("vol-phone") as HTMLInputElement).value;
      const email = (document.getElementById("vol-email") as HTMLInputElement).value;
      const location = (document.getElementById("vol-location") as HTMLInputElement).value;
      const experience = (document.getElementById("vol-experience") as HTMLTextAreaElement).value;

      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age,
          phone,
          email,
          location,
          experience,
          roles: selectedRoles,
          availability: selectedAvail,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("Failed to submit application.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    }
  };

  if (submitted) {
    return (
      <main style={{ paddingTop: "68px", minHeight: "85vh", background: "var(--cream-50)", display: "flex", alignItems: "center" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 540 }}>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🙌</div>
            <h1 style={{ color: "var(--green-600)", marginBottom: "0.75rem" }}>Welcome to the Team!</h1>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.75, marginBottom: "2rem", color: "var(--stone-600)" }}>
              We&apos;ve received your volunteer application. Our coordinators will review your interests and contact you within <strong>3 business days</strong>. Get ready to change some lives!
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn btn-primary"
              onClick={() => setSubmitted(false)}
              style={{ cursor: "pointer" }}
            >
              Submit Another Application
            </motion.button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ paddingTop: "68px" }}>
      {/* Header */}
      <section style={{ position: "relative", minHeight: 400, display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Image src="/images/volunteer_banner.jpg" alt="Ayudar volunteers" fill style={{ objectFit: "cover", objectPosition: "center 30%" }} priority />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,20,15,0.88) 0%, rgba(10,20,15,0.45) 70%, transparent 100%)" }} />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <FadeIn direction="up" distance={20} style={{ maxWidth: 540 }}>
            <div className="section-tag" style={{ background: "hsla(142,55%,35%,0.3)", color: "var(--green-200)" }}>
              Join Us
            </div>
            <h1 style={{ color: "white", marginBottom: "0.75rem", fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" }}>
              Volunteer with Ayudar
            </h1>
            <p style={{ color: "hsla(0,0%,100%,0.85)", fontSize: "1.1rem", lineHeight: 1.75 }}>
              No experience needed — just compassion. Join 86+ volunteers already saving and nursing animals across our region every day.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Why volunteer */}
      <section style={{ background: "var(--green-700)", paddingBlock: "3rem" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", textAlign: "center" }}>
            {[
              { icon: "🐾", title: "Save Lives", desc: "Directly participate in rescues, medical aid, and daily animal care" },
              { icon: "📸", title: "Tell Stories", desc: "Document rescues through photography, video, and social media" },
              { icon: "🤝", title: "Build Community", desc: "Join a dedicated family of compassionate changemakers" },
              { icon: "📜", title: "Get Certified", desc: "Receive volunteer certificates for academic or resume portfolios" },
            ].map((item, idx) => (
              <FadeIn key={item.title} delay={idx * 0.08} direction="up" distance={15}>
                <HoverCard lift={4} scale={1.02}>
                  <div style={{ color: "white", padding: "1.25rem", background: "rgba(255,255,255,0.06)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <div style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, marginBottom: "0.35rem", fontSize: "1.05rem" }}>{item.title}</div>
                    <div style={{ fontSize: "0.85rem", color: "hsla(0,0%,100%,0.75)", lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </HoverCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section" style={{ background: "var(--cream-50)" }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <FadeIn direction="up" distance={25}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div className="section-tag">Apply</div>
              <h2>Volunteer Registration</h2>
              <p style={{ marginTop: "0.5rem", color: "var(--stone-600)" }}>Fill this form and we&apos;ll get in touch within 3 days.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              {/* Personal info */}
              <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", display: "flex", flexDirection: "column", gap: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: "1.05rem", color: "var(--stone-800)" }}>Personal Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="vol-name">Full Name *</label>
                    <input id="vol-name" required className="form-input" placeholder="Your full name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="vol-age">Age *</label>
                    <input id="vol-age" required type="number" min="14" className="form-input" placeholder="e.g. 22" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="vol-phone">Phone Number *</label>
                    <input id="vol-phone" required type="tel" className="form-input" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="vol-email">Email Address *</label>
                    <input id="vol-email" required type="email" className="form-input" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="vol-location">Your Location / City</label>
                  <input id="vol-location" className="form-input" placeholder="e.g. Raniganj, Asansol, Durgapur..." />
                </div>
              </div>

              {/* Roles */}
              <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: "1.05rem", marginBottom: "1.25rem", color: "var(--stone-800)" }}>I am interested in (select all that apply) *</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  {volunteerRoles.map((r) => (
                    <motion.button
                      key={r}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleRole(r)}
                      style={{
                        padding: "0.5rem 1.1rem",
                        borderRadius: "var(--radius-full)",
                        border: "1.5px solid",
                        borderColor: selectedRoles.includes(r) ? "var(--green-500)" : "var(--cream-300)",
                        background: selectedRoles.includes(r) ? "var(--green-50)" : "white",
                        color: selectedRoles.includes(r) ? "var(--green-700)" : "var(--stone-600)",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {selectedRoles.includes(r) ? "✓ " : ""}{r}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: "1.05rem", marginBottom: "1.25rem", color: "var(--stone-800)" }}>Availability</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  {availability.map((a) => (
                    <motion.button
                      key={a}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleAvail(a)}
                      style={{
                        padding: "0.5rem 1.1rem",
                        borderRadius: "var(--radius-full)",
                        border: "1.5px solid",
                        borderColor: selectedAvail.includes(a) ? "var(--saffron-500)" : "var(--cream-300)",
                        background: selectedAvail.includes(a) ? "var(--saffron-50)" : "white",
                        color: selectedAvail.includes(a) ? "var(--saffron-700)" : "var(--stone-600)",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {a}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="form-group">
                <label className="form-label" htmlFor="vol-experience">Skills / Experience (optional)</label>
                <textarea id="vol-experience" className="form-textarea" placeholder="Tell us about any relevant skills — driving, photography, handling dogs/cats/cows, first aid, translation..." />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button type="submit" className="btn btn-green btn-lg" style={{ width: "100%", justifyContent: "center", fontSize: "1.05rem" }}>
                  🙌 Submit Volunteer Application
                </button>
              </motion.div>
            </form>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
