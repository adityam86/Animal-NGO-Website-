"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Clock,
  ShieldCheck,
  Navigation,
  HeartHandshake,
  ExternalLink,
} from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import ImageUploader from "@/components/shared/ImageUploader";
import VoiceNoteRecorder from "@/components/shared/VoiceNoteRecorder";
import { CONTACT_INFO, AYUDAR_LEGAL } from "@/lib/data";
import { RESCUE_COPY, RESCUE_LANG_LABELS, type RescueLang } from "@/lib/i18n-rescue";

const InteractiveMap = dynamic(() => import("@/components/shared/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 280,
        borderRadius: "var(--radius-lg)",
        background: "var(--cream-100)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--stone-600)",
        fontWeight: 600,
        fontSize: "0.9rem",
      }}
    >
      Loading interactive GPS rescue map...
    </div>
  ),
});

const ANIMAL_TYPES = [
  { id: "Dog", icon: "🐕", label: "Street Dog / Puppy" },
  { id: "Cat", icon: "🐈", label: "Cat / Kitten" },
  { id: "Cow / Calf", icon: "🐄", label: "Cow / Calf / Bull" },
  { id: "Bird", icon: "🕊️", label: "Bird / Raptor" },
  { id: "Other", icon: "🐾", label: "Other Animal" },
];

const CONDITION_CHIPS = [
  { id: "Road Accident", icon: "🚑", label: "Road Accident", urgency: "Critical" as const },
  { id: "Bleeding / Wound", icon: "🩸", label: "Bleeding / Wound", urgency: "Critical" as const },
  { id: "Abandoned Puppy / Kitten", icon: "🍼", label: "Abandoned Puppy / Kitten", urgency: "High" as const },
  { id: "Trapped", icon: "🕸️", label: "Trapped / Stuck", urgency: "High" as const },
  { id: "Severe Illness", icon: "🩺", label: "Severe Illness", urgency: "High" as const },
  { id: "Weak / Dehydrated", icon: "💧", label: "Weak / Dehydrated", urgency: "Normal" as const },
];

const FIRST_AID_GUIDES = [
  {
    title: "Safely approaching an injured dog",
    bullets: [
      "Move calmly and stay low without staring directly into the animal's eyes or crowding them.",
      "Do NOT grab a painful limb suddenly — scared dogs may bite out of reflex even if gentle.",
      "Keep curious crowds and honking vehicles back, or place a loose cardboard barrier around them.",
    ],
  },
  {
    title: "Keeping a dehydrated or heat-shocked stray stable",
    bullets: [
      "Move the animal gently into shade on a clean cloth or flattened cardboard off hot asphalt.",
      "Offer small sips of clean cool water or wet their gums — never force water down an unconscious throat.",
      "Pour cool (not ice-cold) water gently over paws and neck while waiting for the rescue team.",
    ],
  },
  {
    title: "What NOT to feed or apply",
    bullets: [
      "Never give human painkillers (paracetamol, ibuprofen, aspirin) — even a single tablet can be fatal.",
      "Avoid pouring turmeric/chilli powder, petrol, or random sprays directly onto open bleeding wounds.",
      "Do not offer salty snacks, sweets, onion-spiced food, or milk to distressed puppies or kittens.",
    ],
  },
];

const SERVICE_ZONES = [
  { zone: "Tilabad, Kumarpur & Asansol", eta: "15–30 min immediate shelter dispatch" },
  { zone: "Raniganj & NH-19 Corridor", eta: "20–40 min rapid response" },
  { zone: "Kulti / Barakar / Jamuria", eta: "25–50 min rescue outreach" },
  { zone: "Andal & Durgapur Belt", eta: "35–60 min medical van" },
];

function buildWhatsAppHref(text: string) {
  return `https://wa.me/917384020901?text=${encodeURIComponent(text)}`;
}

