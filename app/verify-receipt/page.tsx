"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Search, Printer, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { AYUDAR_LEGAL, CONTACT_INFO } from "@/lib/data";
import QrCodeImage from "@/components/shared/QrCodeImage";

type VerifiedReceipt = {
  found: boolean;
  verified: boolean;
  recordType: "Donation" | "Sponsorship";
  receiptId: string;
  paymentId: string | null;
  maskedDonorName: string;
  maskedPan: string | null;
  amount: number;
  purpose: string;
  frequency: string;
  paymentStatus: string;
  issuedAt: string;
  organization: {
    name: string;
    regNo: string;
    urn80G: string;
    urn80GDate: string;
  };
};

function VerifyReceiptContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";
  const [queryRef, setQueryRef] = useState(initialRef);
  const [loading, setLoading] = useState(Boolean(initialRef));
  const [result, setResult] = useState<VerifiedReceipt | null>(null);
  const [error, setError] = useState("");

  const runVerify = async (ref: string) => {
    const clean = ref.trim();
    if (!clean) {
      setError("Please enter a Donation ID, Sponsorship ID, or Razorpay Payment ID.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/receipts/verify?ref=${encodeURIComponent(clean)}`);
      const data = (await res.json()) as VerifiedReceipt & { error?: string };
      if (!res.ok || !data.found) {
        setError(data.error || "No matching donation receipt found.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Unable to reach verification server. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clean = initialRef.trim();
    if (!clean) return;
    let active = true;
    fetch(`/api/receipts/verify?ref=${encodeURIComponent(clean)}`)
      .then((res) => res.json().then((data: VerifiedReceipt & { error?: string }) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!active) return;
        if (!ok || !data.found) {
          setError(data.error || "No matching donation receipt found.");
          setResult(null);
        } else {
          setError("");
          setResult(data);
        }
      })
      .catch(() => {
        if (active) setError("Unable to reach verification server. Please retry.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialRef]);

  const verifyUrl =
    typeof window !== "undefined" && result
      ? `${window.location.origin}/verify-receipt?ref=${encodeURIComponent(result.receiptId)}`
      : result
      ? `https://www.ayudarindia.com/verify-receipt?ref=${encodeURIComponent(result.receiptId)}`
      : "";

  return (
    <main style={{ background: "var(--cream-50)", minHeight: "100vh", paddingTop: "72px" }}>
      <section className="section" style={{ paddingBottom: "4.5rem" }}>
        <div className="container" style={{ maxWidth: "780px" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span className="editorial-eyebrow" style={{ marginBottom: "0.75rem" }}>
              <ShieldCheck size={13} style={{ display: "inline", marginRight: 5 }} /> Public 80G Tax Transparency Portal
            </span>
            <h1 style={{ fontSize: "clamp(1.9rem, 4vw, 2.75rem)", marginBottom: "0.75rem" }}>
              Verify an 80G Donation Receipt
            </h1>
            <p style={{ color: "var(--stone-600)", maxWidth: "56ch", marginInline: "auto", lineHeight: 1.65 }}>
              Confirm the authenticity of any Ayudar Animal Welfare Foundation donation or monthly sponsorship using its Receipt ID or Razorpay Payment ID (`pay_...`). Personal details are masked for donor privacy.
            </p>
          </div>

          <div className="card card-elevated no-print" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void runVerify(queryRef);
              }}
              style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
            >
              <input
                type="text"
                className="form-input"
                value={queryRef}
                onChange={(e) => setQueryRef(e.target.value)}
                placeholder="Enter Donation ID, Sponsorship ID, or pay_..."
                aria-label="Receipt or Payment ID"
                style={{ flex: 1, minWidth: "240px" }}
              />
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ gap: "0.45rem" }}>
                <Search size={16} /> {loading ? "Checking..." : "Verify Receipt"}
              </button>
            </form>

            {error && (
              <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--crimson)", fontSize: "0.88rem", fontWeight: 600 }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>

          {result && (
            <div
              className="card card-elevated"
              style={{
                padding: "2rem",
                border: result.verified ? "2px solid var(--green-500)" : "2px solid var(--terracotta)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.25rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                <div>
                  <span
                    className={`badge ${result.verified ? "badge-green" : "badge-amber"}`}
                    style={{ marginBottom: "0.65rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    {result.verified ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    {result.verified ? "VERIFIED 80G ELIGIBLE RECEIPT" : `PAYMENT STATUS: ${result.paymentStatus.toUpperCase()}`}
                  </span>
                  <h2 style={{ fontSize: "1.45rem", marginBottom: "0.25rem" }}>{result.organization.name}</h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--stone-600)", margin: 0 }}>
                    Reg. {result.organization.regNo} · 80G URN {result.organization.urn80G} ({result.organization.urn80GDate})
                  </p>
                </div>

                <QrCodeImage value={verifyUrl} size={96} label={`Verification QR for ${result.receiptId}`} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                  gap: "1rem",
                  background: "var(--cream-50)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  border: "1px solid var(--cream-200)",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase" }}>Receipt Ref</div>
                  <div style={{ fontWeight: 700, fontFamily: "monospace", fontSize: "0.88rem" }}>{result.receiptId}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase" }}>Amount Contributed</div>
                  <div style={{ fontWeight: 700, color: "var(--green-800)", fontSize: "1.1rem" }}>₹{result.amount.toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase" }}>Donor (Masked)</div>
                  <div style={{ fontWeight: 600 }}>{result.maskedDonorName}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase" }}>Purpose &amp; Frequency</div>
                  <div style={{ fontWeight: 600 }}>{result.purpose} ({result.frequency})</div>
                </div>
                {result.paymentId && (
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase" }}>Gateway Payment ID</div>
                    <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{result.paymentId}</div>
                  </div>
                )}
                {result.maskedPan && (
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase" }}>PAN Recorded (Masked)</div>
                    <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{result.maskedPan}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone-500)", textTransform: "uppercase" }}>Recorded Date</div>
                  <div style={{ fontSize: "0.88rem" }}>{new Date(result.issuedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                </div>
              </div>

              <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <button type="button" onClick={() => window.print()} className="btn btn-terracotta btn-sm" style={{ gap: "0.4rem" }}>
                  <Printer size={15} /> Print Verification Slip
                </button>
                <span style={{ fontSize: "0.8rem", color: "var(--stone-500)" }}>
                  Questions? Write to {CONTACT_INFO.email} · <Link href="/refund-policy" style={{ fontWeight: 600 }}>Refund Policy</Link>
                </span>
              </div>
            </div>
          )}

          <div style={{ marginTop: "1.75rem", textAlign: "center", fontSize: "0.84rem", color: "var(--stone-500)" }}>
            Official NGO Verification · {AYUDAR_LEGAL.name} · {CONTACT_INFO.address}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function VerifyReceiptPage() {
  return (
    <Suspense fallback={<main style={{ paddingTop: "120px", textAlign: "center" }}>Loading 80G Verifier...</main>}>
      <VerifyReceiptContent />
    </Suspense>
  );
}
