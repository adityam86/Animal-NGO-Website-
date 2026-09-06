"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Phone, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import ImageUploader from "@/components/shared/ImageUploader";
import FadeIn from "@/components/motion/FadeIn";
import PulseBeacon from "@/components/motion/PulseBeacon";

const InteractiveMap = dynamic(() => import("@/components/shared/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 320,
        background: "var(--cream-100)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--radius-lg)",
        color: "var(--stone-400)",
        fontSize: "0.9rem",
      }}
    >
      Loading map...
    </div>
  ),
});

const animalTypes = ["Dog", "Cat", "Cow", "Buffalo", "Goat", "Horse", "Bird", "Other"];
const conditions = ["Injured", "Sick", "Abandoned", "Trapped", "Accident", "Pregnant", "Other"];

type EmergencyLevel = "Critical" | "High" | "Normal";

const emergencyLevels: { level: EmergencyLevel; emoji: string; color: string; bg: string; desc: string }[] = [
  { level: "Critical", emoji: "🔴", color: "hsl(0,75%,45%)", bg: "hsl(0,80%,97%)", desc: "Life-threatening — needs immediate help" },
  { level: "High", emoji: "🟠", color: "hsl(28,88%,45%)", bg: "hsl(28,88%,97%)", desc: "Seriously injured or trapped" },
  { level: "Normal", emoji: "🟡", color: "hsl(45,90%,40%)", bg: "hsl(45,90%,97%)", desc: "Needs care but stable" },
];

