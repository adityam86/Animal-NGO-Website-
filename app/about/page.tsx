import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, MapPin, Phone, ExternalLink, Clock } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import HoverCard from "@/components/motion/HoverCard";
import BeforeAfterSlider from "@/components/shared/BeforeAfterSlider";
import { AYUDAR_LEGAL, CONTACT_INFO, STORIES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Impact, Transparency & About",
  description: `${AYUDAR_LEGAL.mission} Registered Animal Welfare Foundation (Reg. ${AYUDAR_LEGAL.regNo}, 80G URN ${AYUDAR_LEGAL.urn80G}) serving Raniganj, Asansol & Durgapur.`,
};

const CREDENTIALS = [
  { label: "NGO Registration No.", value: AYUDAR_LEGAL.regNo, note: "Registered Non-Profit Welfare Trust" },
  { label: "NITI Aayog (NGO Darpan)", value: AYUDAR_LEGAL.nitiAayogId, note: "Government of India Verified ID" },
  { label: "CSR Registration No.", value: AYUDAR_LEGAL.csrRegNo, note: "MCA Form CSR-1 Compliant" },
  { label: "80G Exemption URN", value: AYUDAR_LEGAL.urn80G, note: `Valid tax exemption (Dt: ${AYUDAR_LEGAL.urn80GDate})` },
];

const FUND_ALLOCATION = [
  { label: "Medical Treatment, Surgery & Daily Food", pct: 75, color: "#1E3A2F" },
  { label: "Shelter Operations, Kennels & Hygiene", pct: 15, color: "#E07A5F" },
  { label: "24/7 Rescue Ambulance & Field Transport", pct: 10, color: "#687870" },
];

const TEAM = [
  { name: "Dr. Priya Sharma", role: "Chief Veterinary Officer", since: "2018" },
  { name: "Arjun Dey", role: "Rescue Operations Head", since: "2019" },
  { name: "Kavya Nair", role: "Adoption & Volunteer Coordinator", since: "2020" },
  { name: "Ravi Mukherjee", role: "Gaushala & Shelter Manager", since: "2018" },
];

const TIMELINE = [
  { year: "2018", event: "Started in Raniganj with grassroots volunteers answering roadside trauma calls." },
  { year: "2020", event: "Expanded dedicated Gaushala cow-care wing after rescuing highway trauma cattle." },
  { year: "2022", event: `Formally registered under ${AYUDAR_LEGAL.regNo} with full adoption and rehabilitation protocols.` },
  { year: "2023", event: "Launched mobile veterinary dispatch across Asansol, NH-19 highway, and Durgapur." },
  { year: "2025", event: `Verified under NITI Aayog (${AYUDAR_LEGAL.nitiAayogId}), CSR (${AYUDAR_LEGAL.csrRegNo}) & 80G (${AYUDAR_LEGAL.urn80G}).` },
];

const TRANSFORMATION_IMAGES: Record<string, { before: string; after: string }> = {
  "bruno-road-to-recovery": {
    before: "/images/rescue_story_banner.jpg",
    after: "/images/dog_bruno.jpg",
  },
  "lakshmi-the-highway-cow": {
    before: "/images/cow_care_banner.jpg",
    after: "/images/cow_lakshmi.jpg",
  },
};

