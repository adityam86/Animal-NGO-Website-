"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS, FOOTER_QUICK_LINKS, CONTACT_INFO, AYUDAR_LEGAL } from "@/lib/data";
import PulseBeacon from "@/components/motion/PulseBeacon";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="navbar-header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? "var(--navbar-bg-scrolled)" : "var(--navbar-bg)",
        backdropFilter: "blur(14px)",
        borderBottom: scrolled ? "1px solid var(--cream-200)" : "1px solid transparent",
        transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        boxShadow: scrolled ? "0 4px 20px rgba(30, 58, 47, 0.06)" : "none",
      }}
    >
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>
        {/* Brand Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.7rem", textDecoration: "none" }}>
          <Image
            src="/images/logo.jpg"
            alt={`${AYUDAR_LEGAL.shortName} Logo`}
            width={42}
            height={42}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: "1.5px solid rgba(224, 122, 95, 0.45)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          />
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.12rem", color: "var(--green-700)", lineHeight: 1.15 }}>
              {AYUDAR_LEGAL.shortName}
            </div>
            <div style={{ fontSize: "0.66rem", color: "var(--stone-500)", letterSpacing: "0.04em", fontWeight: 600 }}>
              {AYUDAR_LEGAL.tagline}
            </div>
          </div>
        </Link>

        {/* Minimal 5-Link Desktop Navigation */}
        <nav aria-label="Primary navigation" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }} className="hide-mobile">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`) ||
                  (link.href === "/adoption" && pathname.startsWith("/animals"));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                style={{
                  padding: "0.45rem 0.95rem",
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--green-700)" : "var(--stone-700)",
                  background: isActive ? "var(--sage-tint, var(--green-50))" : "transparent",
                  borderRadius: "var(--radius-full)",
                  transition: "all 0.2s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--green-700)";
                  (e.currentTarget as HTMLElement).style.background = "var(--sage-tint, var(--green-50))";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isActive ? "var(--green-700)" : "var(--stone-700)";
                  (e.currentTarget as HTMLElement).style.background = isActive ? "var(--sage-tint, var(--green-50))" : "transparent";
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTAs: Soft Outlined Report Rescue + Filled Terracotta Donate */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }} className="hide-mobile">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/rescue"
              className="btn btn-emergency-outline btn-sm"
              style={{ fontSize: "0.84rem", display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.45rem 1rem" }}
            >
              <PulseBeacon color="#D64545" size={7} pulseScale={2.2} />
              <span>Report Rescue</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/donate" className="btn btn-terracotta btn-sm" style={{ padding: "0.5rem 1.2rem" }}>
              Donate
            </Link>
          </motion.div>

          <ThemeToggle />
        </div>

        {/* Mobile hamburger */}
        <button
          className="hide-desktop"
          onClick={() => setOpen(!open)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem", color: "var(--stone-700)" }}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              background: "var(--color-surface)",
              borderTop: "1px solid var(--cream-200)",
              overflow: "hidden",
            }}
            className="hide-desktop mobile-nav-drawer"
          >
            <div style={{ padding: "1.25rem 1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {[...NAV_LINKS, ...FOOTER_QUICK_LINKS.filter((q) => !NAV_LINKS.some((n) => n.href === q.href))].map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    style={{
                      padding: "0.7rem 1rem",
                      fontSize: "0.94rem",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "var(--green-700)" : "var(--stone-700)",
                      background: isActive ? "var(--green-50)" : "transparent",
                      borderRadius: "var(--radius-md)",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--cream-200)" }}>
                <Link
                  href="/rescue"
                  className="btn btn-emergency btn-sm"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setOpen(false)}
                >
                  🚨 Report Rescue
                </Link>
                <Link
                  href="/donate"
                  className="btn btn-terracotta btn-sm"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setOpen(false)}
                >
                  Donate
                </Link>
                <ThemeToggle />
              </div>

              <a
                href={`tel:${CONTACT_INFO.emergencyPhone}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  color: "var(--green-700)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                <Phone size={16} /> {CONTACT_INFO.emergencyPhone} (24/7 Ayuda)
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
