"use client";

import { Building2, Printer, CheckCircle2, Mail, Phone } from "lucide-react";
import { AYUDAR_LEGAL, CONTACT_INFO } from "@/lib/data";
import QrCodeImage from "@/components/shared/QrCodeImage";

export default function CsrKitCard() {
  const siteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/about#csr-kit`
      : "https://www.ayudarindia.com/about#csr-kit";

  return (
    <div
      id="csr-kit"
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-xl)",
        border: "1.5px solid var(--green-200)",
        padding: "2rem",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "60ch" }}>
          <span className="editorial-eyebrow" style={{ marginBottom: "0.65rem" }}>
            <Building2 size={13} style={{ display: "inline", marginRight: 5 }} /> Corporate CSR &amp; Institutional Partnership Dossier
          </span>
          <h2 style={{ fontSize: "clamp(1.45rem, 2.8vw, 2rem)", marginBottom: "0.5rem" }}>
            CSR One-Pager &amp; Statutory Verification Kit
          </h2>
          <p style={{ color: "var(--stone-600)", margin: 0, lineHeight: 1.65 }}>
            Schedule VII eligible animal welfare programs across Tilabad, Kumarpur, Asansol, Raniganj &amp; Durgapur. Print or save this summary sheet directly for corporate compliance and board review.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <QrCodeImage value={siteUrl} size={88} label="QR link to Ayudar Statutory Kit" />
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-terracotta btn-sm no-print"
            style={{ gap: "0.4rem" }}
          >
            <Printer size={15} /> Print CSR Sheet
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "0.9rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          { label: "MCA CSR-1 Registration", value: AYUDAR_LEGAL.csrRegNo },
          { label: "80G Tax Exemption URN", value: `${AYUDAR_LEGAL.urn80G} (${AYUDAR_LEGAL.urn80GDate})` },
          { label: "Trust / Society Registration", value: AYUDAR_LEGAL.regNo },
          { label: "NITI Aayog Darpan ID", value: AYUDAR_LEGAL.nitiAayogId },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "var(--cream-50)",
              border: "1px solid var(--cream-200)",
              borderRadius: "var(--radius-md)",
              padding: "0.9rem 1rem",
            }}
          >
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--stone-500)", marginBottom: "0.25rem" }}>
              {item.label}
            </div>
            <div style={{ fontWeight: 700, color: "var(--green-800)", fontSize: "0.92rem", fontFamily: "monospace" }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--green-50)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          border: "1px solid var(--green-100)",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--green-900)", marginBottom: "0.6rem" }}>
          Eligible CSR Focus Areas (Companies Act Schedule VII — Animal Welfare &amp; Ecological Balance)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.55rem", fontSize: "0.86rem", color: "var(--stone-700)" }}>
          <div style={{ display: "flex", gap: "0.45rem", alignItems: "flex-start" }}>
            <CheckCircle2 size={16} style={{ color: "var(--green-600)", flexShrink: 0, marginTop: 2 }} />
            <span>Emergency Road-Accident Animal Rescue &amp; Trauma Triage</span>
          </div>
          <div style={{ display: "flex", gap: "0.45rem", alignItems: "flex-start" }}>
            <CheckCircle2 size={16} style={{ color: "var(--green-600)", flexShrink: 0, marginTop: 2 }} />
            <span>Ward-Wise ABC Sterilization &amp; Anti-Rabies Vaccination Camps</span>
          </div>
          <div style={{ display: "flex", gap: "0.45rem", alignItems: "flex-start" }}>
            <CheckCircle2 size={16} style={{ color: "var(--green-600)", flexShrink: 0, marginTop: 2 }} />
            <span>Gaushala Fodder, Shelter Sheds &amp; Large-Animal Care</span>
          </div>
          <div style={{ display: "flex", gap: "0.45rem", alignItems: "flex-start" }}>
            <CheckCircle2 size={16} style={{ color: "var(--green-600)", flexShrink: 0, marginTop: 2 }} />
            <span>Veterinary Medicine Stock, Post-Op Kennels &amp; Diagnostics</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", fontSize: "0.88rem", color: "var(--stone-700)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
          <span>
            <Phone size={14} style={{ display: "inline", marginRight: 5 }} />
            {CONTACT_INFO.primaryContact.name}: <strong>{CONTACT_INFO.phone}</strong>
          </span>
          <span>
            <Mail size={14} style={{ display: "inline", marginRight: 5 }} />
            <a href={`mailto:${CONTACT_INFO.email}`} style={{ fontWeight: 600 }}>{CONTACT_INFO.email}</a>
          </span>
        </div>
        <span style={{ fontSize: "0.8rem", color: "var(--stone-500)" }}>
          Shelter Address: {CONTACT_INFO.address}
        </span>
      </div>
    </div>
  );
}