function RescuePageContent() {
  const [lang, setLang] = useState<RescueLang>("en");
  const t = RESCUE_COPY[lang];
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("");
  const [location, setLocation] = useState("");
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [animalType, setAnimalType] = useState("Dog");
  const [condition, setCondition] = useState("Road Accident");
  const [urgency, setUrgency] = useState<"Critical" | "High" | "Normal">("Critical");
  const [photoUrl, setPhotoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [stayNearby, setStayNearby] = useState(true);
  const [openGuideIdx, setOpenGuideIdx] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);

  const detectGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus("Device GPS unavailable — please tap the map or enter a landmark.");
      return;
    }
    setGpsLoading(true);
    setGpsStatus("Acquiring GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const rawLat = pos.coords.latitude;
        const rawLng = pos.coords.longitude;
        const lat = rawLat.toFixed(5);
        const lng = rawLng.toFixed(5);
        setSelectedLat(rawLat);
        setSelectedLng(rawLng);
        setLocation((prev) =>
          prev.trim()
            ? `${prev.trim()} (GPS: ${lat}, ${lng})`
            : `GPS: ${lat}, ${lng} — near this pin`
        );
        setGpsStatus(`GPS locked (${lat}, ${lng})`);
        setGpsLoading(false);
      },
      () => {
        setGpsStatus("Location permission denied — tap a pin on the map or type the landmark.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectCondition = (chip: (typeof CONDITION_CHIPS)[number]) => {
    setCondition(chip.id);
    setUrgency(chip.urgency);
  };

  const validateStepAndNext = (targetStep: 1 | 2 | 3) => {
    setErrorMsg(null);
    if (step === 1 && targetStep > 1 && location.trim().length < 3) {
      setErrorMsg("Please tap the map, use GPS, or type a landmark so our rescue van can find the animal.");
      return;
    }
    if (step === 2 && targetStep > 2 && !animalType) {
      setErrorMsg("Please select which animal needs rescue.");
      return;
    }
    setStep(targetStep);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (location.trim().length < 3) {
      setStep(1);
      setErrorMsg("Location is required to dispatch our team.");
      return;
    }
    if (reporterName.trim().length < 2) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!/^[0-9+\-\s()]{7,20}$/.test(reporterPhone.trim())) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setSubmitting(true);
    const compiledDescription = `${description.trim() || `${condition} reported for ${animalType}.`}${
      stayNearby ? " [Caller available nearby for ~15 mins]" : ""
    }`;

    try {
      const res = await fetch("/api/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animalType,
          emergencyLevel: urgency,
          location: location.trim(),
          reporterName: reporterName.trim(),
          reporterPhone: reporterPhone.trim(),
          reporterEmail: reporterEmail.trim(),
          condition,
          description: compiledDescription,
          photoUrl: photoUrl || null,
          audioUrl: audioUrl || null,
          latitude: selectedLat,
          longitude: selectedLng,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to submit rescue alert. Please call our helpline.");
      }

      setSubmittedCaseId(data.id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error while sending alert.");
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappSummaryText = `AYUDA EMERGENCY RESCUE ALERT${submittedCaseId ? ` (${submittedCaseId})` : ""}\nAnimal: ${animalType}\nCondition: ${condition} (${urgency})\nLocation: ${location || "Raniganj / Asansol / Durgapur"}\nReporter: ${reporterName || "Bystander"} (${reporterPhone || "Phone attached"})\nCan stay 15 min: ${stayNearby ? "Yes" : "No"}`;

  return (
    <main style={{ background: "var(--cream-50)", minHeight: "100vh" }}>
      {/* Urgent Action Calm Header */}
      <section
        style={{
          background: "linear-gradient(135deg, #1E3A2F 0%, #264A3B 65%, #305747 100%)",
          color: "white",
          padding: "clamp(6.25rem, 11vw, 7.75rem) 0 clamp(2.5rem, 5vw, 3.5rem)",
        }}
      >
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "2rem", alignItems: "center" }}>
            <FadeIn direction="up" distance={16}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1rem" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    background: "rgba(214, 69, 69, 0.24)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    color: "#FFE3E3",
                    padding: "0.35rem 0.9rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B6B" }} />
                  {t.eyebrow}
                </div>

                {/* Bilingual Language Switcher */}
                <div
                  role="group"
                  aria-label="Language switcher"
                  style={{
                    display: "inline-flex",
                    gap: "0.25rem",
                    background: "rgba(255,255,255,0.12)",
                    padding: "0.25rem",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {(["en", "bn", "hi"] as RescueLang[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLang(code)}
                      style={{
                        border: "none",
                        borderRadius: "var(--radius-full)",
                        padding: "0.3rem 0.72rem",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        background: lang === code ? "#E07A5F" : "transparent",
                        color: "#FFFFFF",
                      }}
                    >
                      {RESCUE_LANG_LABELS[code]}
                    </button>
                  ))}
                </div>
              </div>

              <h1 style={{ color: "white", fontSize: "clamp(2rem, 4.4vw, 3rem)", lineHeight: 1.12, marginBottom: "0.9rem" }}>
                {t.headline}
              </h1>
              <p style={{ color: "rgba(250, 247, 242, 0.86)", fontSize: "1.02rem", lineHeight: 1.7, maxWidth: "58ch", margin: 0 }}>
                {t.subtext}
              </p>
              <div style={{ marginTop: "0.95rem" }}>
                <Link href="/rescue/map" style={{ color: "#FFD6CC", fontSize: "0.86rem", fontWeight: 600, textDecoration: "underline" }}>
                  {t.mapLinkLabel}
                </Link>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.08} distance={16}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(250,247,242,0.75)", fontWeight: 700 }}>
                  Instant One-Tap Dispatch
                </div>
                <a
                  href={`tel:${CONTACT_INFO.emergencyPhone.replace(/\s+/g, "")}`}
                  className="btn btn-emergency btn-lg"
                  style={{ width: "100%", justifyContent: "center", gap: "0.55rem", flexWrap: "wrap", whiteSpace: "normal", textAlign: "center", lineHeight: 1.3 }}
                >
                  <Phone size={18} /> Call Rescue Helpline ({CONTACT_INFO.emergencyPhone})
                </a>
                <a
                  href={buildWhatsAppHref(whatsappSummaryText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    gap: "0.55rem",
                    background: "rgba(255, 255, 255, 0.96)",
                    color: "#1E3A2F",
                  }}
                >
                  <MessageCircle size={18} /> WhatsApp Rescue Desk
                </a>
                <Link
                  href="/rescue/track"
                  style={{
                    textAlign: "center",
                    color: "#FAF7F2",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textDecoration: "underline",
                    paddingTop: "0.2rem",
                  }}
                >
                  Already submitted an alert? Track Live Case Status →
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Main 3-Step SOS Form + While You Wait & Coverage Sidebar */}
      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "2.25rem", alignItems: "start" }}>
            {/* Left / Primary: 3-Step Progressive Rescue Form */}
            <div style={{ gridColumn: "span 1" }}>
              {submittedCaseId ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-xl)",
                    padding: "clamp(1.75rem, 4vw, 2.75rem)",
                    border: "2px solid var(--green-300)",
                    boxShadow: "var(--shadow-lg)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: "50%",
                      background: "var(--green-50)",
                      color: "var(--green-700)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.25rem",
                    }}
                  >
                    <CheckCircle size={36} />
                  </div>
                  <div className="badge badge-green" style={{ marginBottom: "0.85rem" }}>
                    Alert Logged • Rescue Team Notified
                  </div>
                  <h2 style={{ marginBottom: "0.65rem" }}>Case ID: {submittedCaseId}</h2>
                  <p style={{ color: "var(--stone-600)", marginBottom: "1.5rem", maxWidth: "46ch", marginInline: "auto" }}>
                    Our ambulance desk has received the location (<strong>{location}</strong>). Please keep your phone accessible and monitor live status or forward this pre-filled summary on WhatsApp.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", justifyContent: "center" }}>
                    <a
                      href={buildWhatsAppHref(whatsappSummaryText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-terracotta"
                      style={{ gap: "0.45rem" }}
                    >
                      <MessageCircle size={17} /> Send on WhatsApp Backup
                    </a>
                    <Link href={`/rescue/track?id=${encodeURIComponent(submittedCaseId)}`} className="btn btn-primary">
                      Track Rescue Progress →
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedCaseId(null);
                      setStep(1);
                      setDescription("");
                      setPhotoUrl("");
                    }}
                    style={{
                      marginTop: "1.5rem",
                      background: "transparent",
                      border: "none",
                      color: "var(--stone-600)",
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    Report another animal
                  </button>
                </motion.div>
              ) : (
                <div
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-xl)",
                    padding: "clamp(1.5rem, 3.5vw, 2.25rem)",
                    border: "1px solid var(--cream-200)",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  {/* Step Progress Tabs */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.6rem", marginBottom: "1.75rem" }}>
                    {[
                      { num: 1 as const, label: "1. Location" },
                      { num: 2 as const, label: "2. Animal & Photo" },
                      { num: 3 as const, label: "3. Contact" },
                    ].map((s) => {
                      const active = step === s.num;
                      const completed = step > s.num;
                      return (
                        <button
                          key={s.num}
                          type="button"
                          onClick={() => (s.num < step ? setStep(s.num) : validateStepAndNext(s.num))}
                          style={{
                            padding: "0.7rem 0.65rem",
                            borderRadius: "var(--radius-md)",
                            border: "1.5px solid",
                            borderColor: active ? "var(--crimson)" : completed ? "var(--green-500)" : "var(--cream-200)",
                            background: active ? "var(--emergency-50)" : completed ? "var(--green-50)" : "var(--cream-50)",
                            color: active ? "var(--crimson)" : completed ? "var(--green-700)" : "var(--stone-600)",
                            fontWeight: 700,
                            fontSize: "0.84rem",
                            cursor: "pointer",
                          }}
                        >
                          {completed ? "✓ " : ""}
                          {s.label}
                        </button>
                      );
                    })}
                  </div>

                  <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                      {step === 1 && (
                        <motion.div
                          key="rescue-step-1"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                            <div>
                              <h2 style={{ fontSize: "1.35rem", marginBottom: "0.2rem" }}>Where is the animal right now?</h2>
                              <p style={{ fontSize: "0.86rem", color: "var(--stone-600)", margin: 0 }}>
                                Use 1-tap GPS or drop a pin on the map, then add a nearby shop or landmark.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={detectGps}
                              disabled={gpsLoading}
                              className="btn btn-primary btn-sm"
                              style={{ gap: "0.4rem" }}
                            >
                              <Navigation size={15} /> {gpsLoading ? "Locating..." : "Use My Current GPS"}
                            </button>
                          </div>

                          {gpsStatus && (
                            <div style={{ fontSize: "0.82rem", color: "var(--green-700)", fontWeight: 600 }}>
                              <MapPin size={14} style={{ display: "inline", marginRight: 4 }} />
                              {gpsStatus}
                            </div>
                          )}

                          <InteractiveMap
                            mode="picker"
                            height={320}
                            selectedLat={selectedLat}
                            selectedLng={selectedLng}
                            onLocationSelect={(lat, lng, addr) => {
                              setSelectedLat(lat);
                              setSelectedLng(lng);
                              setLocation(addr ? `${addr} (${lat.toFixed(4)}, ${lng.toFixed(4)})` : `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                            }}
                          />

                          <div className="form-group">
                            <label className="form-label" htmlFor="rescue-location">Exact Location / Nearby Landmark *</label>
                            <input
                              id="rescue-location"
                              type="text"
                              className="form-input"
                              placeholder="e.g., Near Tilabad, Kumarpur, Asansol / GT Road"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              required
                            />
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => validateStepAndNext(2)}
                              className="btn btn-terracotta"
                              style={{ gap: "0.4rem" }}
                            >
                              Next: Animal &amp; Condition <ChevronRight size={17} />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div
                          key="rescue-step-2"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
                        >
                          <div>
                            <h2 style={{ fontSize: "1.35rem", marginBottom: "0.2rem" }}>Animal type, condition &amp; photo</h2>
                            <p style={{ fontSize: "0.86rem", color: "var(--stone-600)", margin: 0 }}>
                              Tap what matches best so our responders pack the right medical kit.
                            </p>
                          </div>

                          <div>
                            <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>
                              Animal Type *
                            </label>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.6rem" }}>
                              {ANIMAL_TYPES.map((a) => {
                                const selected = animalType === a.id;
                                return (
                                  <button
                                    key={a.id}
                                    type="button"
                                    onClick={() => setAnimalType(a.id)}
                                    style={{
                                      padding: "0.7rem 0.65rem",
                                      borderRadius: "var(--radius-md)",
                                      border: "1.5px solid",
                                      borderColor: selected ? "var(--green-600)" : "var(--cream-200)",
                                      background: selected ? "var(--green-50)" : "var(--color-surface)",
                                      color: "var(--stone-800)",
                                      fontWeight: 700,
                                      fontSize: "0.82rem",
                                      cursor: "pointer",
                                      textAlign: "left",
                                    }}
                                  >
                                    <span style={{ marginRight: "0.35rem" }}>{a.icon}</span>
                                    {a.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>
                              Primary Condition *
                            </label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
                              {CONDITION_CHIPS.map((c) => {
                                const selected = condition === c.id;
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => handleSelectCondition(c)}
                                    style={{
                                      padding: "0.55rem 0.9rem",
                                      borderRadius: "var(--radius-full)",
                                      border: "1.5px solid",
                                      borderColor: selected ? "var(--crimson)" : "var(--cream-300)",
                                      background: selected ? "var(--crimson)" : "var(--cream-50)",
                                      color: selected ? "white" : "var(--stone-800)",
                                      fontWeight: 600,
                                      fontSize: "0.84rem",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {c.icon} {c.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <ImageUploader
                            uploadEndpoint="/api/rescue/upload"
                            value={photoUrl}
                            onChange={setPhotoUrl}
                            label="Photo of the Animal / Spot (Recommended)"
                            helperText="Helps vet triage injuries before the ambulance arrives (JPG/PNG/WebP)"
                          />

                          <VoiceNoteRecorder
                            value={audioUrl}
                            onChange={setAudioUrl}
                            title={t.voiceSectionTitle}
                            hint={t.voiceSectionHint}
                          />

                          <div className="form-group">
                            <label className="form-label" htmlFor="rescue-desc">Quick Notes (optional)</label>
                            <textarea
                              id="rescue-desc"
                              className="form-textarea"
                              style={{ minHeight: 82 }}
                              placeholder="e.g., Unable to stand, conscious, hiding near the blue gate..."
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
                            <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ gap: "0.35rem" }}>
                              <ChevronLeft size={16} /> Back
                            </button>
                            <button type="button" onClick={() => validateStepAndNext(3)} className="btn btn-terracotta" style={{ gap: "0.4rem" }}>
                              Next: Your Contact <ChevronRight size={17} />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {step === 3 && (
                        <motion.div
                          key="rescue-step-3"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}
                        >
                          <div>
                            <h2 style={{ fontSize: "1.35rem", marginBottom: "0.2rem" }}>So our driver can reach you</h2>
                            <p style={{ fontSize: "0.86rem", color: "var(--stone-600)", margin: 0 }}>
                              Our team calls only to coordinate pickup. Never shared publicly.
                            </p>
                          </div>

                          <div className="responsive-grid-2" style={{ gap: "1rem" }}>
                            <div className="form-group">
                              <label className="form-label" htmlFor="rescue-name">Your Name *</label>
                              <input
                                id="rescue-name"
                                type="text"
                                className="form-input"
                                placeholder="e.g., Ananya Das"
                                value={reporterName}
                                onChange={(e) => setReporterName(e.target.value)}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label" htmlFor="rescue-phone">Mobile Number *</label>
                              <input
                                id="rescue-phone"
                                type="tel"
                                className="form-input"
                                placeholder="+91 98XXX XXXXX"
                                value={reporterPhone}
                                onChange={(e) => setReporterPhone(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="form-label" htmlFor="rescue-email">Email (optional — for status updates)</label>
                            <input
                              id="rescue-email"
                              type="email"
                              className="form-input"
                              placeholder="you@example.com"
                              value={reporterEmail}
                              onChange={(e) => setReporterEmail(e.target.value)}
                            />
                          </div>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              padding: "0.9rem 1rem",
                              borderRadius: "var(--radius-md)",
                              background: "var(--green-50)",
                              border: "1px solid var(--green-200)",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              color: "var(--green-700)",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={stayNearby}
                              onChange={(e) => setStayNearby(e.target.checked)}
                              style={{ width: 18, height: 18, accentColor: "var(--green-700)" }}
                            />
                            I can stay near the animal for 15 mins to guide the team
                          </label>

                          <div
                            style={{
                              padding: "0.85rem 1rem",
                              borderRadius: "var(--radius-md)",
                              background: "var(--cream-50)",
                              border: "1px solid var(--cream-200)",
                              fontSize: "0.84rem",
                              color: "var(--stone-700)",
                              lineHeight: 1.55,
                            }}
                          >
                            <strong>Summary:</strong> {animalType} ({condition} • {urgency}) at{" "}
                            <strong>{location}</strong>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                            <button type="button" onClick={() => setStep(2)} className="btn btn-outline" style={{ gap: "0.35rem" }}>
                              <ChevronLeft size={16} /> Back
                            </button>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="btn btn-emergency btn-lg"
                              style={{ flex: 1, minWidth: 210, justifyContent: "center", gap: "0.5rem" }}
                            >
                              <AlertTriangle size={18} />
                              {submitting ? "Dispatching Alert..." : "Send Rescue Alert"}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {errorMsg && (
                      <div
                        role="alert"
                        style={{
                          marginTop: "1rem",
                          padding: "0.85rem 1rem",
                          borderRadius: "var(--radius-md)",
                          background: "#FDF0F0",
                          border: "1px solid #F9CACA",
                          color: "#A62828",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                        }}
                      >
                        {errorMsg}
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* Right Sidebar: While You Wait First-Aid Accordion + Service Coverage */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* First-Aid Accordion */}
              <FadeIn direction="up" delay={0.08} distance={16}>
                <div
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-xl)",
                    padding: "1.65rem",
                    border: "1px solid var(--cream-200)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", color: "var(--terracotta-hover)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <HeartHandshake size={16} /> While You Wait
                  </div>
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{t.firstAidTitle}</h3>
                  {lang !== "en" && (
                    <div
                      style={{
                        background: "var(--green-50)",
                        border: "1px solid var(--green-200)",
                        borderRadius: "var(--radius-md)",
                        padding: "0.9rem 1rem",
                        marginBottom: "1rem",
                        fontSize: "0.84rem",
                        lineHeight: 1.65,
                        color: "var(--stone-800)",
                      }}
                    >
                      <ul style={{ margin: "0 0 0.5rem", paddingLeft: "1.15rem" }}>
                        {t.firstAidTips.map((tip) => (
                          <li key={tip} style={{ marginBottom: "0.25rem" }}>{tip}</li>
                        ))}
                      </ul>
                      <div style={{ fontWeight: 700, color: "#991b1b" }}>⚠️ {t.firstAidWarning}</div>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                    {FIRST_AID_GUIDES.map((guide, idx) => {
                      const isOpen = openGuideIdx === idx;
                      return (
                        <div
                          key={guide.title}
                          style={{
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--cream-200)",
                            background: isOpen ? "var(--green-50)" : "var(--cream-50)",
                            overflow: "hidden",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenGuideIdx(isOpen ? null : idx)}
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "0.75rem",
                              padding: "0.85rem 1rem",
                              background: "transparent",
                              border: "none",
                              textAlign: "left",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                              color: "var(--stone-800)",
                              cursor: "pointer",
                            }}
                          >
                            <span>{guide.title}</span>
                            <ChevronDown
                              size={16}
                              style={{
                                flexShrink: 0,
                                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease",
                              }}
                            />
                          </button>
                          {isOpen && (
                            <ul style={{ margin: 0, padding: "0 1.15rem 1rem 2rem", fontSize: "0.85rem", color: "var(--stone-700)", lineHeight: 1.65 }}>
                              {guide.bullets.map((b) => (
                                <li key={b} style={{ marginBottom: "0.35rem" }}>
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>

              {/* Service Area & Ambulance Hours */}
              <FadeIn direction="up" delay={0.14} distance={16}>
                <div
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-xl)",
                    padding: "1.65rem",
                    border: "1px solid var(--cream-200)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", color: "var(--green-600)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <Clock size={15} /> Ambulance &amp; Coverage Zones
                  </div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "0.85rem" }}>Where We Operate</h3>
                  <p style={{ fontSize: "0.86rem", color: "var(--stone-600)", marginBottom: "1rem" }}>
                    {CONTACT_INFO.hours}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", marginBottom: "1.15rem" }}>
                    {SERVICE_ZONES.map((z) => (
                      <div
                        key={z.zone}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.6rem 0.8rem",
                          background: "var(--cream-50)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "0.84rem",
                        }}
                      >
                        <strong style={{ color: "var(--stone-800)" }}>{z.zone}</strong>
                        <span style={{ color: "var(--green-700)", fontWeight: 600, fontSize: "0.78rem" }}>{z.eta}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={AYUDAR_LEGAL.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ width: "100%", justifyContent: "center", gap: "0.4rem" }}
                  >
                    <MapPin size={15} /> Open Sanctuary on Google Maps <ExternalLink size={13} />
                  </a>

                  <div style={{ marginTop: "0.95rem", display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.76rem", color: "var(--stone-500)" }}>
                    <ShieldCheck size={14} style={{ color: "var(--green-600)", flexShrink: 0 }} />
                    <span>{AYUDAR_LEGAL.name} • Reg: {AYUDAR_LEGAL.regNo}</span>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function RescuePage() {
  return (
    <Suspense fallback={<main className="section"><div className="container">Loading Ayuda rescue form...</div></main>}>
      <RescuePageContent />
    </Suspense>
  );
}
