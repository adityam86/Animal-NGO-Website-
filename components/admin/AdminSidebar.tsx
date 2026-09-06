"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Heart,
  ShieldAlert,
  Users,
  IndianRupee,
  BookOpen,
  LogOut,
  ClipboardList,
  Stethoscope,
  Building,
  BarChart2,
  ExternalLink,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", icon: Home, label: "Dashboard", exact: true },
  { href: "/admin/rescues", icon: ShieldAlert, label: "Rescue Cases", badge: "Live" },
  { href: "/admin/adoption", icon: ClipboardList, label: "Adoptions" },
  { href: "/admin/animals", icon: Heart, label: "Animals" },
  { href: "/admin/medical", icon: Stethoscope, label: "Medical Portal" },
  { href: "/admin/donations", icon: IndianRupee, label: "Donations" },
  { href: "/admin/volunteers", icon: Users, label: "Volunteers" },
  { href: "/admin/shelters", icon: Building, label: "Shelters" },
  { href: "/admin/reports", icon: BarChart2, label: "Reports & Analytics" },
  { href: "/admin/stories", icon: BookOpen, label: "Rescue Stories" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 260,
        background: "#0f172a", // Deep Slate Obsidian
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        color: "#f8fafc",
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.3rem" }}>🐾</span>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "#f97316",
                letterSpacing: "-0.01em",
              }}
            >
              Ayudar <span style={{ color: "#f8fafc", fontWeight: 600 }}>Ops</span>
            </div>
          </div>
          <div
            style={{
              fontSize: "0.68rem",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginTop: "0.15rem",
            }}
          >
            Command & Sanctuary Center
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav
        style={{
          padding: "1.25rem 0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.65rem 0.9rem",
                borderRadius: "var(--radius-md)",
                color: isActive ? "#fb923c" : "#94a3b8",
                background: isActive
                  ? "rgba(249, 115, 22, 0.12)"
                  : "transparent",
                borderLeft: isActive
                  ? "3px solid #f97316"
                  : "3px solid transparent",
                textDecoration: "none",
                fontWeight: isActive ? 700 : 500,
                fontSize: "0.88rem",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.color = "#f8fafc";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Icon size={17} style={{ color: isActive ? "#f97316" : "#64748b", flexShrink: 0 }} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    padding: "0.15rem 0.45rem",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "#f87171",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Utility Actions */}
      <div
        style={{
          padding: "1rem 0.75rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
        }}
      >
        <Link
          href="/"
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.55rem 0.85rem",
            borderRadius: "var(--radius-md)",
            color: "#94a3b8",
            fontSize: "0.82rem",
            fontWeight: 500,
            textDecoration: "none",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.color = "#f8fafc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#94a3b8";
          }}
        >
          <ExternalLink size={15} style={{ color: "#64748b" }} />
          <span>View Public Site</span>
        </Link>

        <form action="/api/logout" method="POST">
          <button
            type="submit"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.55rem 0.85rem",
              width: "100%",
              background: "transparent",
              color: "#94a3b8",
              borderRadius: "var(--radius-md)",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.82rem",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
              e.currentTarget.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
