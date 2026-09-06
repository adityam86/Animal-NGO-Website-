"use client";

import Link from "next/link";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { ShieldAlert, ExternalLink, Activity, Menu } from "lucide-react";

interface AdminHeaderProps {
  activeRescuesCount?: number;
  onToggleSidebar?: () => void;
}

export default function AdminHeader({ activeRescuesCount = 0, onToggleSidebar }: AdminHeaderProps) {
  return (
    <header
      style={{
        height: 60,
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--cream-200)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "background 0.25s, border-color 0.25s",
      }}
    >
      {/* Left: Mobile Hamburger & Context / Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="admin-mobile-only"
          aria-label="Open navigation menu"
          style={{
            background: "var(--cream-100)",
            border: "1px solid var(--cream-200)",
            color: "var(--color-text)",
            width: 36,
            height: 36,
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Menu size={20} />
        </button>

        {/* Mobile Brand Title */}
        <div className="admin-mobile-only" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ fontSize: "1.15rem" }}>🐾</span>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#f97316", fontFamily: "var(--font-display)" }}>
            Ayudar <span style={{ color: "var(--color-text)", fontWeight: 600 }}>Ops</span>
          </span>
        </div>

        {/* Desktop Section Context */}
        <div className="admin-desktop-only">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "var(--stone-500)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <Activity size={15} style={{ color: "var(--saffron-500)" }} />
            Operations Command
          </div>
        </div>
      </div>

      {/* Right: Emergency Beacon + Quick Actions + Theme Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {/* Active Emergency Badge */}
        <Link
          href="/admin/rescues"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.32rem 0.65rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#dc2626",
            fontSize: "0.75rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "transform 0.15s, background 0.15s",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#ef4444",
              display: "inline-block",
              boxShadow: "0 0 6px #ef4444",
            }}
          />
          <ShieldAlert size={13} />
          <span className="admin-desktop-only">Active Rescues</span>
          <span className="admin-mobile-only">Alerts</span>
        </Link>

        {/* View Public Website */}
        <Link
          href="/"
          target="_blank"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--stone-600)",
            textDecoration: "none",
            padding: "0.32rem 0.55rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--cream-200)",
            background: "var(--cream-50)",
          }}
        >
          <span className="admin-desktop-only">Live Site</span>
          <ExternalLink size={13} />
        </Link>

        {/* Theme Toggle Button */}
        <ThemeToggle />
      </div>
    </header>
  );
}
