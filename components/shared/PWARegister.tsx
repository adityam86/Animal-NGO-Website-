"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("PWA: Service Worker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.warn("PWA: Service Worker registration failed:", err);
          });
      });
    }

    // 2. Capture Install Prompt event for native install experience
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user previously dismissed
      const dismissed = sessionStorage.getItem("ayudar_pwa_dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("ayudar_pwa_dismissed", "true");
  };

  if (!showInstallBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "5.5rem",
        right: "2rem",
        zIndex: 9998,
        maxWidth: 340,
        background: "white",
        borderRadius: "var(--radius-xl)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        border: "1px solid var(--cream-200)",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        animation: "fadeInUp 0.3s ease-out",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <span style={{ fontSize: "1.5rem" }}>📱</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--stone-900)" }}>Install Ayudar App</div>
            <div style={{ fontSize: "0.75rem", color: "var(--stone-500)" }}>One-tap 24/7 rescue hotline & offline access</div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          style={{ background: "transparent", border: "none", color: "var(--stone-400)", cursor: "pointer", padding: "0.2rem" }}
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.2rem" }}>
        <button
          onClick={handleInstallClick}
          style={{
            flex: 1,
            background: "var(--saffron-500)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "0.45rem 0.8rem",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.35rem",
          }}
        >
          <Download size={14} /> Install Now
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: "var(--cream-100)",
            color: "var(--stone-600)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "0.45rem 0.75rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
