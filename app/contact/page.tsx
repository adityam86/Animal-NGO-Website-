"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { motion } from "framer-motion";
import { CONTACT_INFO } from "@/lib/data";
import FadeIn from "@/components/motion/FadeIn";
import PulseBeacon from "@/components/motion/PulseBeacon";

const InteractiveMap = dynamic(() => import("@/components/shared/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 260,
        background: "var(--cream-100)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--radius-lg)",
        color: "var(--stone-400)",
        fontSize: "0.85rem",
      }}
    >
      Loading shelters map...
    </div>
  ),
});

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main style={{ paddingTop: "68px" }}>
      {/* Header */}
      <section style={{ background: "var(--stone-800)", paddingBlock: "4.5rem 3.5rem", textAlign: "center" }}>
        <div className="container">
          <FadeIn direction="up" distance={20}>
            <div className="section-tag" style={{ background: "hsla(26,88%,50%,0.2)", color: "var(--saffron-300)" }}>
              Contact Us
            </div>
            <h1 style={{ color: "white", marginBottom: "0.75rem" }}>Get in Touch</h1>
            <p style={{ color: "hsla(0,0%,100%,0.75)", maxWidth: 500, marginInline: "auto", fontSize: "1.05rem", lineHeight: 1.7 }}>
              For animal emergencies, please call our 24/7 rescue line. For all other inquiries or visits, reach out below.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="section" style={{ background: "var(--cream-50)", minHeight: "75vh" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "3.5rem" }}>
            {/* Contact info column */}
            <FadeIn direction="left" distance={25}>
              <div>
                <h2 style={{ marginBottom: "2rem", fontSize: "1.6rem" }}>Contact Information</h2>

                {/* Emergency Hotline Card */}
                <div
                  style={{
                    background: "hsl(0,75%,35%)",
                    borderRadius: "var(--radius-xl)",
                    padding: "1.75rem",
                    marginBottom: "2rem",
                    color: "white",
                    boxShadow: "0 8px 24px hsla(0,75%,35%,0.3)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <PulseBeacon color="#ffffff" size={8} pulseScale={2.6} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "hsla(0,0%,100%,0.8)" }}>
                      Emergency Rescue Line
                    </span>
                  </div>
                  <a
                    href={`tel:${CONTACT_INFO.emergencyPhone}`}
                    style={{ fontSize: "1.6rem", fontWeight: 800, color: "white", textDecoration: "none", letterSpacing: "0.02em" }}
                  >
                    {CONTACT_INFO.emergencyPhone}
                  </a>
                  <div style={{ fontSize: "0.82rem", color: "hsla(0,0%,100%,0.75)", marginTop: "0.4rem" }}>
                    Available 24 hours, 7 days a week across the region
                  </div>
                </div>

                {/* Info items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
                  {[
                    { icon: <Phone size={18} />, label: "General Enquiries", value: CONTACT_INFO.phone, href: `tel:${CONTACT_INFO.phone}` },
                    { icon: <Mail size={18} />, label: "Email", value: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}` },
                    { icon: <Mail size={18} />, label: "Rescue Email", value: CONTACT_INFO.rescueEmail, href: `mailto:${CONTACT_INFO.rescueEmail}` },
                    { icon: <MapPin size={18} />, label: "Address", value: CONTACT_INFO.address, href: undefined },
                    { icon: <Clock size={18} />, label: "Office Hours", value: CONTACT_INFO.hours, href: undefined },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: "var(--saffron-100)",
                          color: "var(--saffron-600)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--stone-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>
                          {item.label}
                        </div>
                        {item.href ? (
                          <a href={item.href} style={{ fontWeight: 600, color: "var(--stone-700)", fontSize: "0.92rem", textDecoration: "none" }}>
                            {item.value}
                          </a>
                        ) : (
                          <div style={{ fontWeight: 500, color: "var(--stone-600)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                            {item.value}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interactive Shelter Map */}
                <div style={{ marginTop: "2rem" }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--stone-700)", marginBottom: "0.75rem" }}>
                    📍 Our Facilities & Shelters
                  </div>
                  <InteractiveMap mode="facilities" height={240} />
                </div>
              </div>
            </FadeIn>

            {/* Contact form column */}
            <FadeIn direction="right" distance={25}>
              <div>
                {submitted ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      textAlign: "center",
                      padding: "3.5rem 2rem",
                      background: "white",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--cream-200)",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>✉️</div>
                    <h3 style={{ color: "var(--stone-800)", marginBottom: "0.5rem" }}>Message Sent!</h3>
                    <p style={{ color: "var(--stone-600)", lineHeight: 1.75, maxWidth: 400, marginInline: "auto" }}>
                      Thank you for reaching out. We&apos;ll get back to you within 24 hours. For emergencies, please call our rescue hotline.
                    </p>
                    <button
                      className="btn btn-outline"
                      style={{ marginTop: "1.75rem", cursor: "pointer" }}
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <div
                    style={{
                      background: "white",
                      borderRadius: "var(--radius-xl)",
                      padding: "2.5rem",
                      border: "1px solid var(--cream-200)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    }}
                  >
                    <h2 style={{ marginBottom: "1.75rem", fontSize: "1.5rem", color: "var(--stone-800)" }}>Send Us a Message</h2>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="contact-name">Name *</label>
                          <input id="contact-name" required className="form-input" placeholder="Your name" />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="contact-phone">Phone</label>
                          <input id="contact-phone" type="tel" className="form-input" placeholder="+91 XXXXX" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-email">Email *</label>
                        <input id="contact-email" required type="email" className="form-input" placeholder="your@email.com" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-subject">Subject *</label>
                        <select id="contact-subject" required className="form-select">
                          <option value="">Select a topic...</option>
                          <option>General Enquiry</option>
                          <option>Adoption Enquiry</option>
                          <option>Volunteer Enquiry</option>
                          <option>Donation / Sponsorship</option>
                          <option>Media / Press</option>
                          <option>Complaint / Feedback</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-message">Message *</label>
                        <textarea id="contact-message" required className="form-textarea" style={{ minHeight: 140 }} placeholder="Tell us how we can help..." />
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg"
                          style={{ width: "100%", justifyContent: "center", gap: "0.5rem", fontSize: "1.05rem" }}
                        >
                          <Send size={18} /> Send Message
                        </button>
                      </motion.div>
                    </form>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </main>
  );
}
