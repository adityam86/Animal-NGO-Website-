"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimalCard from "@/components/shared/AnimalCard";
import { ANIMALS } from "@/lib/data";
import FadeIn from "@/components/motion/FadeIn";

function AdoptionContent() {
  const searchParams = useSearchParams();
  const preselectedAnimalId = searchParams.get("animal") || "";

  const [animals, setAnimals] = useState<any[]>(ANIMALS);
  const [selectedAnimalId, setSelectedAnimalId] = useState(preselectedAnimalId);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAnimals() {
      try {
        const res = await fetch("/api/animals");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAnimals(data);
          }
        }
      } catch (err) {
        console.error("Failed to load animals:", err);
      }
    }
    loadAnimals();
  }, []);

  useEffect(() => {
    if (preselectedAnimalId) {
      setSelectedAnimalId(preselectedAnimalId);
    }
  }, [preselectedAnimalId]);

  const adoptable = animals.filter((a) => a.status === "Available for Adoption");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      applicantName: formData.get("applicantName"),
      age: formData.get("age"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: formData.get("address"),
      occupation: formData.get("occupation"),
      hasPets: formData.get("hasPets") !== "No pets",
      homeType: formData.get("homeType"),
      familyMembers: formData.get("familyMembers"),
      reason: formData.get("reason"),
      animalId: formData.get("animalId") || null,
    };

    try {
      const res = await fetch("/api/adoption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("Failed to submit adoption application. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container" style={{ textAlign: "center", maxWidth: 540, paddingBlock: "5rem" }}>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🐾</div>
          <h1 style={{ marginBottom: "0.75rem", color: "var(--saffron-600)" }}>Application Received!</h1>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.75, marginBottom: "2rem", color: "var(--stone-600)" }}>
            Thank you for opening your heart and home. Our adoption coordinators will review your details and contact you within <strong>48 hours</strong>.
          </p>

          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "1.75rem 2rem", border: "1px solid var(--cream-200)", marginBottom: "2rem", textAlign: "left", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <h4 style={{ marginBottom: "1rem", fontSize: "1rem", color: "var(--stone-800)" }}>What happens next?</h4>
            {["Application review (1–2 days)", "Phone conversation with coordinator", "Shelter visit & animal bonding session", "Home readiness check & welcome home! ❤️"].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "0.5rem 0", borderBottom: i < 3 ? "1px solid var(--cream-100)" : "none" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--saffron-100)", color: "var(--saffron-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: "0.9rem", color: "var(--stone-700)" }}>{step}</span>
              </div>
            ))}
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} style={{ display: "inline-block" }}>
            <Link href="/animals" className="btn btn-primary btn-lg">
              Browse More Animals
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <section style={{ background: "var(--stone-800)", paddingBlock: "4.5rem 3.5rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <FadeIn direction="up" distance={20}>
            <div className="section-tag" style={{ background: "hsla(26,88%,50%,0.2)", color: "var(--saffron-300)" }}>
              Adoption Program
            </div>
            <h1 style={{ color: "white", marginBottom: "0.75rem" }}>Give a Life a Second Chance</h1>
            <p style={{ color: "hsla(0,0%,100%,0.75)", maxWidth: 520, marginInline: "auto", fontSize: "1.05rem", lineHeight: 1.7 }}>
              Adopt — don&apos;t shop. Every animal here is vaccinated, sterilized, and waiting to become part of your family.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Animals */}
      <section className="section" style={{ background: "var(--cream-50)" }}>
        <div className="container">
          <FadeIn direction="up" distance={20}>
            <h2 style={{ marginBottom: "2.5rem", textAlign: "center" }}>Animals Ready for Adoption</h2>
          </FadeIn>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "center", marginBottom: "3rem" }}>
            {adoptable.map((animal, idx) => (
              <FadeIn key={animal.id} delay={idx * 0.08} direction="up" distance={20}>
                <div onClick={() => setSelectedAnimalId(animal.id)} style={{ cursor: "pointer" }}>
                  <AnimalCard {...animal} />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="section" style={{ background: "white" }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <FadeIn direction="up" distance={25}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div className="section-tag">Apply</div>
              <h2>Adoption Application</h2>
              <p style={{ marginTop: "0.5rem", color: "var(--stone-600)" }}>
                We carefully screen all applications to ensure the happiest lifetime match for our animals.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              {/* Target Animal */}
              <div style={{ background: "var(--saffron-50)", borderRadius: "var(--radius-xl)", padding: "1.75rem 2rem", border: "1.5px solid var(--saffron-200)", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="adopt-animal" style={{ color: "var(--saffron-900)", fontWeight: 700 }}>
                    🐾 Animal You Wish to Adopt
                  </label>
                  <select
                    name="animalId"
                    id="adopt-animal"
                    value={selectedAnimalId}
                    onChange={(e) => setSelectedAnimalId(e.target.value)}
                    className="form-select"
                    style={{ background: "white" }}
                  >
                    <option value="">General Adoption (Open to any suitable match)</option>
                    {adoptable.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type} • {a.breed} • {a.location})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Personal info */}
              <div style={{ background: "var(--cream-50)", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", display: "flex", flexDirection: "column", gap: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: "1.05rem", color: "var(--stone-800)" }}>Personal Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="adopt-name">Full Name *</label>
                    <input name="applicantName" id="adopt-name" required className="form-input" placeholder="Your full name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="adopt-age">Age *</label>
                    <input name="age" id="adopt-age" required type="number" min="18" className="form-input" placeholder="e.g. 28" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="adopt-phone">Phone Number *</label>
                    <input name="phone" id="adopt-phone" required type="tel" className="form-input" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="adopt-email">Email Address *</label>
                    <input name="email" id="adopt-email" required type="email" className="form-input" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="adopt-address">Full Residential Address *</label>
                  <input name="address" id="adopt-address" required className="form-input" placeholder="Complete street address, city, pincode" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="adopt-occupation">Occupation</label>
                  <input name="occupation" id="adopt-occupation" className="form-input" placeholder="e.g. Software Engineer, Teacher, Doctor..." />
                </div>
              </div>

              {/* Living situation */}
              <div style={{ background: "var(--cream-50)", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", display: "flex", flexDirection: "column", gap: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: "1.05rem", color: "var(--stone-800)" }}>Living Environment</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="home-type">Home Type *</label>
                    <select name="homeType" id="home-type" required className="form-select">
                      <option value="">Select...</option>
                      <option>Apartment / Flat</option>
                      <option>Independent House with Garden</option>
                      <option>Independent House without Garden</option>
                      <option>Farm / Rural Sanctuary</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="family-members">Family Members in Home</label>
                    <input name="familyMembers" id="family-members" type="number" min="1" className="form-input" placeholder="e.g. 4" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="existing-pets">Do you currently have pets?</label>
                  <select name="hasPets" id="existing-pets" className="form-select">
                    <option>No pets</option>
                    <option>Yes — dogs</option>
                    <option>Yes — cats</option>
                    <option>Yes — multiple animals</option>
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div className="form-group">
                <label className="form-label" htmlFor="why-adopt">Why do you want to adopt? *</label>
                <textarea
                  name="reason"
                  id="why-adopt"
                  required
                  className="form-textarea"
                  style={{ minHeight: 140 }}
                  placeholder="Tell us about your lifestyle and why you'd provide a great loving home for this animal..."
                />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  disabled={loading}
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", justifyContent: "center", fontSize: "1.05rem" }}
                >
                  {loading ? "Submitting..." : "❤️ Submit Adoption Application"}
                </button>
              </motion.div>
            </form>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

export default function AdoptionPage() {
  return (
    <main style={{ paddingTop: "68px" }}>
      <Suspense fallback={<div style={{ textAlign: "center", padding: "4rem", color: "var(--stone-400)" }}>Loading adoption page...</div>}>
        <AdoptionContent />
      </Suspense>
    </main>
  );
}
