import Link from "next/link";
import { ShieldCheck, Lock, Mail, Phone } from "lucide-react";
import { AYUDAR_LEGAL, CONTACT_INFO } from "@/lib/data";

export const metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy and Data Protection practices of ${AYUDAR_LEGAL.name} (${AYUDAR_LEGAL.regNo}).`,
};

export default function PrivacyPolicyPage() {
  return (
    <main style={{ background: "var(--cream-50)", minHeight: "100vh", paddingTop: "72px" }}>
      <section className="section" style={{ paddingBottom: "4.5rem" }}>
        <div className="container" style={{ maxWidth: "820px" }}>
          <div style={{ marginBottom: "2rem" }}>
            <span className="editorial-eyebrow" style={{ marginBottom: "0.75rem" }}>
              <Lock size={13} style={{ display: "inline", marginRight: 5 }} /> Data Protection &amp; Witness Confidentiality
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", marginBottom: "0.75rem" }}>
              Privacy Policy
            </h1>
            <p style={{ color: "var(--stone-600)", fontSize: "0.95rem" }}>
              Effective Date: January 2026 · Governed by {AYUDAR_LEGAL.name} (Reg. {AYUDAR_LEGAL.regNo})
            </p>
          </div>

          <div className="card card-elevated" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: 1.75, color: "var(--stone-700)" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", color: "var(--green-800)", marginBottom: "0.5rem" }}>1. Information We Collect</h2>
              <p>
                We only collect information you voluntarily provide when reporting an injured animal, donating under 80G rules, applying to adopt or volunteer, requesting an ABC/anti-rabies camp, or contacting our desk:
              </p>
              <ul style={{ paddingLeft: "1.25rem", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <li><strong>Emergency Rescue Reports:</strong> Reporter name, phone number, optional email, incident landmark/coordinates, private incident photograph, and optional private witness voice note.</li>
                <li><strong>Donations &amp; 80G Receipts:</strong> Donor name, phone, email, optional PAN (collected strictly for Form 10BD/80G statutory compliance), payment reference IDs processed securely via Razorpay. We never store raw card, UPI PIN, or bank credentials.</li>
                <li><strong>Adoptions, Volunteers &amp; Drives:</strong> Applicant contact details and home/ward readiness notes for welfare screening.</li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: "1.25rem", color: "var(--green-800)", marginBottom: "0.5rem" }}>2. Rescue Reporter Privacy &amp; EXIF Stripping</h2>
              <p>
                All uploaded rescue incident photos and voice notes are stored in access-controlled private storage accessible strictly to verified shelter administrators and rescue coordinators. Public rescue case trackers (`/rescue/track`) and the community rescue heatmap (`/rescue/map`) exclude reporter names, phone numbers, emails, raw incident photos, voice notes, and exact street addresses.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.25rem", color: "var(--green-800)", marginBottom: "0.5rem" }}>3. Legal Basis, Retention &amp; Third Parties</h2>
              <p>
                We never sell, rent, or trade donor or reporter data. Essential third-party processors are limited to Razorpay (payment settlement), encrypted cloud database/storage providers, optional transactional email delivery for 80G receipts, and aggregated privacy-safe page view analytics. Statutory donation records are retained as mandated under the Indian Income Tax Act, 1961.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.25rem", color: "var(--green-800)", marginBottom: "0.5rem" }}>4. Data Requests &amp; Grievance Officer</h2>
              <p>
                You may request correction or deletion of personal contact records (excluding statutory financial audit logs) by writing to us or calling our shelter desk:
              </p>
              <div style={{ marginTop: "0.75rem", background: "var(--cream-100)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", fontSize: "0.9rem" }}>
                <div><strong>Grievance &amp; Shelter Desk:</strong> {CONTACT_INFO.primaryContact.name}</div>
                <div><Phone size={13} style={{ display: "inline", marginRight: 6 }} /><a href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, "")}`}>{CONTACT_INFO.phone}</a></div>
                <div><Mail size={13} style={{ display: "inline", marginRight: 6 }} /><a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a></div>
                <div style={{ marginTop: "0.25rem", fontSize: "0.82rem", color: "var(--stone-600)" }}>{CONTACT_INFO.address}</div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--cream-200)", paddingTop: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.86rem" }}>
              <Link href="/terms" style={{ fontWeight: 600, color: "var(--green-700)" }}>Terms of Use →</Link>
              <Link href="/refund-policy" style={{ fontWeight: 600, color: "var(--green-700)" }}>Donation Refund &amp; Cancellation Policy →</Link>
              <Link href="/verify-receipt" style={{ fontWeight: 600, color: "var(--terracotta-hover)" }}><ShieldCheck size={14} style={{ display: "inline", marginRight: 4 }} />Verify 80G Receipt →</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
