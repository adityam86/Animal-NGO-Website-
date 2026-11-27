"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, Users, Building2, HeartHandshake, Sparkles } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import { AYUDAR_LEGAL } from "@/lib/data";

const ROLES_DETAIL = [
  {
    id: "Animal Rescue Driver",
    title: "Emergency Rescue Responder",
    time: "4–6 hrs / week (flexible shifts)",
    skills: "Scooter/car helpful, calm temperament, quick navigation",
    desc: "Assist field teams picking up injured street dogs, cats, or injured cows and bringing them safely to veterinary care.",
    icon: "🚑",
  },
  {
    id: "Shelter Care",
    title: "Shelter & Post-Op Care",
    time: "2–4 hrs on mornings or weekends",
    skills: "No prior medical background needed — training provided",
    desc: "Help with feeding schedules, kennel enrichment, puppy socialization, and keeping recovery wards spotless.",
    icon: "🏥",
  },
  {
    id: "Community Feeder",
    title: "Community Street Feeder",
    time: "30 mins daily / weekend routes",
    skills: "Local neighbourhood routes across Raniganj, Asansol & Durgapur",
    desc: "Coordinate clean water bowls, humane street feeding, and spot early health/sterilization needs in your locality.",
    icon: "🥣",
  },
  {
    id: "Social Media / Photography",
    title: "Adoption Storyteller & Media",
    time: "Remote or shelter visits (~2 hrs/wk)",
    skills: "Phone photography, short reels, caption writing",
    desc: "Photograph adoptable rescues and edit recovery stories that help dogs and kittens get adopted faster.",
    icon: "📸",
  },
];

const UPCOMING_DRIVES = [
  {
    id: "drv-arv",
    title: "Anti-Rabies Vaccination (ARV) Community Drive",
    when: "Every 1st & 3rd Sunday • 7:00 AM – 11:00 AM",
    where: "Raniganj Station & Searsole Sectors",
    needed: "6 volunteers for handling, crowd coordination & marking",
  },
  {
    id: "drv-abc",
    title: "Humane ABC Sterilization Catch & Post-Op Check",
    when: "Wednesdays & Saturdays • Morning Dispatch",
    where: "Asansol & Durgapur Feeder Zones",
    needed: "4 locality feeder coordinators",
  },
  {
    id: "drv-sunday",
    title: "Weekend Shelter Care & Puppy Socialization Day",
    when: "Every Sunday • 4:00 PM – 6:30 PM",
    where: "Ayudar Main Sanctuary, Raniganj",
    needed: "Open to students, families & college groups",
  },
];

const FEEDER_TIPS = [
  "Always place ceramic or cement water bowls in shaded corners away from moving traffic.",
  "Feed at consistent low-traffic hours and clear leftovers so neighbours stay supportive.",
  "Report unsterilized females or injured pups early so ABC sterilization prevents suffering.",
  "Reflective collar bands during winter nights save dozens of community dogs on highways.",
];

const ALL_ROLES = [
  "Animal Rescue Driver",
  "Shelter Care",
  "Medical Support",
  "Social Media / Photography",
  "Fundraising",
  "Cow Care (Gaushala)",
  "Adoption Coordinator",
  "Community Feeder",
];

const AVAILABILITY_OPTS = ["Weekdays Morning", "Weekdays Evening", "Weekends", "On-call Emergency"];