export default function RescuePage() {
  const [submitted, setSubmitted] = useState(false);
  const [rescueId, setRescueId] = useState("");
  const [emergency, setEmergency] = useState<EmergencyLevel>("Normal");
  const [animalType, setAnimalType] = useState("");
  const [condition, setCondition] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reporterName = (document.getElementById("reporter-name") as HTMLInputElement).value;
      const reporterPhone = (document.getElementById("reporter-phone") as HTMLInputElement).value;
      const reporterEmail = (document.getElementById("reporter-email") as HTMLInputElement).value;
      const rawDesc = (document.getElementById("description") as HTMLTextAreaElement).value;
      const description = photoUrl ? `${rawDesc}\n\n[Incident Photo: ${photoUrl}]` : rawDesc;
      const locationInput = (document.getElementById("location-text") as HTMLInputElement).value;
      const finalLocation = coords
        ? `${locationInput || address} (GPS: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`
        : locationInput || address;

      const res = await fetch("/api/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterName,
          reporterPhone,
          reporterEmail,
          animalType,
          emergencyLevel: emergency,
          condition,
          description,
          location: finalLocation,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRescueId(data.id);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("Failed to submit rescue request.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    }
  };

  if (submitted) {
    return (
      <main style={{ paddingTop: "68px", minHeight: "85vh", background: "var(--cream-50)", display: "flex", alignItems: "center" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 580 }}>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
            <h1 style={{ color: "var(--green-600)", marginBottom: "0.75rem" }}>Rescue Request Received</h1>
            <div
              style={{
                background: "white",
                borderRadius: "var(--radius-xl)",
                padding: "2.25rem 2rem",
                border: "2px solid var(--green-200)",
                marginBottom: "2rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--stone-400)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                Your Rescue ID
              </div>
              <div style={{ fontSize: "2.2rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--saffron-500)", letterSpacing: "0.05em" }}>
                {rescueId}
              </div>
              <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "var(--stone-500)", margin: 0 }}>
                Save this ID to track real-time rescue status
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem", textAlign: "left", background: "white", borderRadius: "var(--radius-lg)", padding: "1.75rem", border: "1px solid var(--cream-200)" }}>
              {["Rescue team notified immediately", "Team will contact you within 15 minutes", "Track your case with the Rescue ID above", "Emergency Hotline: +91 98000 00000"].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--green-500)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: "0.92rem", color: "var(--stone-700)" }}>{step}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link href={`/rescue/track?id=${rescueId}`} className="btn btn-primary btn-lg">
                  Track My Case
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link href="/" className="btn btn-outline btn-lg">
                  Back to Home
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ paddingTop: "68px" }}>
      {/* Header */}
      <section style={{ background: "hsl(0,75%,30%)", paddingBlock: "4rem 3.5rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <FadeIn direction="up" distance={20}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <PulseBeacon color="#ffffff" size={10} pulseScale={2.8} />
              <span style={{ color: "hsla(0,0%,100%,0.85)", fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Emergency Dispatch
              </span>
            </div>
            <h1 style={{ color: "white", marginBottom: "0.75rem" }}>Report an Animal in Distress</h1>
            <p style={{ color: "hsla(0,0%,100%,0.85)", maxWidth: 520, marginInline: "auto", fontSize: "1.05rem", lineHeight: 1.75 }}>
              Fill this form and our field rescue team will respond. For immediate life-threatening emergencies, call <strong style={{ color: "white" }}>+91 98000 00000</strong> directly.
            </p>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} style={{ display: "inline-block", marginTop: "1.5rem" }}>
              <a
                href="tel:+919800000000"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.75rem 1.75rem",
                  background: "white",
                  color: "hsl(0,75%,35%)",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  borderRadius: "var(--radius-full)",
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <Phone size={18} /> Call 24/7 Hotline
              </a>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* Form */}
      <section className="section" style={{ background: "var(--cream-50)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <FadeIn direction="up" distance={25}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              {/* Reporter details */}
              <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: "1.05rem", color: "var(--stone-800)" }}>Your Contact Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reporter-name">Your Name *</label>
                    <input id="reporter-name" required className="form-input" placeholder="Full name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reporter-phone">Phone Number *</label>
                    <input id="reporter-phone" required type="tel" className="form-input" placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reporter-email">Email Address</label>
                  <input id="reporter-email" type="email" className="form-input" placeholder="your@email.com" />
                </div>
              </div>

              {/* Animal details */}
              <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", display: "flex", flexDirection: "column", gap: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: "1.05rem", color: "var(--stone-800)" }}>Animal Information</h3>

                <div className="form-group">
                  <label className="form-label">Animal Type *</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {animalTypes.map((t) => (
                      <motion.button
                        key={t}
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setAnimalType(t)}
                        style={{
                          padding: "0.45rem 1rem",
                          borderRadius: "var(--radius-full)",
                          border: "1.5px solid",
                          borderColor: animalType === t ? "var(--saffron-500)" : "var(--cream-300)",
                          background: animalType === t ? "var(--saffron-50)" : "white",
                          color: animalType === t ? "var(--saffron-700)" : "var(--stone-600)",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {t}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition *</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {conditions.map((c) => (
                      <motion.button
                        key={c}
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setCondition(c)}
                        style={{
                          padding: "0.45rem 1rem",
                          borderRadius: "var(--radius-full)",
                          border: "1.5px solid",
                          borderColor: condition === c ? "var(--saffron-500)" : "var(--cream-300)",
                          background: condition === c ? "var(--saffron-50)" : "white",
                          color: condition === c ? "var(--saffron-700)" : "var(--stone-600)",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {c}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description *</label>
                  <textarea id="description" required className="form-textarea" placeholder="Describe the animal's condition, approximate size, colour, visible injuries..." />
                </div>
              </div>

              {/* Location */}
              <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", display: "flex", flexDirection: "column", gap: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", color: "var(--stone-800)", marginBottom: "0.25rem" }}>Location & GPS Pin</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--stone-500)", margin: 0 }}>
                    Click on the map to pin the exact animal position or click &quot;Locate Me&quot; to use device GPS.
                  </p>
                </div>

                <InteractiveMap
                  mode="picker"
                  height={280}
                  onLocationSelect={(lat, lng, addr) => {
                    setCoords({ lat, lng });
                    if (addr) setAddress(addr);
                  }}
                />

                <div className="form-group">
                  <label className="form-label" htmlFor="location-text">Address / Landmark *</label>
                  <input
                    id="location-text"
                    required
                    className="form-input"
                    placeholder="e.g. Near Raniganj railway station, NH-19..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Emergency Level */}
              <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: "1.05rem", color: "var(--stone-800)", marginBottom: "1.25rem" }}>Emergency Urgency Level *</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {emergencyLevels.map(({ level, emoji, color, bg, desc }) => (
                    <motion.label
                      key={level}
                      whileHover={{ scale: 1.01 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem 1.25rem",
                        borderRadius: "var(--radius-lg)",
                        cursor: "pointer",
                        border: `2px solid ${emergency === level ? color : "var(--cream-200)"}`,
                        background: emergency === level ? bg : "white",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <input
                        type="radio"
                        name="emergency"
                        value={level}
                        checked={emergency === level}
                        onChange={() => setEmergency(level)}
                        style={{ accentColor: color }}
                      />
                      <span style={{ fontSize: "1.25rem" }}>{emoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, color, fontSize: "0.95rem" }}>{level}</div>
                        <div style={{ fontSize: "0.82rem", color: "var(--stone-500)" }}>{desc}</div>
                      </div>
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* Upload photo */}
              <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <ImageUploader
                  label="Upload Animal Incident Photo (optional)"
                  value={photoUrl}
                  onChange={(url) => setPhotoUrl(url)}
                  helperText="Upload a photo of the injured or stranded animal. This helps our field rescue team prepare medical kits and dispatch the right vehicle."
                />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  type="submit"
                  className="btn btn-emergency btn-lg"
                  style={{ width: "100%", justifyContent: "center", fontSize: "1.1rem", padding: "1rem" }}
                >
                  🚨 Submit Rescue Request
                </button>
              </motion.div>
            </form>
          </FadeIn>

          <div style={{ marginTop: "1.75rem", padding: "1.1rem 1.35rem", background: "var(--saffron-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--saffron-200)", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <AlertTriangle size={18} style={{ color: "var(--saffron-600)", marginTop: "2px", flexShrink: 0 }} />
            <p style={{ fontSize: "0.88rem", color: "var(--stone-700)", margin: 0, lineHeight: 1.65 }}>
              For life-threatening emergencies, please call <strong>+91 98000 00000</strong> immediately instead of — or in addition to — submitting this form.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
