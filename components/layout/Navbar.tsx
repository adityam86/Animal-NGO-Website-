"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS } from "@/lib/data";
import PulseBeacon from "@/components/motion/PulseBeacon";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function Navbar() {
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
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem", textDecoration: "none" }}>
          <Image src="/images/logo.jpg" alt="Ayudar Logo" width={40} height={40} style={{ borderRadius: "50%", objectFit: "cover" }} />
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.05rem", color: "var(--stone-800)", lineHeight: 1.2 }}>
              Ayudar
            </div>
            <div style={{ fontSize: "0.65rem", color: "var(--stone-500)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Animal Welfare Foundation
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.2rem" }} className="hide-mobile">
          {NAV_LINKS.slice(0, 7).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "0.45rem 0.85rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--stone-700)",
                borderRadius: "var(--radius-full)",
                transition: "all 0.2s ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--saffron-600)";
                (e.currentTarget as HTMLElement).style.background = "var(--saffron-50)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--stone-700)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right CTAs with motion */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }} className="hide-mobile">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/rescue"
              className="btn btn-emergency btn-sm"
              style={{ fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.45rem 0.95rem" }}
            >
              <PulseBeacon color="#ffffff" size={7} pulseScale={2.4} />
              <span>Report Animal</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link href="/donate" className="btn btn-primary btn-sm" style={{ padding: "0.45rem 1rem" }}>
              Donate
            </Link>
          </motion.div>

          {/* Theme Toggle Button */}
          <ThemeToggle />
        </div>

        {/* Mobile hamburger */}
        <button
          className="hide-desktop"
          onClick={() => setOpen(!open)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem", color: "var(--stone-700)" }}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu with smooth slide/fade */}
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
            className="hide-desktop"
          >
            <div style={{ padding: "1.25rem 1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  style={{
                    padding: "0.75rem 1rem",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color: "var(--stone-700)",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  {link.label}
                </Link>
              ))}

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--cream-200)" }}>
                <Link
                  href="/rescue"
                  className="btn btn-emergency btn-sm"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setOpen(false)}
                >
                  🚨 Report Animal
                </Link>
                <Link
                  href="/donate"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setOpen(false)}
                >
                  Donate
                </Link>
                <ThemeToggle />
              </div>

              <a
                href="tel:+919800000000"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  color: "var(--green-600)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                <Phone size={16} /> +91 98000 00000 (Emergency)
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