export default function VolunteerPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Shelter Care"]);
  const [selectedAvail, setSelectedAvail] = useState<string[]>(["Weekends"]);
  const [rsvpedDrives, setRsvpedDrives] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const selectRoleFromCard = (role: string) => {
    setSelectedRoles((prev) => (prev.includes(role) ? prev : [...prev, role]));
    const el = document.getElementById("volunteer-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleAvail = (a: string) => {
    setSelectedAvail((prev) =>
      prev.includes(a) ? prev.filter((item) => item !== a) : [...prev, a]
    );
  };

  const handleRsvp = (driveId: string, driveTitle: string) => {
    setRsvpedDrives((prev) =>
      prev.includes(driveId) ? prev : [...prev, driveId]
    );
    setExperience((prev) =>
      prev.includes(driveTitle)
        ? prev
        : `${prev ? `${prev}\n` : ""}RSVP Drive: ${driveTitle}`
    );
    const el = document.getElementById("volunteer-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedRoles.length === 0) {
      setErrorMsg("Please select at least one volunteer role.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age: Number(age),
          phone: phone.trim(),
          email: email.trim(),
          location: location.trim(),
          experience: experience.trim(),
          roles: selectedRoles,
          availability: selectedAvail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to submit volunteer registration.");
      }
      setSubmittedId(data.id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ background: "var(--cream-50)", minHeight: "100vh" }}>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #1E3A2F 0%, #274D3E 100%)",
          color: "white",
          padding: "clamp(6.25rem, 11vw, 7.75rem) 0 clamp(2.75rem, 5vw, 3.75rem)",
        }}
      >
        <div className="container">
          <FadeIn direction="up" distance={16}>
            <div className="section-tag" style={{ background: "rgba(224, 122, 95, 0.24)", color: "#FFD6CC" }}>
              Get Involved • Volunteer &amp; CSR
            </div>
            <h1 style={{ color: "white", fontSize: "clamp(2rem, 4.5vw, 3.1rem)", maxWidth: "22ch", marginBottom: "0.75rem" }}>
              Stand beside us for Raniganj’s street animals.
            </h1>
            <p style={{ color: "rgba(250, 247, 242, 0.85)", maxWidth: "56ch", fontSize: "1.02rem", lineHeight: 1.7, margin: 0 }}>
              Whether you drive an injured pup to treatment, sponsor a sterilization drive, or spend Sunday afternoons socialising shelter puppies — your time saves lives.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Role Cards */}
      <section className="section">
        <div className="container">
          <FadeIn direction="up" distance={16}>
            <div style={{ marginBottom: "2rem" }}>
              <div className="section-tag">Volunteer Tracks</div>
              <h2 style={{ marginBottom: "0.4rem" }}>Find a Role That Fits Your Schedule</h2>
              <p style={{ color: "var(--stone-600)", margin: 0 }}>
                Tap any card below to add that role to your application.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.35rem" }}>
            {ROLES_DETAIL.map((role) => (
              <motion.div
                key={role.id}
                whileHover={{ y: -4 }}
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.5rem",
                  border: selectedRoles.includes(role.id) ? "2px solid var(--green-600)" : "1px solid var(--cream-200)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                }}
              >
                <div style={{ fontSize: "2rem" }}>{role.icon}</div>
                <h3 style={{ fontSize: "1.15rem", margin: 0 }}>{role.title}</h3>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--terracotta-hover)" }}>
                  ⏱ {role.time}
                </div>
                <p style={{ fontSize: "0.86rem", color: "var(--stone-600)", lineHeight: 1.6, margin: 0, flex: 1 }}>
                  {role.desc}
                </p>
                <div style={{ fontSize: "0.76rem", color: "var(--stone-500)", paddingTop: "0.25rem" }}>
                  <strong>Best for:</strong> {role.skills}
                </div>
                <button
                  type="button"
                  onClick={() => selectRoleFromCard(role.id)}
                  className={selectedRoles.includes(role.id) ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                  style={{ width: "100%", justifyContent: "center", marginTop: "0.35rem" }}
                >
                  {selectedRoles.includes(role.id) ? "✓ Selected — Complete Form ↓" : "Join This Role"}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Vaccination & Sterilization Drives */}
      <section className="section-sm" style={{ background: "var(--green-50)", borderBlock: "1px solid var(--green-100)" }}>
        <div className="container">
          <div style={{ marginBottom: "1.75rem" }}>
            <div className="section-tag">Field Outreach</div>
            <h2 style={{ marginBottom: "0.35rem" }}>Upcoming Drives &amp; Community Events</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1.25rem" }}>
            {UPCOMING_DRIVES.map((drv) => {
              const rsvped = rsvpedDrives.includes(drv.id);
              return (
                <div
                  key={drv.id}
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1.4rem",
                    border: "1px solid var(--green-200)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.55rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--green-700)" }}>
                    <Calendar size={14} /> {drv.when}
                  </div>
                  <h3 style={{ fontSize: "1.08rem", margin: 0 }}>{drv.title}</h3>
                  <div style={{ fontSize: "0.84rem", color: "var(--stone-600)" }}>
                    <strong>Location:</strong> {drv.where}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--stone-500)", flex: 1 }}>
                    <Users size={13} style={{ display: "inline", marginRight: 4 }} />
                    {drv.needed}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRsvp(drv.id, drv.title)}
                    className={rsvped ? "btn btn-primary btn-sm" : "btn btn-terracotta btn-sm"}
                    style={{ marginTop: "0.5rem", justifyContent: "center" }}
                  >
                    {rsvped ? "✓ Added to Form Below" : "RSVP for This Drive"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Corporate CSR & Community Feeder Split */}
      <section className="section-sm">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {/* Corporate & College CSR Partnerships */}
            <div
              style={{
                background: "#1E3A2F",
                color: "white",
                borderRadius: "var(--radius-xl)",
                padding: "clamp(1.65rem, 3.5vw, 2.25rem)",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", color: "#FFD6CC", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase" }}>
                <Building2 size={16} /> Corporate &amp; College CSR Partnerships
              </div>
              <h3 style={{ color: "white", fontSize: "1.45rem", margin: 0 }}>
                CSR Reg. No: {AYUDAR_LEGAL.csrRegNo}
              </h3>
              <p style={{ color: "rgba(250,247,242,0.84)", fontSize: "0.92rem", lineHeight: 1.7, margin: 0 }}>
                Partner with {AYUDAR_LEGAL.name} (NITI Aayog ID: <strong>{AYUDAR_LEGAL.nitiAayogId}</strong> • 80G URN: <strong>{AYUDAR_LEGAL.urn80G}</strong>) to sponsor a sterilization camp, rescue ambulance maintenance, or campus compassion drives.
              </p>
              <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
                <Link
                  href="/contact?subject=CSR+Partnership"
                  className="btn btn-terracotta"
                  style={{ gap: "0.45rem" }}
                >
                  <HeartHandshake size={17} /> Send CSR / Partner Inquiry →
                </Link>
              </div>
            </div>

            {/* Community Feeder Corner */}
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--cream-200)",
                borderRadius: "var(--radius-xl)",
                padding: "clamp(1.65rem, 3.5vw, 2.25rem)",
              }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", color: "var(--green-700)", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem" }}>
                <Sparkles size={16} /> Community Feeder Corner
              </div>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "0.85rem" }}>Responsible Street Feeding Tips</h3>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: "0.9rem", color: "var(--stone-700)", lineHeight: 1.6 }}>
                {FEEDER_TIPS.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Registration Form */}
      <section id="volunteer-form" className="section" style={{ background: "var(--cream-100)", borderTop: "1px solid var(--cream-200)" }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className="section-tag">Volunteer Registration</div>
            <h2>Join Our Volunteer Network</h2>
            <p style={{ color: "var(--stone-600)", margin: 0 }}>
              Takes 60 seconds. Minimum age: 14 years (with guardian approval for minors).
            </p>
          </div>

          {submittedId ? (
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "2.5rem", border: "2px solid var(--green-300)", textAlign: "center" }}>
              <CheckCircle size={44} style={{ color: "var(--green-600)", marginInline: "auto", marginBottom: "0.85rem" }} />
              <h3 style={{ marginBottom: "0.5rem" }}>Welcome to {AYUDAR_LEGAL.shortName}! ({submittedId})</h3>
              <p style={{ color: "var(--stone-600)", maxWidth: "46ch", marginInline: "auto", marginBottom: "1.35rem" }}>
                Our Volunteer Coordinator will reach out within 48 hours for a short orientation and shelter introduction.
              </p>
              <Link href="/" className="btn btn-primary">
                Return to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "1.75rem", border: "1px solid var(--cream-200)" }}>
                <h3 style={{ fontSize: "1.08rem", marginBottom: "1rem" }}>1. Personal Details</h3>
                <div className="responsive-grid-2" style={{ gap: "1rem", marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="vol-name">Full Name *</label>
                    <input id="vol-name" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Soham Sen" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="vol-age">Age (14+) *</label>
                    <input id="vol-age" type="number" min={14} max={100} required className="form-input" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 24" />
                  </div>
                </div>
                <div className="responsive-grid-2" style={{ gap: "1rem", marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="vol-phone">Phone / WhatsApp *</label>
                    <input id="vol-phone" type="tel" required className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98XXX XXXXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="vol-email">Email Address *</label>
                    <input id="vol-email" type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="vol-location">Area / Neighbourhood</label>
                  <input id="vol-location" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Searsole, Raniganj / City Centre, Durgapur" />
                </div>
              </div>

              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "1.75rem", border: "1px solid var(--cream-200)" }}>
                <h3 style={{ fontSize: "1.08rem", marginBottom: "0.9rem" }}>2. Roles &amp; Availability</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", marginBottom: "1.25rem" }}>
                  {ALL_ROLES.map((r) => {
                    const active = selectedRoles.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleRole(r)}
                        style={{
                          padding: "0.5rem 0.95rem",
                          borderRadius: "var(--radius-full)",
                          border: "1.5px solid",
                          borderColor: active ? "var(--green-600)" : "var(--cream-300)",
                          background: active ? "var(--green-50)" : "var(--color-surface)",
                          color: active ? "var(--green-700)" : "var(--stone-600)",
                          fontWeight: 600,
                          fontSize: "0.84rem",
                          cursor: "pointer",
                        }}
                      >
                        {active ? "✓ " : ""}{r}
                      </button>
                    );
                  })}
                </div>

                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--stone-600)", marginBottom: "0.55rem" }}>
                  Preferred Availability
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
                  {AVAILABILITY_OPTS.map((a) => {
                    const active = selectedAvail.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAvail(a)}
                        style={{
                          padding: "0.45rem 0.9rem",
                          borderRadius: "var(--radius-full)",
                          border: "1.5px solid",
                          borderColor: active ? "var(--terracotta)" : "var(--cream-300)",
                          background: active ? "var(--terracotta)" : "var(--color-surface)",
                          color: active ? "white" : "var(--stone-600)",
                          fontWeight: 600,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                        }}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="vol-experience">Skills, Experience or Selected Drive Notes</label>
                <textarea
                  id="vol-experience"
                  className="form-textarea"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Share vehicle access, pet handling experience, photography, or events you want to attend..."
                />
              </div>

              {errorMsg && (
                <div role="alert" style={{ padding: "0.85rem", borderRadius: "var(--radius-md)", background: "#FDF0F0", color: "#A62828", fontSize: "0.86rem", fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
                {submitting ? "Registering Volunteer..." : "Join as Volunteer →"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
