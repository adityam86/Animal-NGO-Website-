"use client";

import { Printer, QrCode, ShieldCheck } from "lucide-react";
import { CONTACT_INFO } from "@/lib/data";
import QrCodeImage from "@/components/shared/QrCodeImage";

type AnimalQrTagProps = {
  id: string;
  name: string;
  type: string;
  gender: string;
  status: string;
  vaccinated: boolean;
  sterilized: boolean;
  dewormed: boolean;
  showPrintButton?: boolean;
};

export default function AnimalQrTag({
  id,
  name,
  type,
  gender,
  status,
  vaccinated,
  sterilized,
  dewormed,
  showPrintButton = true,
}: AnimalQrTagProps) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://www.ayudarindia.com";
  const qrValue = `${origin}/animals/${encodeURIComponent(id)}`;

  return (
    <div
      style={{
        background: "var(--cream-50)",
        border: "1.5px dashed var(--green-300)",
        borderRadius: "var(--radius-lg)",
        padding: "1.15rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.15rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <QrCodeImage value={qrValue} size={96} label={`QR Collar Tag for ${name} (${id})`} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", fontWeight: 700, color: "var(--green-700)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <QrCode size={13} /> Kennel &amp; Collar Tag
          </div>
          <div style={{ fontSize: "1.08rem", fontWeight: 700, color: "var(--stone-900)" }}>
            {name} <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--stone-500)" }}>({id})</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--stone-600)", marginBottom: "0.35rem" }}>
            {type} · {gender} · {status}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", fontSize: "0.72rem" }}>
            {vaccinated && (
              <span className="badge badge-green">
                <ShieldCheck size={11} style={{ marginRight: 3 }} /> Vaccinated
              </span>
            )}
            {sterilized && <span className="badge badge-green">Sterilized</span>}
            {dewormed && <span className="badge badge-stone">Dewormed</span>}
          </div>
          <div style={{ fontSize: "0.74rem", color: "var(--stone-600)", marginTop: "0.45rem" }}>
            If found, scan QR or call Ayudar: <strong>{CONTACT_INFO.emergencyPhone}</strong>
          </div>
        </div>
      </div>

      {showPrintButton && (
        <button
          type="button"
          onClick={() => window.print()}
          className="btn btn-outline btn-sm no-print"
          style={{ gap: "0.35rem" }}
        >
          <Printer size={14} /> Print Collar Tag
        </button>
      )}
    </div>
  );
}
