"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { DONATION_AMOUNTS, DONATION_PURPOSES } from "@/lib/data";
import FadeIn from "@/components/motion/FadeIn";

export default function DonatePage() {
  const [amount, setAmount] = useState<number | null>(500);
  const [custom, setCustom] = useState("");
  const [purpose, setPurpose] = useState(DONATION_PURPOSES[0]);
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [submitted, setSubmitted] = useState(false);
  const [donationId, setDonationId] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const finalAmount = amount ?? (parseInt(custom) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalAmount) return;
    setLoading(true);

    try {
      const name = (document.getElementById("donor-name") as HTMLInputElement).value;
      const phone = (document.getElementById("donor-phone") as HTMLInputElement).value;
      const email = (document.getElementById("donor-email") as HTMLInputElement).value;
      const pan = (document.getElementById("donor-pan") as HTMLInputElement).value;

      // 1. Create Donation Record
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount, purpose, frequency, name, phone, email, pan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to create donation");

      // 2. Load Razorpay
      const resScript = await loadRazorpayScript();
      if (!resScript) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // 3. Create Order
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount, purpose }),
      });
      const order = await orderRes.json();

      // 4. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
        amount: order.amount,
        currency: order.currency,
        name: "Ayudar Animal Welfare",
        description: `Donation: ${purpose}`,
        order_id: order.id,
        handler: async function () {
          setDonationId(data.id || "DON-" + Date.now().toString().slice(-6));
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        prefill: { name, email, contact: phone },
        theme: { color: "#f97316" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function () {
        alert("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main style={{ paddingTop: "68px", minHeight: "85vh", background: "var(--cream-50)", display: "flex", alignItems: "center" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 540 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💛</div>
            <h1 style={{ color: "var(--saffron-600)", marginBottom: "0.75rem" }}>Thank You for Your Generosity!</h1>
            <div
              style={{
                background: "white",
                borderRadius: "var(--radius-xl)",
                padding: "2.25rem 2rem",
                border: "1px solid var(--cream-200)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                marginBottom: "2rem",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--cream-200)", paddingBottom: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--stone-400)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Donation ID
                  </div>
                  <div style={{ fontSize: "1.4rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--saffron-500)", letterSpacing: "0.04em" }}>
                    {donationId}
                  </div>
                </div>
                <span className="badge badge-green" style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}>
                  ✅ Verified 80G
                </span>
              </div>

              <div style={{ padding: "1.25rem", background: "var(--saffron-50)", borderRadius: "var(--radius-lg)", marginBottom: "1.25rem", border: "1px solid var(--saffron-200)" }}>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--stone-800)", fontFamily: "var(--font-display)" }}>
                  ₹{finalAmount.toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: "0.88rem", color: "var(--stone-600)", marginTop: "0.25rem" }}>
                  {purpose} • {frequency === "monthly" ? "Monthly Commitment" : "One-time Gift"}
                </div>
              </div>

              <p style={{ color: "var(--stone-600)", lineHeight: 1.7, fontSize: "0.9rem", margin: 0 }}>
                A confirmation receipt with 80G tax exemption details has been recorded. Your kindness directly feeds and treats animals in need.
              </p>
            </div>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="btn btn-primary"
                style={{ cursor: "pointer" }}
                onClick={() => window.print()}
              >
                🖨️ Print / Save Receipt
              </motion.button>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link href="/stories" className="btn btn-outline">
                  Read Rescue Stories
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ paddingTop: "68px" }}>
      {/* Header */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--saffron-700) 0%, var(--saffron-500) 100%)",
          paddingBlock: "4.5rem 3.5rem",
          textAlign: "center",
        }}
      >
        <div className="container">
          <FadeIn direction="up" distance={20}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>❤️</div>
            <h1 style={{ color: "white", marginBottom: "0.75rem" }}>Help Us Save More Lives</h1>
            <p style={{ color: "hsla(0,0%,100%,0.88)", fontSize: "1.05rem", maxWidth: 540, marginInline: "auto", lineHeight: 1.75 }}>
              Every rupee goes directly to rescue, medical treatment, food, and shelter for animals in need. No animal turned away.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Donation form */}
      <section className="section" style={{ background: "var(--cream-50)" }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <FadeIn direction="up" distance={25}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              {/* Frequency */}
              <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: "1.05rem", marginBottom: "1.25rem", color: "var(--stone-800)" }}>Donation Frequency</h3>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {(["one-time", "monthly"] as const).map((f) => (
                    <motion.button
                      key={f}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFrequency(f)}
                      style={{
                        flex: 1,
                        padding: "0.9rem",
                        borderRadius: "var(--radius-md)",
                        border: "2px solid",
                        borderColor: frequency === f ? "var(--saffron-500)" : "var(--cream-300)",
                        background: frequency === f ? "var(--saffron-50)" : "white",
                        color: frequency === f ? "var(--saffron-700)" : "var(--stone-600)",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {f === "one-time" ? "💳 One-time Gift" : "🔄 Monthly Support"}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: "1.05rem", marginBottom: "1.25rem", color: "var(--stone-800)" }}>Choose Amount</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  {DONATION_AMOUNTS.map((a) => (
                    <motion.button
                      key={a}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setAmount(a);
                        setCustom("");
                      }}
                      style={{
                        padding: "0.9rem",
                        borderRadius: "var(--radius-md)",
                        border: "2px solid",
                        borderColor: amount === a ? "var(--saffron-500)" : "var(--cream-300)",
                        background: amount === a ? "var(--saffron-50)" : "white",
                        color: amount === a ? "var(--saffron-700)" : "var(--stone-700)",
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      ₹{a.toLocaleString("en-IN")}
                    </motion.button>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="custom-amount">
                    Or enter custom amount (₹)
                  </label>
                  <input
                    id="custom-amount"
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="e.g. 750"
                    value={custom}
                    onChange={(e) => {
                      setCustom(e.target.value);
                      setAmount(null);
                    }}
                  />
                </div>
              </div>

              {/* Purpose */}
              <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: "1.05rem", marginBottom: "1.25rem", color: "var(--stone-800)" }}>Purpose</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  {DONATION_PURPOSES.map((p) => (
                    <motion.button
                      key={p}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setPurpose(p)}
                      style={{
                        padding: "0.5rem 1.1rem",
                        borderRadius: "var(--radius-full)",
                        border: "1.5px solid",
                        borderColor: purpose === p ? "var(--saffron-500)" : "var(--cream-300)",
                        background: purpose === p ? "var(--saffron-50)" : "white",
                        color: purpose === p ? "var(--saffron-700)" : "var(--stone-600)",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {p}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Donor info */}
              <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", border: "1px solid var(--cream-200)", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <h3 style={{ fontSize: "1.05rem", color: "var(--stone-800)" }}>Your Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="donor-name">Name *</label>
                    <input id="donor-name" required className="form-input" placeholder="Full name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="donor-phone">Phone *</label>
                    <input id="donor-phone" required type="tel" className="form-input" placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="donor-email">Email *</label>
                  <input id="donor-email" required type="email" className="form-input" placeholder="your@email.com" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="donor-pan">PAN (for 80G tax receipt)</label>
                  <input id="donor-pan" className="form-input" placeholder="ABCDE1234F" />
                </div>
              </div>

              {/* Summary + submit */}
              <div style={{ background: "var(--saffron-50)", borderRadius: "var(--radius-xl)", padding: "1.75rem", border: "1.5px solid var(--saffron-200)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "var(--stone-500)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Donation Summary</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--stone-700)", marginTop: "0.2rem", fontWeight: 500 }}>
                      {purpose} • {frequency === "monthly" ? "Monthly Support" : "One-time Gift"}
                    </div>
                  </div>
                  <div style={{ fontSize: "2.2rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--saffron-600)" }}>
                    ₹{finalAmount ? finalAmount.toLocaleString("en-IN") : "—"}
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: "100%", justifyContent: "center", fontSize: "1.05rem" }}
                    disabled={!finalAmount || loading}
                  >
                    {loading ? "Processing..." : "💳 Proceed to Payment (Razorpay)"}
                  </button>
                </motion.div>

                <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--stone-500)", marginTop: "0.85rem", marginInline: "auto" }}>
                  🔒 Secured by Razorpay • 80G Tax Exemption • Instant Receipt
                </p>
              </div>
            </form>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
