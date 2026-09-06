"use client";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Heart } from "lucide-react";
import { NAV_LINKS, CONTACT_INFO } from "@/lib/data";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer" style={{ paddingBlock: "4.5rem 2.5rem" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "3rem", marginBottom: "3rem" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <Image src="/images/logo.jpg" alt="Ayudar" width={44} height={44} style={{ borderRadius: "50%", objectFit: "cover" }} />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 600, color: "white" }}>Ayudar</div>
                <div style={{ fontSize: "0.65rem", color: "hsla(0,0%,100%,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Animal Welfare Foundation
                </div>
              </div>
            </div>
            <p style={{ color: "hsla(0,0%,100%,0.65)", fontSize: "0.875rem", lineHeight: 1.75, marginBottom: "1.5rem" }}>
              Rescuing, healing, and rehoming animals across Raniganj, Asansol & Durgapur since 2018. Every life matters.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {["f", "in", "ig", "yt"].map((s) => (
                <a
                  key={s}
                  href="#"
                  style={{
                    width: 36, height: 36,
                    borderRadius: "50%",
                    background: "hsla(0,0%,100%,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "hsla(0,0%,100%,0.7)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    transition: "background 0.2s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--saffron-500)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "hsla(0,0%,100%,0.12)"}
                >
                  {s.toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: "white", marginBottom: "1.25rem", fontSize: "0.9rem", fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {NAV_LINKS.slice(0, 6).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{ color: "hsla(0,0%,100%,0.65)", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--saffron-300)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "hsla(0,0%,100%,0.65)"}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 style={{ color: "white", marginBottom: "1.25rem", fontSize: "0.9rem", fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Get Involved
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                { label: "Report an Animal", href: "/rescue" },
                { label: "Adopt a Pet", href: "/adoption" },
                { label: "Become a Volunteer", href: "/volunteer" },
                { label: "Sponsor an Animal", href: "/sponsor" },
                { label: "Donate", href: "/donate" },
                { label: "Share Our Work", href: "/stories" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{ color: "hsla(0,0%,100%,0.65)", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--saffron-300)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "hsla(0,0%,100%,0.65)"}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: "white", marginBottom: "1.25rem", fontSize: "0.9rem", fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Contact Us
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <MapPin size={15} style={{ color: "var(--saffron-400)", marginTop: "2px", flexShrink: 0 }} />
                <span style={{ color: "hsla(0,0%,100%,0.65)", fontSize: "0.875rem", lineHeight: 1.6 }}>{CONTACT_INFO.address}</span>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <Phone size={15} style={{ color: "var(--saffron-400)", flexShrink: 0 }} />
                <a href={`tel:${CONTACT_INFO.phone}`} style={{ color: "hsla(0,0%,100%,0.65)", fontSize: "0.875rem", textDecoration: "none" }}>
                  {CONTACT_INFO.phone}
                </a>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <Mail size={15} style={{ color: "var(--saffron-400)", flexShrink: 0 }} />
                <a href={`mailto:${CONTACT_INFO.email}`} style={{ color: "hsla(0,0%,100%,0.65)", fontSize: "0.875rem", textDecoration: "none" }}>
                  {CONTACT_INFO.email}
                </a>
              </div>

              {/* Emergency */}
              <div style={{
                marginTop: "0.5rem",
                padding: "0.85rem 1rem",
                background: "hsla(0,80%,52%,0.15)",
                borderRadius: "var(--radius-md)",
                border: "1px solid hsla(0,80%,52%,0.3)",
              }}>
                <div style={{ color: "hsl(0,80%,75%)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
                  🚨 EMERGENCY RESCUE
                </div>
                <a href="tel:+919800000000" style={{ color: "white", fontWeight: 700, fontSize: "1rem", textDecoration: "none" }}>
                  +91 98000 00000
                </a>
                <div style={{ color: "hsla(0,0%,100%,0.5)", fontSize: "0.75rem", marginTop: "0.2rem" }}>Available 24/7</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid hsla(0,0%,100%,0.1)", paddingTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "hsla(0,0%,100%,0.45)", fontSize: "0.8rem", margin: 0 }}>
            © {currentYear} Ayudar Animal Welfare Foundation. All rights reserved. | Reg. No: WB-NGO-2018-04512
          </p>
          <p style={{ color: "hsla(0,0%,100%,0.45)", fontSize: "0.8rem", margin: 0, display: "flex", alignItems: "center", gap: "0.35rem" }}>
            Made with <Heart size={12} fill="currentColor" style={{ color: "var(--saffron-400)" }} /> for every animal
          </p>
        </div>
      </div>
    </footer>
  );
}
