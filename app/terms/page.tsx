import Link from "next/link";
import { Scale, CheckCircle2 } from "lucide-react";
import { AYUDAR_LEGAL, CONTACT_INFO } from "@/lib/data";

export const metadata = {
  title: "Terms of Use",
  description: `Terms of Use governing public services, adoption screening, rescue dispatch, and donations on ${AYUDAR_LEGAL.name}.`,
};

export default function TermsPage() {
  return (
    <main style={{ background: "var(--cream-50)", minHeight: "100vh", paddingTop: "72px" }}>
      <section className="section" style={{ paddingBottom: "4.5rem" }}>
        <div className="container" style={{ maxWidth: "820px" }}>
          <div style={{ marginBottom: "2rem" }}>
            <span className="editorial-eyebrow" style={{ marginBottom: "0.75rem" }}>
              <Scale size={13} style={{ display: "inline", marginRight: 5 }} /> Public Governance &amp; Disclaimers
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", marginBottom: "0.75rem" }}>
              Terms of Use
            </h1>
            <p style={{ color: "var(--stone-600)", fontSize: "0.95rem" }}>
              {AYUDAR_LEGAL.name} · Reg. {AYUDAR_LEGAL.regNo} · NITI Aayog {AYUDAR_LEGAL.nitiAayogId}
            </p>
          </div>

          <div className="card card-elevated" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: 1.75, color: "var(--stone-700)" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", color: "var(--green-800)", marginBottom: "0.5rem" }}>1. Veterinary &amp; Emergency First-Aid Disclaimer</h2>
              <p>
                Guidance displayed by our AI Assistant, first-aid micro-guides, or website articles is strictly emergency stabilization advice intended to keep animals safe while awaiting physical veterinary assessment. It is not a substitute for in-person clinical diagnosis or prescription treatment. Never administer human medication to street animals.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.25rem", color: "var(--green-800)", marginBottom: "0.5rem" }}>2. Rescue Dispatch Boundaries</h2>
              <p>
                Ayudar dispatches rescue responders primarily across Tilabad, Kumarpur, Asansol, Raniganj, Durgapur, and surrounding Paschim Bardhaman corridors subject to active field team availability and safety. False, abusive, or automated spam submissions are rate-limited and blocked to keep emergency lines open for critical cases.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.25rem", color: "var(--green-800)", marginBottom: "0.5rem" }}>3. Adoptions, Volunteering &amp; ABC/ARV Programs</h2>
              <p>
                Submitting an adoption application or sponsorship pledge expresses welfare intent and initiates verification by our coordinators. Ayudar reserves full discretion to approve, defer, or decline placements solely in the best physical and behavioral interest of the animal. Street sterilization and anti-rabies drives follow Animal Birth Control (Dogs) Rules guidelines.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.25rem", color: "var(--green-800)", marginBottom: "0.5rem" }}>4. Jurisdiction &amp; Official Contacts</h2>
              <p>
                All charitable contributions are voluntary non-commercial gifts used directly for animal medical care, shelter feeding, ambulance logistics, and Gaushala upkeep. Disputes, if any, fall under the jurisdiction of courts in Paschim Bardhaman, West Bengal. Reach our registered office at {CONTACT_INFO.email} or {CONTACT_INFO.phone}.
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--cream-200)", paddingTop: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.86rem" }}>
              <Link href="/privacy-policy" style={{ fontWeight: 600, color: "var(--green-700)" }}>Privacy Policy →</Link>
              <Link href="/refund-policy" style={{ fontWeight: 600, color: "var(--green-700)" }}>Refund &amp; Cancellation Policy →</Link>
              <Link href="/about#csr-kit" style={{ fontWeight: 600, color: "var(--terracotta-hover)" }}><CheckCircle2 size={14} style={{ display: "inline", marginRight: 4 }} />Statutory &amp; CSR Kit →</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
