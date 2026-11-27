"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, MessageCircle, Camera, CheckCircle } from "lucide-react";
import PulseBeacon from "@/components/motion/PulseBeacon";
import { CONTACT_INFO } from "@/lib/data";

const SOS_CONDITIONS = ["Bleeding", "Fracture", "Abandoned Puppy", "Trapped", "Road Accident"];
const SOS_ANIMALS = ["Dog", "Cat", "Cow", "Bird", "Other"];

export default function EmergencyFAB() {
  const [visible, setVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [animalType, setAnimalType] = useState("Dog");
  const [condition, setCondition] = useState("Bleeding");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [landmark, setLandmark] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rescueId, setRescueId] = useState("");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const grabGps = () => {
    if (!navigator.geolocation) {
      setErrMsg("Device GPS unavailable — please enter landmark manually.");
      return;
    }
    setLocating(true);
    setErrMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setErrMsg("Could not read GPS permission. Please enter nearest landmark.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setErrMsg(null);
    try {
      const tokenRes = await fetch("/api/rescue/upload-token", { method: "POST" });
      const tokenJson = await tokenRes.json().catch(() => ({}));
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/rescue/upload", {
        method: "POST",
        headers: tokenJson.token ? { "x-upload-token": tokenJson.token } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not upload incident photo.");
      }
      setPhotoUrl(data.url);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Photo upload failed.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);
    const locationText = gps
      ? `${landmark || "Pinned GPS spot"} (GPS: ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)})`
      : landmark.trim();

    if (locationText.length < 4) {
      setErrMsg("Tap Grab GPS or type a nearby landmark.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterName: name.trim() || "SOS Bystander",
          reporterPhone: phone.trim(),
          animalType,
          condition,
          emergencyLevel: condition === "Bleeding" || condition === "Road Accident" ? "Critical" : "High",
          description: `Mobile SOS: ${animalType} (${condition}) reported near ${landmark || "GPS coordinates"}.`,
          location: locationText,
          photoUrl: photoUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send rescue alert.");
      }
      setRescueId(data.id);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Network error. Please call emergency helpline.");
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappSummary = encodeURIComponent(
    `🚨 AYUDA RESCUE ALERT${rescueId ? ` (${rescueId})` : ""}\nAnimal: ${animalType}\nCondition: ${condition}\nLocation: ${landmark || "GPS pinned"}${gps ? ` (https://maps.google.com/?q=${gps.lat.toFixed(5)},${gps.lng.toFixed(5)})` : ""}\nContact: ${phone || "On scene"}`
  );

  return (
    <>
      <AnimatePresence>
        {visible && !sheetOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="hide-desktop"
            style={{
              position: "fixed",
              bottom: "1.25rem",
              left: "1rem",
              zIndex: 999,
            }}
          >
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.78rem 1.15rem",
                background: "var(--crimson, #D64545)",
                color: "white",
                borderRadius: "var(--radius-full)",
                fontWeight: 700,
                fontSize: "0.9rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(214, 69, 69, 0.45)",
              }}
              aria-label="Open Ayuda quick SOS rescue drawer"
            >
              <PulseBeacon color="#ffffff" size={8} pulseScale={2.6} />
              <span>🚨 Ayuda SOS</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightweight Mobile SOS Bottom Sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 31, 22, 0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 1200,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            onClick={() => setSheetOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 520,
                maxHeight: "88vh",
                overflowY: "auto",
                background: "var(--color-surface)",
                borderRadius: "24px 24px 0 0",
                padding: "1.35rem 1.25rem 2rem",
                boxShadow: "0 -10px 40px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#D64545", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Ayuda 30-Second SOS
                  </div>
                  <h3 style={{ fontSize: "1.2rem", margin: 0, color: "var(--stone-800)" }}>Send Rescue Alert</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  style={{ background: "var(--cream-100)", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--stone-700)" }}
                  aria-label="Close SOS sheet"
                >
                  <X size={18} />
                </button>
              </div>

              {rescueId ? (
                <div style={{ textAlign: "center", paddingBlock: "1rem" }}>
                  <CheckCircle size={40} style={{ color: "var(--green-600)", marginInline: "auto", marginBottom: "0.65rem" }} />
                  <h4 style={{ color: "var(--green-700)", marginBottom: "0.35rem" }}>Alert Sent! ID: {rescueId}</h4>
                  <p style={{ fontSize: "0.86rem", color: "var(--stone-600)", marginBottom: "1.25rem" }}>
                    Our dispatch team received your alert. Keep phone nearby or tap WhatsApp to share live directions.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                    <a
                      href={`https://wa.me/?text=${whatsappSummary}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-green"
                      style={{ justifyContent: "center", width: "100%" }}
                    >
                      <MessageCircle size={17} /> Send Alert on WhatsApp
                    </a>
                    <Link
                      href={`/rescue/track?id=${rescueId}`}
                      onClick={() => setSheetOpen(false)}
                      className="btn btn-outline"
                      style={{ justifyContent: "center", width: "100%" }}
                    >
                      Track Rescue Status
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.95rem" }}>
                  {/* 1-Tap GPS */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={grabGps}
                      disabled={locating}
                      style={{
                        flex: 1,
                        padding: "0.65rem 0.9rem",
                        borderRadius: "var(--radius-md)",
                        background: gps ? "var(--green-50)" : "var(--cream-100)",
                        border: `1.5px solid ${gps ? "var(--green-500)" : "var(--cream-300)"}`,
                        color: gps ? "var(--green-700)" : "var(--stone-800)",
                        fontWeight: 700,
                        fontSize: "0.84rem",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                        cursor: "pointer",
                      }}
                    >
                      <MapPin size={15} />
                      {locating ? "Locating..." : gps ? `GPS Locked (${gps.lat.toFixed(3)}, ${gps.lng.toFixed(3)})` : "Use My Current GPS"}
                    </button>
                    <a
                      href={`tel:${CONTACT_INFO.emergencyPhone}`}
                      style={{
                        padding: "0.65rem 0.9rem",
                        borderRadius: "var(--radius-md)",
                        background: "#FDF0F0",
                        border: "1.5px solid #F9CACA",
                        color: "#D64545",
                        fontWeight: 700,
                        fontSize: "0.84rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <Phone size={15} /> Call
                    </a>
                  </div>

                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nearest landmark / road (e.g. Near Raniganj Stn)"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />

                  {/* Animal & Condition chips */}
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--stone-500)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                      Animal &amp; Condition
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                      {SOS_ANIMALS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setAnimalType(a)}
                          style={{
                            padding: "0.3rem 0.7rem",
                            borderRadius: "999px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            border: `1.5px solid ${animalType === a ? "#1E3A2F" : "var(--cream-300)"}`,
                            background: animalType === a ? "#E6EFE9" : "var(--color-surface)",
                            color: "var(--stone-800)",
                            cursor: "pointer",
                          }}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {SOS_CONDITIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCondition(c)}
                          style={{
                            padding: "0.3rem 0.7rem",
                            borderRadius: "999px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            border: `1.5px solid ${condition === c ? "#D64545" : "var(--cream-300)"}`,
                            background: condition === c ? "#FDF0F0" : "var(--color-surface)",
                            color: condition === c ? "#A62828" : "var(--stone-700)",
                            cursor: "pointer",
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Contact + Photo */}
                  <div className="responsive-grid-2">
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Your name *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <input
                      type="tel"
                      required
                      className="form-input"
                      placeholder="Phone number *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1.5px dashed var(--cream-300)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: photoUrl ? "var(--green-700)" : "var(--stone-600)",
                      cursor: "pointer",
                    }}
                  >
                    <Camera size={16} />
                    <span>{uploadingPhoto ? "Uploading securely..." : photoUrl ? "Photo attached privately ✓" : "Attach quick incident photo (optional)"}</span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                  </label>

                  {errMsg && (
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#A62828", background: "#FDECEC", padding: "0.6rem 0.75rem", borderRadius: "var(--radius-md)" }}>
                      {errMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || uploadingPhoto}
                    className="btn btn-emergency"
                    style={{ justifyContent: "center", width: "100%" }}
                  >
                    {submitting ? "Sending Alert..." : "🚨 Send Rescue Alert"}
                  </button>

                  <div style={{ textAlign: "center", fontSize: "0.78rem" }}>
                    <Link href="/rescue" onClick={() => setSheetOpen(false)} style={{ color: "var(--stone-500)", textDecoration: "underline" }}>
                      Open full 3-step Ayuda form →
                    </Link>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
