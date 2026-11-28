"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS, FOOTER_QUICK_LINKS, CONTACT_INFO, AYUDAR_LEGAL } from "@/lib/data";
import ThemeToggle from "@/components/shared/ThemeToggle";

const DESKTOP_NAV = [
  { label: "Rescue", href: "/rescue" },
  { label: "Adoption", href: "/adoption" },
  { label: "Stories", href: "/stories" },
  { label: "Volunteer", href: "/volunteer" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overDarkHero = isHome && !scrolled && !open;

  const mobileLinks = [
    ...DESKTOP_NAV,
    ...NAV_LINKS,
    { label: "Gallery", href: "/gallery" },
    { label: "ABC & ARV Drives", href: "/drives" },
    { label: "Rescue Heatmap", href: "/rescue/map" },
    { label: "Verify 80G Receipt", href: "/verify-receipt" },
    ...FOOTER_QUICK_LINKS,
  ].filter((item, idx, arr) => arr.findIndex((x) => x.href === item.href) === idx);

  return (
    <header
      className="navbar-header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        background: overDarkHero
          ? "linear-gradient(to bottom, rgba(14, 28, 22, 0.72), rgba(14, 28, 22, 0.25))"
          : "var(--navbar-bg-scrolled)",
        backdropFilter: overDarkHero ? "none" : "blur(12px)",
        borderBottom: overDarkHero
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid var(--cream-200)",
        boxShadow: scrolled ? "0 2px 16px rgba(18, 29, 23, 0.06)" : "none",
        transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
          gap: "1rem",
        }}
      >
        {/* Brand Identity */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Image
            src="/images/logo.jpg"
            alt={`${AYUDAR_LEGAL.shortName} Logo`}
            width={40}
            height={40}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: overDarkHero
                ? "1.5px solid rgba(224, 122, 95, 0.7)"
                : "1.5px solid rgba(217, 107, 82, 0.45)",
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "1.18rem",
                color: overDarkHero ? "#FAF7F2" : "var(--green-700)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}
            >
              {AYUDAR_LEGAL.shortName}
            </div>
            <div
              style={{
                fontSize: "0.66rem",
                color: overDarkHero ? "rgba(250, 247, 242, 0.78)" : "var(--stone-500)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 600,
                marginTop: "1px",
              }}
            >
              {AYUDAR_LEGAL.tagline}
            </div>
          </div>
        </Link>

        {/* Clean Editorial Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hide-mobile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(1rem, 2vw, 1.85rem)",
          }}
        >
          {DESKTOP_NAV.map((link) => {
            const isActive =
              pathname === link.href ||
              pathname.startsWith(`${link.href}/`) ||
              (link.href === "/adoption" && pathname.startsWith("/animals"));

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className="nav-link-editorial"
                style={{
                  color: overDarkHero
                    ? isActive
                      ? "#FFFFFF"
                      : "rgba(250, 247, 242, 0.88)"
                    : isActive
                    ? "var(--green-700)"
                    : "var(--stone-700)",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Utility: Helpline & Single Prominent Donate Action */}
        <div
          className="hide-mobile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexShrink: 0,
          }}
        >
          <a
            href={`tel:${CONTACT_INFO.emergencyPhone}`}
            title="24/7 Emergency Rescue Helpline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: overDarkHero ? "rgba(255, 224, 214, 0.92)" : "var(--crimson)",
              letterSpacing: "0.01em",
            }}
          >
            <Phone size={14} />
            <span>24/7 Rescue</span>
          </a>

          <Link
            href="/donate"
            className="btn btn-terracotta btn-sm"
            style={{ padding: "0.55rem 1.25rem", fontWeight: 600 }}
          >
            Donate
          </Link>

          <ThemeToggle />
        </div>

        {/* Mobile Quick Controls */}
        <div className="hide-desktop" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link
            href="/donate"
            className="btn btn-terracotta btn-sm"
            style={{ padding: "0.42rem 0.9rem", fontSize: "0.82rem" }}
          >
            Donate
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.45rem",
              color: overDarkHero ? "#FAF7F2" : "var(--stone-800)",
            }}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: "var(--color-surface)",
              borderTop: "1px solid var(--cream-200)",
              borderBottom: "1px solid var(--cream-200)",
              overflow: "hidden",
              maxHeight: "calc(100vh - 72px)",
              overflowY: "auto",
            }}
            className="hide-desktop mobile-nav-drawer"
          >
            <div style={{ padding: "1.25rem var(--container-pad) 2.5rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              {mobileLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    style={{
                      padding: "0.72rem 0.75rem",
                      fontSize: "0.98rem",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--terracotta)" : "var(--stone-800)",
                      borderBottom: "1px solid var(--cream-100)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginTop: "1rem" }}>
                <Link
                  href="/rescue"
                  className="btn btn-emergency btn-sm"
                  style={{ justifyContent: "center" }}
                  onClick={() => setOpen(false)}
                >
                  Report Injured Animal
                </Link>
                <Link
                  href="/donate"
                  className="btn btn-terracotta btn-sm"
                  style={{ justifyContent: "center" }}
                  onClick={() => setOpen(false)}
                >
                  Donate Now
                </Link>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "0.85rem",
                  paddingTop: "0.85rem",
                  borderTop: "1px solid var(--cream-200)",
                }}
              >
                <a
                  href={`tel:${CONTACT_INFO.emergencyPhone}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    color: "var(--crimson)",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                  }}
                >
                  <Phone size={15} /> {CONTACT_INFO.emergencyPhone} (24/7)
                </a>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
