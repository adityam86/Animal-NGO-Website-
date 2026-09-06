"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid layout shift before mount
    return (
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "transparent",
        }}
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark ? "rgba(255, 255, 255, 0.08)" : "var(--cream-100)",
        color: isDark ? "var(--saffron-400)" : "var(--stone-700)",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid var(--cream-200)",
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        outline: "none",
        padding: 0,
        boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08) rotate(8deg)";
        e.currentTarget.style.background = isDark
          ? "rgba(255, 255, 255, 0.15)"
          : "var(--saffron-100)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1) rotate(0deg)";
        e.currentTarget.style.background = isDark
          ? "rgba(255, 255, 255, 0.08)"
          : "var(--cream-100)";
      }}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
