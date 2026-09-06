"use client";

import Link from "next/link";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { ShieldAlert, ExternalLink, Activity } from "lucide-react";

interface AdminHeaderProps {
  activeRescuesCount?: number;
}

export default function AdminHeader({ activeRescuesCount = 0 }: AdminHeaderProps) {
  return (
    <header
      style={{
        height: 64,
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--cream-200)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "background 0.25s, border-color 0.25s",
      }}
    >
      {/* Left: Section Context */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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

      {/* Right: Emergency Beacon + Quick Actions + Theme Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Active Emergency Badge */}
        <Link
          href="/admin/rescues"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.35rem 0.75rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#dc2626",
            fontSize: "0.78rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "transform 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.16)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ef4444",
              display: "inline-block",
              boxShadow: "0 0 8px #ef4444",
            }}
          />
          <ShieldAlert size={14} />
          <span>Active Rescues</span>
        </Link>

        {/* View Public Website */}
        <Link
          href="/"
          target="_blank"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--stone-600)",
            textDecoration: "none",
            padding: "0.35rem 0.65rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--cream-200)",
            background: "var(--cream-50)",
          }}
        >
          <span>Live Site</span>
          <ExternalLink size={12} />
        </Link>

        {/* Theme Toggle Button */}
        <ThemeToggle />
      </div>
    </header>
  );
}
