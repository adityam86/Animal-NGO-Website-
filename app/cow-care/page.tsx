"use client";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";


const cowServices = [
  { icon: "🚑", title: "Cow Rescue", desc: "24/7 emergency rescue for injured, lost, or abandoned cows across the region." },
  { icon: "🏠", title: "Permanent Shelter", desc: "Spacious, clean Gaushala with proper fencing, shade, and sanitation." },
  { icon: "🩺", title: "Medical Treatment", desc: "In-house vet team handling injuries, hoof disease, parasites, and surgeries." },
  { icon: "🌾", title: "Daily Feeding", desc: "Nutritious daily feed — green fodder, dry straw, and mineral supplements." },
  { icon: "🤰", title: "Pregnant Cows", desc: "Special care for pregnant cows — pre and post natal treatment and calf care." },
  { icon: "👵", title: "Old & Disabled Cows", desc: "Cows who cannot be released receive lifelong care and dignity at our Gaushala." },
];

const sponsorshipTiers = [
  { amount: "₹500/mo", label: "Food Sponsor", desc: "Covers daily feeding for one cow", emoji: "🌾" },
  { amount: "₹1,000/mo", label: "Medical Sponsor", desc: "Covers vaccinations & routine medical care", emoji: "💉" },
  { amount: "₹1,500/mo", label: "Care Sponsor", desc: "Food + medical + shelter maintenance", emoji: "🏠" },
  { amount: "₹3,000/mo", label: "Full Sponsor", desc: "Complete monthly care for one cow", emoji: "💛" },
];

export default function CowCarePage() {
  return (
    <main style={{ paddingTop: "68px" }}>
      {/* Hero */}
      <section style={{ position: "relative", minHeight: 480, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Image src="/images/cow_care_banner.jpg" alt="Ayudar Gaushala" fill style={{ objectFit: "cover", objectPosition: "center 40%" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,25,10,0.85) 0%, rgba(10,25,10,0.4) 60%, transparent 100%)" }} />
        </div>
        <div className="container" style={{ position: "relative", paddingTop: "2rem" }}>
          <div style={{ maxWidth: 560 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 1rem", background: "hsla(142,55%,35%,0.3)", border: "1px solid hsla(142,55%,35%,0.6)", borderRadius: "var(--radius-full)", color: "var(--green-200)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              🐄 Ayudar Gaushala
            </div>
            <h1 style={{ color: "white", marginBottom: "1rem" }}>A Sacred Duty — Every Cow Deserves Care</h1>
            <p style={{ color: "hsla(0,0%,100%,0.8)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "2rem" }}>
              Our Gaushala provides permanent shelter, daily feeding, veterinary care, and love to rescued cows who have no one else.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/sponsor" className="btn btn-green btn-lg">🐄 Sponsor a Cow</Link>
              <Link href="/rescue" className="btn btn-white btn-lg">Report Injured Cow</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "var(--green-700)", paddingBlock: "2.5rem" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1.5rem", textAlign: "center" }}>
            {[
              { n: "68", label: "Cows in Shelter" },
              { n: "12", label: "Pregnant Rescued" },
              { n: "340+", label: "Cows Treated" },
              { n: "24", label: "Active Sponsors" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: "2.25rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "white" }}>{s.n}</div>
                <div style={{ fontSize: "0.825rem", color: "hsla(0,0%,100%,0.65)", marginTop: "0.2rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section" style={{ background: "var(--cream-50)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-tag" style={{ background: "var(--green-50)", color: "var(--green-700)" }}>Our Services</div>
            <h2>Complete Cow Care Under One Roof</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {cowServices.map((s) => (
              <div key={s.title} className="card" style={{ padding: "1.75rem" }}>
                <div style={{ fontSize: "2.25rem", marginBottom: "1rem" }}>{s.icon}</div>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "0.6rem" }}>{s.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--stone-500)", lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured cow — Lakshmi */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "3rem", alignItems: "center" }}>
            <div style={{ position: "relative", borderRadius: "var(--radius-xl)", overflow: "hidden", aspectRatio: "4/5" }}>
              <Image src="/images/cow_lakshmi.jpg" alt="Lakshmi the rescued cow" fill style={{ objectFit: "cover" }} />
            </div>
            <div>
              <div className="section-tag" style={{ background: "var(--green-50)", color: "var(--green-700)" }}>Featured Resident</div>
              <h2>Meet Lakshmi</h2>
              <p style={{ marginTop: "0.75rem", lineHeight: 1.8, marginBottom: "1rem" }}>
                Rescued from the Durgapur expressway in November 2025, Lakshmi was malnourished and had severe hoof damage from months of wandering on tar roads.
              </p>
              <p style={{ lineHeight: 1.8, marginBottom: "2rem" }}>
                Today, Lakshmi is healthy, well-fed, and has a kind sponsor who visits her every month. She has become the heart of our Gaushala.
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Link href="/animals/ANM-000097" className="btn btn-green">Read Her Story</Link>
                <Link href="/sponsor" className="btn btn-outline" style={{ borderColor: "var(--green-400)", color: "var(--green-600)" }}>Sponsor Like Lakshmi</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsorship tiers */}
      <section id="sponsor" className="section" style={{ background: "var(--green-700)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 1rem", background: "hsla(0,0%,100%,0.15)", borderRadius: "var(--radius-full)", color: "hsla(0,0%,100%,0.85)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1rem" }}>
              💛 Sponsorship
            </div>
            <h2 style={{ color: "white" }}>Sponsor a Cow's Care</h2>
            <p style={{ color: "hsla(0,0%,100%,0.75)", maxWidth: 480, marginInline: "auto", marginTop: "0.75rem" }}>
              Your monthly sponsorship directly funds the daily care of a specific cow. You'll receive monthly updates and photos.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {sponsorshipTiers.map((tier) => (
              <div key={tier.label} style={{ background: "hsla(0,0%,100%,0.1)", borderRadius: "var(--radius-lg)", padding: "1.75rem", border: "1.5px solid hsla(0,0%,100%,0.2)", textAlign: "center", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "hsla(0,0%,100%,0.18)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "hsla(0,0%,100%,0.1)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{tier.emoji}</div>
                <div style={{ fontSize: "1.4rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "white" }}>{tier.amount}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "hsla(0,0%,100%,0.9)", marginTop: "0.25rem", marginBottom: "0.5rem" }}>{tier.label}</div>
                <p style={{ fontSize: "0.8rem", color: "hsla(0,0%,100%,0.6)", marginBottom: "1.25rem", lineHeight: 1.6 }}>{tier.desc}</p>
                <Link href="/sponsor" className="btn btn-white btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                  Sponsor Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
