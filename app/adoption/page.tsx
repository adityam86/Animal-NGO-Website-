"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  CheckCircle,
  X,
  ShieldCheck,
  MapPin,
  Sparkles,
  FileText,
  PhoneCall,
  Home,
} from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import { ANIMALS as DEFAULT_ANIMALS, AYUDAR_LEGAL } from "@/lib/data";

interface AnimalItem {
  id: string;
  name: string;
  type: string;
  breed: string;
  gender: string;
  age: string;
  color: string;
  location: string;
  status: string;
  image: string;
  vaccinated: boolean;
  dewormed: boolean;
  sterilized: boolean;
  rescueDate: string;
  shelter: string;
  story: string;
}

const ADOPTION_STEPS = [
  { step: "01", title: "Short Application", desc: "60-second home & preference check", icon: FileText },
  { step: "02", title: "Quick Call", desc: "Friendly chat with our coordinator", icon: PhoneCall },
  { step: "03", title: "Meet & Greet", desc: "Spend time together at the shelter", icon: Sparkles },
  { step: "04", title: "Welcome Home", desc: "Lifelong post-adoption vet support", icon: Home },
];

const CATEGORIES = ["All", "Dogs", "Cats", "Special Needs"] as const;

function AdoptionPageContent() {
  const searchParams = useSearchParams();
  const initialAnimalId = searchParams.get("animalId") || "";
  const initialMode = searchParams.get("mode") === "foster" ? "foster" : "adopt";

  const [animals, setAnimals] = useState<AnimalItem[]>(DEFAULT_ANIMALS as AnimalItem[]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [mode, setMode] = useState<"adopt" | "foster">(initialMode);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [onlyVaccinated, setOnlyVaccinated] = useState(false);
  const [onlySterilized, setOnlySterilized] = useState(false);
  const [onlyFriendly, setOnlyFriendly] = useState(false);
  const [genderFilter, setGenderFilter] = useState<"All" | "Male" | "Female">("All");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [drawerAnimal, setDrawerAnimal] = useState<AnimalItem | null>(null);

  // Application form fields
  const [selectedAnimalId, setSelectedAnimalId] = useState(initialAnimalId);
  const [applicantName, setApplicantName] = useState("");
  const [age, setAge] = useState("26");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState("");
  const [homeType, setHomeType] = useState("Own House / Flat");
  const [familyMembers, setFamilyMembers] = useState("3");
  const [hasPets, setHasPets] = useState(false);
  const [petDetails, setPetDetails] = useState("");
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const saved = localStorage.getItem("ayudar_saved_pets");
        if (saved) setBookmarks(JSON.parse(saved));
      } catch {
        // ignore localStorage failures
      }
    });

    fetch("/api/animals")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("fetch failed"))))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAnimals(data);
        }
      })
      .catch(() => {
        // retain fallback dataset
      })
      .finally(() => setLoadingAnimals(false));
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("ayudar_saved_pets", JSON.stringify(next));
      } catch {
        // ignore storage limits
      }
      return next;
    });
  };

  const filteredAnimals = useMemo(() => {
    return animals.filter((a) => {
      if (a.status === "Adopted") return false;
      if (mode === "adopt" && !["Available for Adoption", "Recovering"].includes(a.status)) {
        return false;
      }
      if (category === "Dogs" && a.type.toLowerCase() !== "dog") return false;
      if (category === "Cats" && a.type.toLowerCase() !== "cat") return false;
      if (
        category === "Special Needs" &&
        !["Under Treatment", "Recovering", "Sponsored"].includes(a.status) &&
        !a.story.toLowerCase().includes("recover")
      ) {
        return false;
      }
      if (onlyVaccinated && !a.vaccinated) return false;
      if (onlySterilized && !a.sterilized) return false;
      if (
        onlyFriendly &&
        !/(gentle|friendly|children|kids|playful|calm|affectionate)/i.test(a.story)
      ) {
        return false;
      }
      if (genderFilter !== "All" && a.gender !== genderFilter) return false;
      return true;
    });
  }, [animals, mode, category, onlyVaccinated, onlySterilized, onlyFriendly, genderFilter]);

  const completedStepsCount = [
    applicantName.trim().length >= 2,
    Number(age) >= 18,
    /^[0-9+\-\s()]{7,20}$/.test(phone.trim()),
    /\S+@\S+\.\S+/.test(email.trim()),
    address.trim().length >= 5,
    reason.trim().length >= 10,
  ].filter(Boolean).length;
  const formProgress = Math.round((completedStepsCount / 6) * 100);

  const startApplicationFor = (animal: AnimalItem) => {
    setSelectedAnimalId(animal.id);
    setDrawerAnimal(null);
    const el = document.getElementById("apply-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (reason.trim().length < 10) {
      setErrorMsg("Please share at least 10 characters about why you would like to adopt or foster.");
      return;
    }

    setSubmitting(true);
    const compiledReason =
      mode === "foster" && !reason.trim().startsWith("[FOSTER APPLICATION]")
        ? `[FOSTER APPLICATION] ${reason.trim()}`
        : reason.trim();

    try {
      const res = await fetch("/api/adoption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantName: applicantName.trim(),
          age: Number(age),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          occupation: occupation.trim(),
          hasPets,
          petDetails: hasPets ? petDetails.trim() : "",
          homeType,
          familyMembers: Number(familyMembers) || 1,
          reason: compiledReason,
          animalId: selectedAnimalId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to submit application. Please check highlighted fields.");
      }
      setSubmittedId(data.id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error while submitting application.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAnimalObj = animals.find((a) => a.id === selectedAnimalId);

  return (
    <main style={{ background: "var(--cream-50)", minHeight: "100vh" }}>
      {/* Warm Header & 4-Step Stepper */}
      <section
        style={{
          background: "linear-gradient(135deg, #1E3A2F 0%, #2B5342 100%)",
          color: "white",
          padding: "clamp(6.25rem, 11vw, 7.75rem) 0 clamp(2.5rem, 5vw, 3.5rem)",
        }}
      >
        <div className="container">
          <FadeIn direction="up" distance={16}>
            <div className="section-tag" style={{ background: "rgba(224, 122, 95, 0.22)", color: "#FFD6CC" }}>
              Adopt &amp; Foster Directory
            </div>
            <h1 style={{ color: "white", fontSize: "clamp(2rem, 4.5vw, 3.1rem)", maxWidth: "22ch", marginBottom: "0.75rem" }}>
              Give a rescued soul a loving forever home.
            </h1>
            <p style={{ color: "rgba(250, 247, 242, 0.85)", maxWidth: "56ch", fontSize: "1.02rem", lineHeight: 1.7, marginBottom: "2rem" }}>
              Every companion is vetted, micro-assessed for temperament, and supported by Ayudar even after adoption. Zero adoption fees — only lifetime commitment.
            </p>
          </FadeIn>

          {/* 4-Step Process Strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))", gap: "0.85rem" }}>
            {ADOPTION_STEPS.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1rem 1.1rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "var(--radius-md)",
                      background: "rgba(224, 122, 95, 0.28)",
                      color: "#FFD6CC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "#FFD6CC" }}>
                      STEP {st.step}
                    </div>
                    <div style={{ fontWeight: 700, color: "white", fontSize: "0.94rem" }}>{st.title}</div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(250, 247, 242, 0.78)" }}>{st.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky-filter-bar" style={{ position: "sticky", top: 68, zIndex: 40, background: "rgba(250, 247, 242, 0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--cream-200)", padding: "0.85rem 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          {/* Adopt vs Foster Toggle */}
          <div style={{ display: "inline-flex", background: "var(--cream-100)", borderRadius: "var(--radius-full)", padding: "0.25rem", border: "1px solid var(--cream-200)" }}>
            <button
              type="button"
              onClick={() => setMode("adopt")}
              style={{
                padding: "0.42rem 1rem",
                borderRadius: "var(--radius-full)",
                border: "none",
                background: mode === "adopt" ? "var(--green-700)" : "transparent",
                color: mode === "adopt" ? "white" : "var(--stone-700)",
                fontWeight: 700,
                fontSize: "0.84rem",
                cursor: "pointer",
              }}
            >
              Adopt Forever
            </button>
            <button
              type="button"
              onClick={() => setMode("foster")}
              style={{
                padding: "0.42rem 1rem",
                borderRadius: "var(--radius-full)",
                border: "none",
                background: mode === "foster" ? "var(--terracotta)" : "transparent",
                color: mode === "foster" ? "white" : "var(--stone-700)",
                fontWeight: 700,
                fontSize: "0.84rem",
                cursor: "pointer",
              }}
            >
              Short-Term Foster
            </button>
          </div>

          {/* Species + Trait Filter Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.45rem" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                style={{
                  padding: "0.42rem 0.85rem",
                  borderRadius: "var(--radius-full)",
                  border: "1.5px solid",
                  borderColor: category === cat ? "var(--green-700)" : "var(--cream-300)",
                  background: category === cat ? "var(--green-50)" : "var(--color-surface)",
                  color: category === cat ? "var(--green-700)" : "var(--stone-700)",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setOnlyVaccinated((v) => !v)}
              style={{
                padding: "0.42rem 0.8rem",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid",
                borderColor: onlyVaccinated ? "var(--green-600)" : "var(--cream-300)",
                background: onlyVaccinated ? "var(--green-50)" : "transparent",
                color: onlyVaccinated ? "var(--green-700)" : "var(--stone-600)",
                fontWeight: 600,
                fontSize: "0.78rem",
                cursor: "pointer",
              }}
            >
              ✓ Vaccinated
            </button>

            <button
              type="button"
              onClick={() => setOnlyFriendly((v) => !v)}
              style={{
                padding: "0.42rem 0.8rem",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid",
                borderColor: onlyFriendly ? "var(--green-600)" : "var(--cream-300)",
                background: onlyFriendly ? "var(--green-50)" : "transparent",
                color: onlyFriendly ? "var(--green-700)" : "var(--stone-600)",
                fontWeight: 600,
                fontSize: "0.78rem",
                cursor: "pointer",
              }}
            >
              ✓ Good with Kids / Gentle
            </button>

            <button
              type="button"
              onClick={() => setOnlySterilized((v) => !v)}
              style={{
                padding: "0.42rem 0.8rem",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid",
                borderColor: onlySterilized ? "var(--green-600)" : "var(--cream-300)",
                background: onlySterilized ? "var(--green-50)" : "transparent",
                color: onlySterilized ? "var(--green-700)" : "var(--stone-600)",
                fontWeight: 600,
                fontSize: "0.78rem",
                cursor: "pointer",
              }}
            >
              ✓ Sterilized
            </button>

            <select
              aria-label="Filter by gender"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as "All" | "Male" | "Female")}
              style={{
                padding: "0.4rem 0.7rem",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid var(--cream-300)",
                background: "var(--color-surface)",
                color: "var(--stone-700)",
                fontWeight: 600,
                fontSize: "0.78rem",
              }}
            >
              <option value="All">Any Gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pet Cards Directory */}
      <section className="section">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <h2 style={{ fontSize: "1.6rem", margin: 0 }}>
              {mode === "foster" ? "Animals Welcoming Foster Care" : "Companions Ready for Adoption"} ({filteredAnimals.length})
            </h2>
            <a href="#apply-form" className="btn btn-terracotta btn-sm">
              Jump to {mode === "foster" ? "Foster" : "Adoption"} Form ↓
            </a>
          </div>

          {loadingAnimals ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "1.5rem" }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ height: 390, borderRadius: "var(--radius-xl)", background: "var(--cream-100)" }} />
              ))}
            </div>
          ) : filteredAnimals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1.5rem", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--cream-200)" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>No pets match those exact filters right now</h3>
              <p style={{ color: "var(--stone-600)", marginBottom: "1.25rem" }}>
                Reset your filters or switch to Foster mode to help recovering animals heal in a calm home.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategory("All");
                  setOnlyVaccinated(false);
                  setOnlySterilized(false);
                  setOnlyFriendly(false);
                  setGenderFilter("All");
                }}
                className="btn btn-primary btn-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(295px, 1fr))", gap: "1.5rem" }}>
              {filteredAnimals.map((animal) => {
                const isSaved = bookmarks.includes(animal.id);
                const needsFosterUrgently = ["Under Treatment", "Recovering"].includes(animal.status);
                return (
                  <motion.div
                    key={animal.id}
                    whileHover={{ y: -4 }}
                    style={{
                      background: "var(--color-surface)",
                      borderRadius: "var(--radius-xl)",
                      overflow: "hidden",
                      border: "1px solid var(--cream-200)",
                      boxShadow: "var(--shadow-sm)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ position: "relative", aspectRatio: "4 / 3", background: "var(--cream-100)", overflow: "hidden" }}>
                      <Image
                        src={animal.image || "/images/dog_bruno.jpg"}
                        alt={`${animal.name} — ${animal.breed}`}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 380px"
                        style={{ objectFit: "cover", cursor: "pointer" }}
                        onClick={() => setDrawerAnimal(animal)}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          background: needsFosterUrgently ? "rgba(224, 122, 95, 0.94)" : "rgba(30, 58, 47, 0.9)",
                          color: "white",
                          padding: "0.28rem 0.7rem",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                        }}
                      >
                        {needsFosterUrgently ? "Foster / Recovery" : animal.status}
                      </span>
                      <button
                        type="button"
                        aria-label={isSaved ? `Remove ${animal.name} from saved` : `Save ${animal.name}`}
                        onClick={() => toggleBookmark(animal.id)}
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          border: "none",
                          background: "rgba(255, 255, 255, 0.92)",
                          color: isSaved ? "#D64545" : "#4A5D53",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Heart size={17} fill={isSaved ? "#D64545" : "none"} />
                      </button>
                    </div>

                    <div style={{ padding: "1.35rem", display: "flex", flexDirection: "column", flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem" }}>
                        <h3 style={{ fontSize: "1.22rem", margin: 0 }}>{animal.name}</h3>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--stone-600)" }}>{animal.age}</span>
                      </div>
                      <p style={{ fontSize: "0.84rem", color: "var(--stone-600)", marginBottom: "0.8rem" }}>
                        {animal.breed} • {animal.gender} • {animal.location}
                      </p>

                      {/* 3 Personality / Medical Chips */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
                        {animal.vaccinated && <span className="badge badge-green">Vaccinated</span>}
                        {animal.sterilized && <span className="badge badge-green">Sterilized</span>}
                        <span className="badge badge-stone">{animal.type}</span>
                      </div>

                      <div style={{ display: "flex", gap: "0.6rem", marginTop: "auto" }}>
                        <button
                          type="button"
                          onClick={() => setDrawerAnimal(animal)}
                          className="btn btn-outline btn-sm"
                          style={{ flex: 1, justifyContent: "center" }}
                        >
                          View Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => startApplicationFor(animal)}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, justifyContent: "center" }}
                        >
                          {mode === "foster" ? "Foster" : "Adopt"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Frictionless Application Section with Live Progress */}
      <section id="apply-form" className="section" style={{ background: "var(--cream-100)", borderTop: "1px solid var(--cream-200)" }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <FadeIn direction="up" distance={16}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div className="section-tag">
                {mode === "foster" ? "Foster Care Application" : "Adoption Application"}
              </div>
              <h2>
                {selectedAnimalObj
                  ? `Apply to ${mode === "foster" ? "Foster" : "Adopt"} ${selectedAnimalObj.name}`
                  : `Complete Your ${mode === "foster" ? "Foster" : "Adoption"} Inquiry`}
              </h2>
              <p style={{ color: "var(--stone-600)", maxWidth: "54ch", marginInline: "auto" }}>
                Takes under 2 minutes. Our shelter coordinator reviews every inquiry personally.
              </p>
            </div>
          </FadeIn>

          {submittedId ? (
            <div
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius-xl)",
                padding: "2.5rem",
                border: "2px solid var(--green-300)",
                textAlign: "center",
              }}
            >
              <CheckCircle size={44} style={{ color: "var(--green-600)", marginInline: "auto", marginBottom: "1rem" }} />
              <h3 style={{ marginBottom: "0.5rem" }}>Application Received! ({submittedId})</h3>
              <p style={{ color: "var(--stone-600)", maxWidth: "46ch", marginInline: "auto", marginBottom: "1.5rem" }}>
                Thank you for opening your heart. Our coordinator will call you within 24 hours to arrange your sanctuary visit.
              </p>
              <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/animals" className="btn btn-primary">
                  Browse More Animals
                </Link>
                <Link href="/donate" className="btn btn-terracotta">
                  Support Medical Care
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius-xl)",
                padding: "clamp(1.5rem, 3.5vw, 2.5rem)",
                border: "1px solid var(--cream-200)",
                boxShadow: "var(--shadow-md)",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Progress Bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, color: "var(--green-700)", marginBottom: "0.35rem" }}>
                  <span>Application Progress</span>
                  <span>{formProgress}% complete</span>
                </div>
                <div style={{ height: 8, background: "var(--cream-100)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${formProgress}%`,
                      height: "100%",
                      background: mode === "foster" ? "var(--terracotta)" : "var(--green-600)",
                      transition: "width 0.25s ease",
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="adopt-animal-select">Preferred Companion (optional)</label>
                <select
                  id="adopt-animal-select"
                  className="form-select"
                  value={selectedAnimalId}
                  onChange={(e) => setSelectedAnimalId(e.target.value)}
                >
                  <option value="">Open to coordinator recommendation (match me by temperament)</option>
                  {animals
                    .filter((a) => a.status !== "Adopted")
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type} • {a.age} • {a.status})
                      </option>
                    ))}
                </select>
              </div>

              <div className="responsive-grid-2" style={{ gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="adopt-name">Full Name *</label>
                  <input
                    id="adopt-name"
                    type="text"
                    required
                    className="form-input"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g., Riya Mukherjee"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="adopt-age">Age (18+) *</label>
                  <input
                    id="adopt-age"
                    type="number"
                    min={18}
                    max={110}
                    required
                    className="form-input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="adopt-phone">Phone / WhatsApp Number *</label>
                  <input
                    id="adopt-phone"
                    type="tel"
                    required
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98XXX XXXXX"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="adopt-email">Email Address *</label>
                  <input
                    id="adopt-email"
                    type="email"
                    required
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="adopt-home">Living Setup *</label>
                  <select
                    id="adopt-home"
                    className="form-select"
                    value={homeType}
                    onChange={(e) => setHomeType(e.target.value)}
                  >
                    <option value="Own House / Flat">Own House / Flat</option>
                    <option value="Rented Home (Landlord Approved)">Rented Home (Landlord Approved)</option>
                    <option value="Independent Bungalow / Yard">Independent Bungalow / Yard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="adopt-family">Family Members in Home *</label>
                  <input
                    id="adopt-family"
                    type="number"
                    min={1}
                    max={30}
                    required
                    className="form-input"
                    value={familyMembers}
                    onChange={(e) => setFamilyMembers(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="adopt-address">Residential Address &amp; City *</label>
                <input
                  id="adopt-address"
                  type="text"
                  required
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Area, landmark, Raniganj / Asansol / Durgapur..."
                />
              </div>

              <div className="responsive-grid-2" style={{ gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="adopt-occupation">Occupation (optional)</label>
                  <input
                    id="adopt-occupation"
                    type="text"
                    className="form-input"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g., Teacher, Software Engineer"
                  />
                </div>
                <div className="form-group" style={{ justifyContent: "flex-end" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", padding: "0.75rem 0", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={hasPets}
                      onChange={(e) => setHasPets(e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: "var(--green-700)" }}
                    />
                    I currently live with other pets
                  </label>
                </div>
              </div>

              {hasPets && (
                <div className="form-group">
                  <label className="form-label" htmlFor="adopt-pet-details">Existing Pet Details</label>
                  <input
                    id="adopt-pet-details"
                    type="text"
                    className="form-input"
                    value={petDetails}
                    onChange={(e) => setPetDetails(e.target.value)}
                    placeholder="Species, age, and vaccination status"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="adopt-reason">
                  Why would you like to {mode === "foster" ? "foster" : "adopt"} &amp; when can you visit? *
                </label>
                <textarea
                  id="adopt-reason"
                  required
                  className="form-textarea"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Confirm family agreement, preferred sanctuary visit day, and your daily care routine..."
                />
              </div>

              {errorMsg && (
                <div role="alert" style={{ padding: "0.85rem 1rem", borderRadius: "var(--radius-md)", background: "#FDF0F0", color: "#A62828", fontSize: "0.88rem", fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {submitting
                  ? "Submitting Application..."
                  : `Submit ${mode === "foster" ? "Foster" : "Adoption"} Application`}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Slide-Over Pet Profile Drawer */}
      <AnimatePresence>
        {drawerAnimal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerAnimal(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1300,
              background: "rgba(22, 36, 29, 0.55)",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 480,
                height: "100%",
                background: "var(--color-surface)",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                boxShadow: "var(--shadow-xl)",
              }}
            >
              <div style={{ position: "relative", height: 280, flexShrink: 0, background: "var(--cream-100)" }}>
                <Image
                  src={drawerAnimal.image || "/images/dog_bruno.jpg"}
                  alt={drawerAnimal.name}
                  fill
                  unoptimized
                  sizes="480px"
                  style={{ objectFit: "cover" }}
                />
                <button
                  type="button"
                  aria-label="Close animal drawer"
                  onClick={() => setDrawerAnimal(null)}
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(255, 255, 255, 0.92)",
                    color: "#1E3A2F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: "1.65rem", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <h2 style={{ margin: 0 }}>{drawerAnimal.name}</h2>
                  <span className="badge badge-green">{drawerAnimal.status}</span>
                </div>
                <p style={{ color: "var(--stone-600)", fontSize: "0.9rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <MapPin size={15} /> {drawerAnimal.shelter} • {drawerAnimal.location}
                </p>

                {/* Spec Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.65rem", marginBottom: "1.35rem" }}>
                  {[
                    { label: "Species / Breed", val: `${drawerAnimal.type} (${drawerAnimal.breed})` },
                    { label: "Age & Gender", val: `${drawerAnimal.age} • ${drawerAnimal.gender}` },
                    { label: "Vaccinated", val: drawerAnimal.vaccinated ? "Yes (Up to date)" : "In schedule" },
                    { label: "Sterilized", val: drawerAnimal.sterilized ? "Yes" : "Planned / Age pending" },
                  ].map((spec) => (
                    <div key={spec.label} style={{ padding: "0.7rem 0.85rem", borderRadius: "var(--radius-md)", background: "var(--cream-50)", border: "1px solid var(--cream-200)" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase" }}>
                        {spec.label}
                      </div>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--stone-800)" }}>{spec.val}</div>
                    </div>
                  ))}
                </div>

                <h4 style={{ fontSize: "0.95rem", marginBottom: "0.4rem" }}>Rescue Backstory</h4>
                <p style={{ fontSize: "0.92rem", color: "var(--stone-700)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                  {drawerAnimal.story}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "var(--stone-600)", padding: "0.7rem", borderRadius: "var(--radius-md)", background: "var(--green-50)" }}>
                  <ShieldCheck size={15} style={{ color: "var(--green-700)", flexShrink: 0 }} />
                  <span>Verified Sanctuary Resident • {AYUDAR_LEGAL.shortName}</span>
                </div>
              </div>

              {/* Sticky Drawer CTA Bar */}
              <div
                style={{
                  position: "sticky",
                  bottom: 0,
                  padding: "1rem 1.5rem",
                  background: "var(--color-surface)",
                  borderTop: "1px solid var(--cream-200)",
                  display: "flex",
                  gap: "0.75rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => startApplicationFor(drawerAnimal)}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Apply to {mode === "foster" ? "Foster" : "Adopt"} {drawerAnimal.name}
                </button>
                <Link
                  href={`/sponsor?animal=${encodeURIComponent(drawerAnimal.id)}`}
                  className="btn btn-outline"
                  style={{ justifyContent: "center" }}
                >
                  Sponsor Instead
                </Link>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function AdoptionPage() {
  return (
    <Suspense fallback={<main className="section"><div className="container">Loading Adopt &amp; Foster directory...</div></main>}>
      <AdoptionPageContent />
    </Suspense>
  );
}
