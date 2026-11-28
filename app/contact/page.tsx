"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, CheckCircle, Send, ExternalLink, ShieldCheck, MessageCircle } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import { CONTACT_INFO, AYUDAR_LEGAL } from "@/lib/data";

const InteractiveMap = dynamic(() => import("@/components/shared/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 280, background: "var(--cream-100)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--stone-500)", fontWeight: 600 }}>
      Loading Sanctuary Map...
    </div>
  ),
});

const SUBJECT_OPTIONS = [
  "General Enquiry",
  "CSR Partnership",
  "Adoption Enquiry",
  "Volunteer Enquiry",
  "Donation / Sponsorship",
  "Shelter Visit",
  "Media / Press",
  "Complaint / Feedback",
];

function ContactPageContent() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get("subject") || "General Enquiry";
  const resolvedUrlSubject = SUBJECT_OPTIONS.includes(initialSubject) ? initialSubject : "General Enquiry";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subjectOverride, setSubjectOverride] = useState<string | null>(null);
  const subject = subjectOverride ?? resolvedUrlSubject;
  const [message, setMessage] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to send your message right now.");
      }
      setSubmittedId(data.id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error while sending.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ background: "var(--cream-50)", minHeight: "100vh" }}>
      <section
        style={{
          background: "linear-gradient(135deg, #1E3A2F 0%, #274D3E 100%)",
          color: "white",
          padding: "clamp(6.25rem, 11vw, 7.75rem) 0 clamp(2.75rem, 5vw, 3.75rem)",
        }}
      >
        <div className="container">
          <FadeIn direction="up" distance={16}>
            <div className="section-tag" style={{ background: "rgba(224, 122, 95, 0.24)", color: "#FFD6CC" }}>
              Contact &amp; CSR Partnerships
            </div>
            <h1 style={{ color: "white", fontSize: "clamp(2rem, 4.5vw, 3.1rem)", marginBottom: "0.65rem" }}>
              Reach {AYUDAR_LEGAL.shortName} Anytime
            </h1>
            <p style={{ color: "rgba(250, 247, 242, 0.85)", maxWidth: "54ch", fontSize: "1.02rem", lineHeight: 1.7, margin: 0 }}>
              Questions about adoptions, CSR grants ({AYUDAR_LEGAL.csrRegNo}), sanctuary visits, or 80G tax receipts? We respond within 24 hours.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", alignItems: "start" }}>
            {/* Left Info & Map */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "1.65rem", border: "1px solid var(--cream-200)", boxShadow: "var(--shadow-sm)" }}>
                <h2 style={{ fontSize: "1.35rem", marginBottom: "1rem" }}>Sanctuary Contact Details</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", fontSize: "0.9rem", color: "var(--stone-700)" }}>
                  <div style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
                    <MapPin size={18} style={{ color: "var(--terracotta)", flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong>Shelter Address</strong>
                      <div>{CONTACT_INFO.address}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
                    <Phone size={18} style={{ color: "var(--crimson)", flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong>Helpline, WhatsApp &amp; Team Contacts</strong>
                      <div>
                        Main &amp; WhatsApp ({CONTACT_INFO.primaryContact.name}):{" "}
                        <a href={`tel:${CONTACT_INFO.emergencyPhone.replace(/\s+/g, "")}`} style={{ color: "var(--stone-900)", fontWeight: 600 }}>
                          {CONTACT_INFO.emergencyPhone}
                        </a>
                      </div>
                      {CONTACT_INFO.teamContacts
                        .filter((m) => m.name !== CONTACT_INFO.primaryContact.name)
                        .map((member) => (
                          <div key={member.name}>
                            {member.name} ({member.role}):{" "}
                            <a href={`tel:${member.phone.replace(/\s+/g, "")}`} style={{ color: "var(--stone-800)", fontWeight: 500 }}>
                              {member.phone}
                            </a>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
                    <Mail size={18} style={{ color: "var(--green-600)", flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong>Email</strong>
                      <div>{CONTACT_INFO.email}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
                    <Clock size={18} style={{ color: "var(--green-600)", flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong>Visiting Hours</strong>
                      <div>{CONTACT_INFO.hours}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "1.25rem", display: "flex", flexWrap: "wrap", gap: "0.65rem" }}>
                  <a
                    href={AYUDAR_LEGAL.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ gap: "0.35rem" }}
                  >
                    Open Google Maps Location <ExternalLink size={13} />
                  </a>
                  <a
                    href={CONTACT_INFO.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-green btn-sm"
                    style={{ gap: "0.35rem" }}
                  >
                    <MessageCircle size={14} /> WhatsApp ({CONTACT_INFO.primaryContact.name})
                  </a>
                </div>

                <div style={{ marginTop: "1.1rem", paddingTop: "0.9rem", borderTop: "1px solid var(--cream-200)", fontSize: "0.76rem", color: "var(--stone-500)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <ShieldCheck size={14} style={{ color: "var(--green-600)", flexShrink: 0 }} />
                  <span>Reg: {AYUDAR_LEGAL.regNo} • CSR: {AYUDAR_LEGAL.csrRegNo} • 80G: {AYUDAR_LEGAL.urn80G}</span>
                </div>
              </div>

              <InteractiveMap mode="facilities" height={320} />
            </div>

            {/* Right Message Form */}
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "clamp(1.5rem, 3.5vw, 2.25rem)", border: "1px solid var(--cream-200)", boxShadow: "var(--shadow-md)" }}>
              {submittedId ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "1.5rem 0" }}>
                  <CheckCircle size={44} style={{ color: "var(--green-600)", marginInline: "auto", marginBottom: "0.85rem" }} />
                  <h3 style={{ marginBottom: "0.45rem" }}>Message Sent ({submittedId})</h3>
                  <p style={{ color: "var(--stone-600)", marginBottom: "1.25rem" }}>
                    Thank you for writing to {AYUDAR_LEGAL.shortName}. Our coordinator will reply to <strong>{email}</strong> shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedId(null);
                      setMessage("");
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h2 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>Send Us a Message</h2>

                  <div className="responsive-grid-2" style={{ gap: "1rem" }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-name">Your Name *</label>
                      <input id="contact-name" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-phone">Phone (optional)</label>
                      <input id="contact-phone" type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98XXX XXXXX" />
                    </div>
                  </div>

                  <div className="responsive-grid-2" style={{ gap: "1rem" }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-email">Email Address *</label>
                      <input id="contact-email" type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-subject">Subject *</label>
                      <select
                        id="contact-subject"
                        className="form-select"
                        value={subject}
                        onChange={(e) => setSubjectOverride(e.target.value)}
                      >
                        {SUBJECT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-message">Message *</label>
                    <textarea
                      id="contact-message"
                      required
                      className="form-textarea"
                      style={{ minHeight: 140 }}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  {errorMsg && (
                    <div role="alert" style={{ padding: "0.8rem 1rem", borderRadius: "var(--radius-md)", background: "#FDF0F0", color: "#A62828", fontSize: "0.86rem", fontWeight: 600 }}>
                      {errorMsg}
                    </div>
                  )}

                  <button type="submit" disabled={submitting} className="btn btn-terracotta btn-lg" style={{ width: "100%", justifyContent: "center", gap: "0.5rem" }}>
                    <Send size={17} /> {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<main className="section"><div className="container">Loading contact form...</div></main>}>
      <ContactPageContent />
    </Suspense>
  );
}
