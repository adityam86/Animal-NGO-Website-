import Link from "next/link";
import { RotateCcw, ShieldCheck } from "lucide-react";
import { AYUDAR_LEGAL, CONTACT_INFO } from "@/lib/data";

export const metadata = {
  title: "Refund & Cancellation Policy",
  description: `Donation Refund, Duplicate Charge Resolution, and 80G Receipt Cancellation Policy for ${AYUDAR_LEGAL.name}.`,
};

export default function RefundPolicyPage() {
  return (
    <main style={{ background: "var(--cream-50)", minHeight: "100vh", paddingTop: "72px" }}>
      <section className="section" style={{ paddingBottom: "4.5rem" }}>
        <div className="container" style={{ maxWidth: "820px" }}>
          <div style={{ marginBottom: "2rem" }}>
            <span className="editorial-eyebrow" style={{ marginBottom: "0.75rem" }}>
              <RotateCcw size={13} style={{ display: "inline", marginRight: 5 }} /> Donation Transparency
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", marginBottom: "0.75rem" }}>
              Refund &amp; Cancellation Policy
            </h1>
            <p style={{ color: "var(--stone-600)", fontSize: "0.95rem" }}>
              {AYUDAR_LEGAL.name} · 80G URN {AYUDAR_LEGAL.urn80G} · CSR-1 {AYUDAR_LEGAL.csrRegNo}
            </p>
          </div>

          <div className="card card-elevated" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: 1.75, color: "var(--stone-700)" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", color: "var(--green-800)", marginBottom: "0.5rem" }}>1. Voluntary Charitable Donations</h2>
              <p>
                Contributions donated toward emergency veterinary surgeries, medicine stock, feeding, or Gaushala shelter upkeep are generally non-refundable once allocated to medical care. However, we recognize that accidental duplicate debits or typographical amount errors can occur.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.25rem", color: "var(--green-800)", marginBottom: "0.5rem" }}>2. Eligible Refund Requests (Within 7 Days)</h2>
              <p>
                You may request a full or partial reversal within <strong>7 calendar days</strong> of a transaction if:
              </p>
              <ul style={{ paddingLeft: "1.25rem", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <li>Your bank/UPI account was charged twice for the same donation attempt.</li>
                <li>An accidental extra digit or incorrect contribution amount was paid due to technical delay.</li>
                <li>A transaction failed at our portal while funds were still debited and did not auto-reverse.</li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: "1.25rem", color: "var(--green-800)", marginBottom: "0.5rem" }}>3. How to Request Resolution &amp; Processing Time</h2>
              <p>
                Write to <a href={`mailto:${CONTACT_INFO.email}`} style={{ fontWeight: 600 }}>{CONTACT_INFO.email}</a> or WhatsApp {CONTACT_INFO.phone} with your Donor Name, Donation/Order ID, Razorpay Payment ID (`pay_...`), transaction date, and amount. Once verified with our payment gateway, approved refunds are credited back to the original payment source within <strong>5–7 working days</strong>, and the corresponding 80G tax receipt is cancelled in Form 10BD records.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.25rem", color: "var(--green-800)", marginBottom: "0.5rem" }}>4. Monthly Sponsorship Cancellations</h2>
              <p>
                Monthly care supporters can pause or cancel upcoming recurring pledges anytime by emailing {CONTACT_INFO.email} or contacting our coordinator desk at least 48 hours before the next billing cycle.
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--cream-200)", paddingTop: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.86rem" }}>
              <Link href="/verify-receipt" style={{ fontWeight: 600, color: "var(--terracotta-hover)" }}><ShieldCheck size={14} style={{ display: "inline", marginRight: 4 }} />Verify an Existing 80G Receipt →</Link>
              <Link href="/donate" style={{ fontWeight: 600, color: "var(--green-700)" }}>Support Medical Care →</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
