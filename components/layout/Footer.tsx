"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ShieldCheck, ExternalLink } from "lucide-react";
import { FOOTER_QUICK_LINKS, CONTACT_INFO, AYUDAR_LEGAL } from "@/lib/data";

const FOOTER_LINKS_PRIMARY = [
  { label: "Home", href: "/" },
  { label: "Report an Injured Animal", href: "/rescue" },
  { label: "Track a Rescue Case", href: "/rescue/track" },
  { label: "Adopt & Foster", href: "/adoption" },
  { label: "Rescue Stories", href: "/stories" },
];

const FOOTER_LINKS_PROGRAMS = [
  { label: "Donate (80G Exempt)", href: "/donate" },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Sponsor an Animal", href: "/sponsor" },
  { label: "Gaushala & Cow Care", href: "/cow-care" },
  { label: "Our Shelter", href: "/shelter" },
  { label: "Impact & Transparency", href: "/about" },
  ...FOOTER_QUICK_LINKS,
].filter((item, idx, arr) => arr.findIndex((x) => x.href === item.href) === idx);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer" style={{ paddingBlock: "4.5rem 2.25rem" }}>
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "2.75rem",
            marginBottom: "3rem",
          }}
        >
          {/* Column 1: Editorial Identity & Statutory Trust */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.1rem" }}>
              <Image
                src="/images/logo.jpg"
                alt={`${AYUDAR_LEGAL.name} Logo`}
                width={48}
                height={48}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1.5px solid rgba(224, 122, 95, 0.55)",
                }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "#FAF7F2",
                    lineHeight: 1.15,
                  }}
                >
                  {AYUDAR_LEGAL.shortName}
                </div>
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "#E07A5F",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {AYUDAR_LEGAL.tagline}
                </div>
              </div>
            </div>

            <p
              style={{
                color: "rgba(250, 247, 242, 0.78)",
                fontSize: "0.88rem",
                lineHeight: 1.75,
                marginBottom: "1.25rem",
                maxWidth: "34ch",
              }}
            >
              {AYUDAR_LEGAL.mission} Street rescue, veterinary medicine, gaushala sanctuary, and adoption across Asansol, Raniganj &amp; Durgapur.
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.42rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#D7E5DA",
              }}
            >
              <ShieldCheck size={14} style={{ color: "#E07A5F" }} />
              <span>80G Exempt · URN {AYUDAR_LEGAL.urn80G}</span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "1.15rem" }}>
              <a
                href={CONTACT_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.38rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#FAF7F2",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                Facebook <ExternalLink size={11} />
              </a>
              <a
                href={CONTACT_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.38rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#FAF7F2",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                Instagram <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Column 2: Rescue & Sanctuary Navigation */}
          <div>
            <h4
              style={{
                color: "#FAF7F2",
                marginBottom: "1.1rem",
                fontSize: "0.76rem",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Field &amp; Sanctuary
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.62rem" }}>
              {FOOTER_LINKS_PRIMARY.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      color: "rgba(250, 247, 242, 0.78)",
                      fontSize: "0.88rem",
                      transition: "color 0.2s",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Programs & Registrations */}
          <div>
            <h4
              style={{
                color: "#FAF7F2",
                marginBottom: "1.1rem",
                fontSize: "0.76rem",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Ways to Help &amp; Governance
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.55rem", marginBottom: "1.25rem" }}>
              {FOOTER_LINKS_PROGRAMS.filter((l) => !FOOTER_LINKS_PRIMARY.some((p) => p.href === l.href)).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      color: "rgba(250, 247, 242, 0.78)",
                      fontSize: "0.88rem",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div style={{ fontSize: "0.75rem", color: "rgba(250, 247, 242, 0.62)", lineHeight: 1.65 }}>
              <div>Reg: {AYUDAR_LEGAL.regNo}</div>
              <div>NITI Aayog: {AYUDAR_LEGAL.nitiAayogId}</div>
              <div>CSR-1: {AYUDAR_LEGAL.csrRegNo}</div>
            </div>
          </div>

          {/* Column 4: Direct Contact & Helpline */}
          <div>
            <h4
              style={{
                color: "#FAF7F2",
                marginBottom: "1.1rem",
                fontSize: "0.76rem",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Sanctuary &amp; Dispatch
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <a
                href={AYUDAR_LEGAL.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  gap: "0.65rem",
                  alignItems: "flex-start",
                  color: "rgba(250, 247, 242, 0.8)",
                  fontSize: "0.86rem",
                  lineHeight: 1.55,
                }}
              >
                <MapPin size={15} style={{ color: "#E07A5F", marginTop: "3px", flexShrink: 0 }} />
                <span>
                  {CONTACT_INFO.address}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#E07A5F", fontWeight: 600, marginLeft: "0.35rem" }}>
                    Directions <ExternalLink size={12} />
                  </span>
                </span>
              </a>

              <div style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start" }}>
                <Phone size={15} style={{ color: "#E07A5F", flexShrink: 0, marginTop: "3px" }} />
                <div style={{ fontSize: "0.84rem", color: "rgba(250, 247, 242, 0.8)", lineHeight: 1.55 }}>
                  <div>
                    <a href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, "")}`} style={{ color: "#FAF7F2", fontWeight: 600 }}>
                      {CONTACT_INFO.phone}
                    </a>{" "}
                    <span style={{ color: "rgba(250, 247, 242, 0.65)" }}>({CONTACT_INFO.primaryContact.name})</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "rgba(250, 247, 242, 0.68)", marginTop: "0.25rem" }}>
                    Rohan Mishra: <a href="tel:+917602666102" style={{ color: "rgba(250, 247, 242, 0.82)" }}>+91 76026 66102</a>
                    {" · "}
                    Sourav: <a href="tel:+919134581378" style={{ color: "rgba(250, 247, 242, 0.82)" }}>+91 91345 81378</a>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
                <Mail size={15} style={{ color: "#E07A5F", flexShrink: 0 }} />
                <a href={`mailto:${CONTACT_INFO.email}`} style={{ color: "rgba(250, 247, 242, 0.8)", fontSize: "0.86rem" }}>
                  {CONTACT_INFO.email}
                </a>
              </div>

              <div
                style={{
                  marginTop: "0.35rem",
                  padding: "0.85rem 1rem",
                  background: "rgba(184, 50, 50, 0.2)",
                  borderRadius: "var(--radius-md)",
                  borderLeft: "3px solid #E07A5F",
                }}
              >
                <div style={{ color: "#FAD4CD", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                  24/7 Helpline &amp; WhatsApp
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <a href={`tel:${CONTACT_INFO.emergencyPhone.replace(/\s+/g, "")}`} style={{ color: "#FAF7F2", fontWeight: 600, fontSize: "1rem" }}>
                    {CONTACT_INFO.emergencyPhone}
                  </a>
                  <a
                    href={CONTACT_INFO.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#E07A5F", fontSize: "0.78rem", fontWeight: 600 }}
                  >
                    WhatsApp →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Official Links Strip */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.14)",
            paddingTop: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ color: "rgba(250, 247, 242, 0.65)", fontSize: "0.8rem", margin: 0 }}>
            © {currentYear} {AYUDAR_LEGAL.name} · Reg. {AYUDAR_LEGAL.regNo} · 80G URN {AYUDAR_LEGAL.urn80G}
          </p>
          <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.8rem", color: "rgba(250, 247, 242, 0.65)" }}>
            <Link href="/about" style={{ color: "inherit" }}>Statutory Records</Link>
            <Link href="/contact" style={{ color: "inherit" }}>Contact &amp; Visits</Link>
            <Link href="/login" style={{ color: "inherit" }}>Staff Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