export default function AboutPage() {
  return (
    <main style={{ background: "var(--cream-50)", minHeight: "100vh" }}>
      {/* Hero with Official Logo & Mission */}
      <section
        style={{
          background: "linear-gradient(135deg, #1E3A2F 0%, #264A3B 100%)",
          color: "white",
          padding: "clamp(6.25rem, 11vw, 7.75rem) 0 clamp(3rem, 6vw, 4.25rem)",
        }}
      >
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2.25rem", alignItems: "center" }}>
            <FadeIn direction="up" distance={16}>
              <div className="section-tag" style={{ background: "rgba(224, 122, 95, 0.24)", color: "#FFD6CC" }}>
                Impact, Transparency &amp; About
              </div>
              <h1 style={{ color: "white", fontSize: "clamp(2.1rem, 4.5vw, 3.2rem)", lineHeight: 1.12, marginBottom: "0.9rem" }}>
                {AYUDAR_LEGAL.shortName} — {AYUDAR_LEGAL.tagline}
              </h1>
              <p style={{ color: "rgba(250, 247, 242, 0.9)", fontSize: "1.12rem", lineHeight: 1.7, maxWidth: "52ch", marginBottom: "1.35rem" }}>
                “{AYUDAR_LEGAL.mission}”
              </p>
              <p style={{ color: "rgba(250, 247, 242, 0.78)", fontSize: "0.95rem", lineHeight: 1.75, maxWidth: "54ch", margin: 0 }}>
                Mandated to serve suffering, injured, and abandoned animals across Raniganj, Asansol, Durgapur, and surrounding highway corridors with zero tolerance for cruelty and complete accountability to our supporters.
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={0.1} distance={16} style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.75rem",
                  textAlign: "center",
                  maxWidth: 320,
                }}
              >
                <Image
                  src="/images/logo.jpg"
                  alt={`${AYUDAR_LEGAL.name} Official Seal`}
                  width={160}
                  height={160}
                  style={{ borderRadius: "50%", marginInline: "auto", marginBottom: "1rem", border: "4px solid rgba(224, 122, 95, 0.7)" }}
                />
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "white" }}>{AYUDAR_LEGAL.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#FFD6CC", marginTop: "0.2rem" }}>
                  Reg: {AYUDAR_LEGAL.regNo}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Official Credentials & Registration Strip */}
      <section className="section-sm">
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", color: "var(--green-700)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <ShieldCheck size={17} /> Statutory Registrations &amp; Tax Compliance
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1rem" }}>
            {CREDENTIALS.map((cred) => (
              <div
                key={cred.label}
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem",
                  border: "1px solid var(--cream-200)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--stone-500)", marginBottom: "0.3rem" }}>
                  {cred.label}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.18rem", fontWeight: 800, color: "var(--green-700)", marginBottom: "0.2rem" }}>
                  {cred.value}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--stone-600)" }}>{cred.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fund Allocation Visual */}
      <section className="section-sm" style={{ background: "var(--color-surface)", borderBlock: "1px solid var(--cream-200)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "2.25rem", alignItems: "center" }}>
            <div>
              <div className="section-tag">Financial Transparency</div>
              <h2 style={{ marginBottom: "0.65rem" }}>How Every Contribution Is Used</h2>
              <p style={{ color: "var(--stone-600)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                Three-quarters of all funding goes directly into animal medicine, orthopedic surgeries, vaccinations, and daily nutrition across our shelter &amp; Gaushala.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link href="/donate" className="btn btn-terracotta btn-sm">
                  Make an 80G Donation →
                </Link>
                <Link href="/contact?subject=CSR+Partnership" className="btn btn-outline btn-sm">
                  CSR Inquiry ({AYUDAR_LEGAL.csrRegNo})
                </Link>
              </div>
            </div>

            <div style={{ background: "var(--cream-50)", padding: "1.65rem", borderRadius: "var(--radius-xl)", border: "1px solid var(--cream-200)" }}>
              {/* Stacked Horizontal Bar */}
              <div style={{ height: 18, borderRadius: "var(--radius-full)", overflow: "hidden", display: "flex", marginBottom: "1.25rem" }}>
                {FUND_ALLOCATION.map((row) => (
                  <div
                    key={row.label}
                    style={{ width: `${row.pct}%`, background: row.color }}
                    title={`${row.label}: ${row.pct}%`}
                  />
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {FUND_ALLOCATION.map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", fontSize: "0.88rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, color: "var(--stone-800)" }}>
                      <span style={{ width: 11, height: 11, borderRadius: 3, background: row.color, flexShrink: 0 }} />
                      {row.label}
                    </span>
                    <strong style={{ color: "var(--green-700)" }}>{row.pct}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before & After Transformation Archive */}
      <section className="section">
        <div className="container">
          <FadeIn direction="up" distance={16}>
            <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
              <div className="section-tag">Recovery Archive</div>
              <h2>Before &amp; After Transformations</h2>
              <p style={{ color: "var(--stone-600)", maxWidth: "54ch", marginInline: "auto" }}>
                Drag the slider on any rescue transformation and open their full medical story.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1.5rem" }}>
            {STORIES.slice(0, 3).map((story) => {
              const pair = TRANSFORMATION_IMAGES[story.slug] || {
                before: story.coverImage,
                after: "/images/dog_ruby.jpg",
              };
              return (
                <div
                  key={story.slug}
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-xl)",
                    padding: "1.15rem",
                    border: "1px solid var(--cream-200)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <BeforeAfterSlider
                    beforeImage={pair.before}
                    afterImage={pair.after}
                    beforeLabel="Day 1 Rescue"
                    afterLabel="Recovered & Happy"
                    aspectRatio="16 / 10"
                    title={story.animal}
                  />
                  <h3 style={{ fontSize: "1.15rem", marginTop: "0.95rem", marginBottom: "0.3rem" }}>
                    {story.title}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--stone-600)", marginBottom: "0.8rem" }}>
                    {story.subtitle}
                  </p>
                  <Link href={`/stories/${story.slug}`} style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--terracotta-hover)" }}>
                    Read Recovery Timeline →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline & Shelter Leadership Team */}
      <section className="section" style={{ background: "var(--cream-100)", borderTop: "1px solid var(--cream-200)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2.5rem" }}>
            <div>
              <div className="section-tag">Our Journey</div>
              <h2 style={{ marginBottom: "1.25rem" }}>From Grassroots Calls to Registered Sanctuary</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {TIMELINE.map((t) => (
                  <div
                    key={t.year}
                    style={{
                      background: "var(--color-surface)",
                      borderRadius: "var(--radius-lg)",
                      padding: "1rem 1.2rem",
                      border: "1px solid var(--cream-200)",
                      display: "flex",
                      gap: "1rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <span className="badge badge-green" style={{ flexShrink: 0 }}>{t.year}</span>
                    <span style={{ fontSize: "0.88rem", color: "var(--stone-700)", lineHeight: 1.6 }}>{t.event}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="section-tag">Core Caregivers</div>
              <h2 style={{ marginBottom: "1.25rem" }}>Meet the Sanctuary Team</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
                {TEAM.map((m) => (
                  <HoverCard key={m.name} lift={4}>
                    <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: "1.15rem", border: "1px solid var(--cream-200)" }}>
                      <h4 style={{ fontSize: "1rem", marginBottom: "0.2rem" }}>{m.name}</h4>
                      <div style={{ fontSize: "0.82rem", color: "var(--terracotta-hover)", fontWeight: 600 }}>{m.role}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--stone-500)", marginTop: "0.25rem" }}>Since {m.since}</div>
                    </div>
                  </HoverCard>
                ))}
              </div>

              {/* Visit Us & Google Maps Block */}
              <div style={{ background: "var(--green-700)", color: "white", borderRadius: "var(--radius-xl)", padding: "1.5rem" }}>
                <h3 style={{ color: "white", fontSize: "1.2rem", marginBottom: "0.65rem" }}>Visit the Sanctuary</h3>
                <div style={{ fontSize: "0.86rem", color: "rgba(250,247,242,0.86)", display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "1.1rem" }}>
                  <div><MapPin size={14} style={{ display: "inline", marginRight: 6 }} />{CONTACT_INFO.address}</div>
                  <div><Clock size={14} style={{ display: "inline", marginRight: 6 }} />{CONTACT_INFO.hours}</div>
                  <div><Phone size={14} style={{ display: "inline", marginRight: 6 }} />Emergency Helpline: {CONTACT_INFO.emergencyPhone}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  <a
                    href={AYUDAR_LEGAL.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-terracotta btn-sm"
                    style={{ gap: "0.35rem" }}
                  >
                    Open Google Maps <ExternalLink size={13} />
                  </a>
                  <Link href="/contact" className="btn btn-sm" style={{ background: "rgba(255,255,255,0.16)", color: "white" }}>
                    Contact Form →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
