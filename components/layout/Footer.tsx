"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Heart, ShieldCheck, ExternalLink } from "lucide-react";
import { NAV_LINKS, FOOTER_QUICK_LINKS, CONTACT_INFO, AYUDAR_LEGAL } from "@/lib/data";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer" style={{ paddingBlock: "4.5rem 2.5rem" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "2.75rem", marginBottom: "2.75rem" }}>
          {/* Brand & Mission */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1rem" }}>
              <Image
                src="/images/logo.jpg"
                alt={AYUDAR_LEGAL.name}
                width={52}
                height={52}
                style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(224, 122, 95, 0.5)" }}
              />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "white" }}>
                  {AYUDAR_LEGAL.shortName}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#E07A5F", fontWeight: 700, letterSpacing: "0.04em" }}>
                  {AYUDAR_LEGAL.tagline}
                </div>
              </div>
            </div>

            <p style={{ color: "rgba(250, 247, 242, 0.78)", fontSize: "0.88rem", lineHeight: 1.75, marginBottom: "1.25rem" }}>
              {AYUDAR_LEGAL.mission} Serving injured street animals, abandoned companions, and sheltered cows across Raniganj, Asansol &amp; Durgapur.
            </p>

            {/* 80G & Verification Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.45rem 0.85rem",
                borderRadius: "var(--radius-full)",
                background: "rgba(230, 239, 233, 0.12)",
                border: "1px solid rgba(230, 239, 233, 0.25)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#bbf7d0",
              }}
            >
              <ShieldCheck size={14} />
              80G Tax Exempt • URN: {AYUDAR_LEGAL.urn80G}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 style={{ color: "white", marginBottom: "1.15rem", fontSize: "0.88rem", fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Explore
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{ color: "rgba(250, 247, 242, 0.72)", fontSize: "0.88rem", textDecoration: "none" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {FOOTER_QUICK_LINKS.filter((q) => !NAV_LINKS.some((n) => n.href === q.href)).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{ color: "rgba(250, 247, 242, 0.72)", fontSize: "0.88rem", textDecoration: "none" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Fund Allocation & Registrations */}
          <div>
            <h4 style={{ color: "white", marginBottom: "1.15rem", fontSize: "0.88rem", fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Donor Transparency
            </h4>
            <div style={{ marginBottom: "1.15rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "rgba(250,247,242,0.8)", marginBottom: "0.4rem" }}>
                <span>Medical &amp; Food (75%)</span>
                <span>Shelter (15%) • Van (10%)</span>
              </div>
              <div style={{ display: "flex", height: "8px", borderRadius: "999px", overflow: "hidden", background: "rgba(255,255,255,0.12)" }}>
                <div style={{ width: "75%", background: "#4ade80" }} />
                <div style={{ width: "15%", background: "#E07A5F" }} />
                <div style={{ width: "10%", background: "#fbbf24" }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.78rem", color: "rgba(250,247,242,0.72)", lineHeight: 1.55 }}>
              <div><strong style={{ color: "white" }}>Reg. No:</strong> {AYUDAR_LEGAL.regNo}</div>
              <div><strong style={{ color: "white" }}>NITI Aayog:</strong> {AYUDAR_LEGAL.nitiAayogId}</div>
              <div><strong style={{ color: "white" }}>CSR Reg. No:</strong> {AYUDAR_LEGAL.csrRegNo}</div>
              <div><strong style={{ color: "white" }}>80G URN:</strong> {AYUDAR_LEGAL.urn80G} ({AYUDAR_LEGAL.urn80GDate})</div>
            </div>
          </div>

          {/* Contact & Location */}
          <div>
            <h4 style={{ color: "white", marginBottom: "1.15rem", fontSize: "0.88rem", fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Sanctuary &amp; Helpline
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <a
                href={AYUDAR_LEGAL.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start", color: "rgba(250,247,242,0.78)", fontSize: "0.86rem", textDecoration: "none", lineHeight: 1.55 }}
              >
                <MapPin size={15} style={{ color: "#E07A5F", marginTop: "3px", flexShrink: 0 }} />
                <span>
                  {CONTACT_INFO.address}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#E07A5F", fontWeight: 600, marginLeft: "0.35rem" }}>
                    Open in Google Maps <ExternalLink size={12} />
                  </span>
                </span>
              </a>

              <div style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
                <Phone size={15} style={{ color: "#E07A5F", flexShrink: 0 }} />
                <a href={`tel:${CONTACT_INFO.phone}`} style={{ color: "rgba(250,247,242,0.78)", fontSize: "0.86rem", textDecoration: "none" }}>
                  {CONTACT_INFO.phone}
                </a>
              </div>

              <div style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
                <Mail size={15} style={{ color: "#E07A5F", flexShrink: 0 }} />
                <a href={`mailto:${CONTACT_INFO.email}`} style={{ color: "rgba(250,247,242,0.78)", fontSize: "0.86rem", textDecoration: "none" }}>
                  {CONTACT_INFO.email}
                </a>
              </div>

              <div
                style={{
                  marginTop: "0.35rem",
                  padding: "0.85rem 1rem",
                  background: "rgba(214, 69, 69, 0.18)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(214, 69, 69, 0.42)",
                }}
              >
                <div style={{ color: "#fca5a5", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.06em", marginBottom: "0.2rem" }}>
                  🚨 AYUDA 24/7 EMERGENCY
                </div>
                <a href={`tel:${CONTACT_INFO.emergencyPhone}`} style={{ color: "white", fontWeight: 700, fontSize: "1rem", textDecoration: "none" }}>
                  {CONTACT_INFO.emergencyPhone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ color: "rgba(250,247,242,0.58)", fontSize: "0.8rem", margin: 0 }}>
            © {currentYear} {AYUDAR_LEGAL.name} • Reg. No: {AYUDAR_LEGAL.regNo} • NITI Aayog: {AYUDAR_LEGAL.nitiAayogId} • CSR: {AYUDAR_LEGAL.csrRegNo}
          </p>
          <p style={{ color: "rgba(250,247,242,0.58)", fontSize: "0.8rem", margin: 0, display: "flex", alignItems: "center", gap: "0.35rem" }}>
            Made with <Heart size={12} fill="currentColor" style={{ color: "#E07A5F" }} /> for every animal
          </p>
        </div>
      </div>
    </footer>
  );
}
