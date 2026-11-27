"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Heart,
  CheckCircle,
  Copy,
  MessageCircle,
  Printer,
  ShoppingBag,
  MapPin,
  ChevronDown,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import {
  DONATION_AMOUNTS,
  DONATION_IMPACT_MAP,
  DONATION_PURPOSES,
  URGENT_MEDICAL_CASES,
  SHELTER_WISHLIST,
  AYUDAR_LEGAL,
  CONTACT_INFO,
} from "@/lib/data";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const DONOR_FAQS = [
  {
    q: "Are donations eligible for 80G Income Tax exemption?",
    a: `Yes. ${AYUDAR_LEGAL.name} holds valid 80G approval (URN: ${AYUDAR_LEGAL.urn80G}, Dt: ${AYUDAR_LEGAL.urn80GDate}). Enter your 10-character PAN number in the form if you need an 80G exemption certificate.`,
  },
  {
    q: "How are funds allocated across rescue, shelter & operations?",
    a: "75% goes directly to veterinary treatment, ICU care, vaccinations, and daily nutrition; 15% covers shelter sanitation & utilities; and 10% fuels 24/7 ambulance rescue dispatch.",
  },
  {
    q: "Which payment modes can I use on mobile?",
    a: "Our Razorpay checkout prioritizes instant UPI apps (GPay, PhonePe, Paytm, BHIM QR) alongside debit/credit cards and netbanking.",
  },
  {
    q: "Can I donate kibble, blankets, or medical supplies directly?",
    a: `Yes! Scroll down to the In-Kind Shelter Wishlist below to order supplies or drop items off at ${CONTACT_INFO.address}.`,
  },
];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function DonatePageContent() {
  const searchParams = useSearchParams();

  const initialAmt = Number(searchParams.get("amount"));
  const initialPurpose = searchParams.get("purpose") || "General Fund";
  const initialFreq = searchParams.get("frequency") === "monthly" ? "Monthly" : "One-time";

  const [frequency, setFrequency] = useState<"One-time" | "Monthly">(initialFreq);
  const [selectedAmount, setSelectedAmount] = useState<number>(
    DONATION_AMOUNTS.includes(initialAmt) ? initialAmt : Number.isFinite(initialAmt) && initialAmt >= 100 ? initialAmt : 1500
  );
  const [customAmount, setCustomAmount] = useState<string>(
    Number.isFinite(initialAmt) && initialAmt >= 10 && !DONATION_AMOUNTS.includes(initialAmt) ? String(initialAmt) : ""
  );
  const [purpose, setPurpose] = useState(
    DONATION_PURPOSES.includes(initialPurpose) ? initialPurpose : "General Fund"
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pan, setPan] = useState("");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [receipt, setReceipt] = useState<{
    donationId: string;
    paymentId: string;
    orderId: string;
    amount: number;
    purpose: string;
    frequency: string;
  } | null>(null);
  const [serverReceiptAmount, setServerReceiptAmount] = useState<number | null>(null);

  const parsedCustom = customAmount.trim() ? Number(customAmount.trim()) : null;
  const finalAmount = parsedCustom && Number.isFinite(parsedCustom) ? parsedCustom : selectedAmount;

  const impactDescription =
    DONATION_IMPACT_MAP[finalAmount] ||
    (finalAmount >= 3500
      ? "Supports emergency trauma stabilization, vaccines & recovery feed"
      : finalAmount >= 1000
        ? "Provides multi-day shelter meals & wound medication"
        : "Contributes directly to daily street dog & cow feeding");

  const handleSelectUrgentCase = (item: (typeof URGENT_MEDICAL_CASES)[number]) => {
    setSelectedAmount(item.suggestedAmount);
    setCustomAmount(DONATION_AMOUNTS.includes(item.suggestedAmount) ? "" : String(item.suggestedAmount));
    setPurpose(DONATION_PURPOSES.includes(item.purpose) ? item.purpose : "Medical Treatment");
    const el = document.getElementById("donation-widget");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!Number.isFinite(finalAmount) || finalAmount < 10) {
      setErrorMsg("Minimum contribution is ₹10.");
      return;
    }

    setLoading(true);
    try {
      const donRes = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          purpose,
          frequency,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          pan: pan.trim().toUpperCase(),
        }),
      });
      const donData = await donRes.json();
      if (!donRes.ok) {
        throw new Error(donData.error || "Unable to register donation details.");
      }

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordType: "donation", recordId: donData.id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Unable to initiate payment order.");
      }

      const verifyAndFinalize = async (
        rzpOrderId: string,
        rzpPaymentId: string,
        rzpSignature: string
      ) => {
        const verRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: rzpOrderId,
            razorpay_payment_id: rzpPaymentId,
            razorpay_signature: rzpSignature,
            donationId: donData.id,
          }),
        });
        const verifyData = await verRes.json();
        if (!verRes.ok || !verifyData.verified) {
          throw new Error(verifyData.error || "Payment verification failed.");
        }

        const authoritativeAmount =
          typeof verifyData.amount === "number" ? verifyData.amount : null;
        setServerReceiptAmount(authoritativeAmount);
        setReceipt({
          donationId: donData.id,
          paymentId: verifyData.paymentId || rzpPaymentId,
          orderId: verifyData.orderId || rzpOrderId,
          amount: authoritativeAmount ?? finalAmount,
          purpose,
          frequency,
        });
      };

      if (orderData.isMock) {
        await verifyAndFinalize(
          orderData.id,
          `pay_mock_${Date.now()}`,
          `mock_sig_${Date.now()}`
        );
        setLoading(false);
        return;
      }

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        throw new Error("Could not load Razorpay checkout. Please check your internet connection.");
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: AYUDAR_LEGAL.name,
        description: `${frequency} Donation — ${purpose}`,
        order_id: orderData.id,
        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: phone.trim(),
        },
        theme: { color: "#1E3A2F" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyAndFinalize(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      razorpay.open();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to process donation.");
      setLoading(false);
    }
  };

  const displayedReceiptAmount = serverReceiptAmount ?? receipt?.amount ?? finalAmount;
  const shareCaption = `I just contributed ₹${displayedReceiptAmount.toLocaleString("en-IN")} to ${AYUDAR_LEGAL.name} (${AYUDAR_LEGAL.tagline}) to help rescue and care for suffering animals. Join me at https://www.ayudarindia.com/donate`;

  return (
    <main style={{ background: "var(--cream-50)", minHeight: "100vh" }}>
      {/* Split-Screen Donation Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #1E3A2F 0%, #244739 65%, #2D5645 100%)",
          color: "white",
          padding: "clamp(6.25rem, 11vw, 7.75rem) 0 clamp(3rem, 6vw, 4.5rem)",
        }}
      >
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "2.5rem", alignItems: "start" }}>
            {/* Left Trust & Tax Impact Column */}
            <FadeIn direction="up" distance={18}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  background: "rgba(224, 122, 95, 0.24)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  color: "#FFD6CC",
                  padding: "0.35rem 0.9rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                <ShieldCheck size={14} /> 80G Tax-Exempt • Verified Indian NGO
              </div>

              <h1 style={{ color: "white", fontSize: "clamp(2.1rem, 4.5vw, 3.2rem)", lineHeight: 1.12, marginBottom: "1rem" }}>
                Every rupee funds emergency surgery, daily food &amp; recovery.
              </h1>
              <p style={{ color: "rgba(250, 247, 242, 0.86)", fontSize: "1.02rem", lineHeight: 1.72, maxWidth: "52ch", marginBottom: "1.6rem" }}>
                {AYUDAR_LEGAL.mission} Whether it is ₹500 for daily kibble or sponsoring an injured cow’s ICU care, 100% of verified contributions go straight toward shelter and rescue work.
              </p>

              {/* Legal Credentials Card */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.09)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.35rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
                  gap: "0.85rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "rgba(250,247,242,0.68)", fontWeight: 700 }}>
                    80G Tax Exemption URN
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#FFE3DC" }}>{AYUDAR_LEGAL.urn80G}</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(250,247,242,0.7)" }}>Dt: {AYUDAR_LEGAL.urn80GDate}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "rgba(250,247,242,0.68)", fontWeight: 700 }}>
                    Registration No.
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "white" }}>{AYUDAR_LEGAL.regNo}</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(250,247,242,0.7)" }}>CSR: {AYUDAR_LEGAL.csrRegNo}</div>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <Link href="/sponsor" className="btn" style={{ background: "rgba(255,255,255,0.14)", color: "white", border: "1px solid rgba(255,255,255,0.28)" }}>
                  <Heart size={16} /> Sponsor a Permanent Resident →
                </Link>
                <a href="#wishlist" className="btn" style={{ background: "rgba(255,255,255,0.08)", color: "#FAF7F2" }}>
                  <ShoppingBag size={16} /> View Shelter Wishlist
                </a>
              </div>
            </FadeIn>

            {/* Right Column: Live Donation Widget OR Verified Receipt */}
            <FadeIn direction="up" delay={0.08} distance={18}>
              <div
                id="donation-widget"
                style={{
                  background: "var(--color-surface)",
                  color: "var(--stone-800)",
                  borderRadius: "var(--radius-xl)",
                  padding: "clamp(1.5rem, 3.5vw, 2.25rem)",
                  boxShadow: "var(--shadow-xl)",
                  border: "1px solid var(--cream-200)",
                }}
              >
                {receipt ? (
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "var(--green-50)",
                        color: "var(--green-700)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem",
                      }}
                    >
                      <CheckCircle size={34} />
                    </div>
                    <div className="badge badge-green" style={{ marginBottom: "0.75rem" }}>
                      Payment Verified • Thank You!
                    </div>
                    <h2 style={{ fontSize: "1.8rem", marginBottom: "0.35rem" }}>
                      ₹{displayedReceiptAmount.toLocaleString("en-IN")} Received
                    </h2>
                    <p style={{ color: "var(--stone-600)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
                      Allocated to <strong>{receipt.purpose}</strong> ({receipt.frequency})
                    </p>

                    <div
                      style={{
                        textAlign: "left",
                        background: "var(--cream-50)",
                        border: "1px solid var(--cream-200)",
                        borderRadius: "var(--radius-md)",
                        padding: "0.95rem 1.1rem",
                        fontSize: "0.82rem",
                        lineHeight: 1.75,
                        marginBottom: "1.25rem",
                      }}
                    >
                      <div><strong>Receipt ID:</strong> {receipt.donationId}</div>
                      <div><strong>Payment Ref:</strong> {receipt.paymentId}</div>
                      <div><strong>80G URN:</strong> {AYUDAR_LEGAL.urn80G} ({AYUDAR_LEGAL.urn80GDate})</div>
                    </div>

                    {/* Celebratory Shareable Social Impact Card */}
                    <div
                      style={{
                        background: "var(--green-50)",
                        border: "1px solid var(--green-200)",
                        borderRadius: "var(--radius-lg)",
                        padding: "1rem",
                        marginBottom: "1.25rem",
                      }}
                    >
                      <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--green-700)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", marginBottom: "0.4rem" }}>
                        <Sparkles size={14} /> Share Your Kindness &amp; Inspire Others
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "var(--stone-700)", marginBottom: "0.75rem" }}>
                        “I just donated ₹{displayedReceiptAmount.toLocaleString("en-IN")} to {AYUDAR_LEGAL.shortName} to bring relief to suffering animals.”
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(shareCaption)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{ gap: "0.35rem" }}
                        >
                          <MessageCircle size={14} /> Share on WhatsApp
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(shareCaption);
                            setCopiedShare(true);
                            setTimeout(() => setCopiedShare(false), 2500);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ gap: "0.35rem" }}
                        >
                          <Copy size={14} /> {copiedShare ? "Copied!" : "Copy Caption"}
                        </button>
                        <button type="button" onClick={() => window.print()} className="btn btn-outline btn-sm" style={{ gap: "0.35rem" }}>
                          <Printer size={14} /> Print Receipt
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReceipt(null);
                        setServerReceiptAmount(null);
                      }}
                      className="btn btn-terracotta btn-sm"
                    >
                      Make Another Contribution
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleDonateSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.05rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                      <h2 style={{ fontSize: "1.35rem", margin: 0 }}>Complete Donation</h2>
                      <div style={{ display: "inline-flex", background: "var(--cream-100)", padding: "0.2rem", borderRadius: "var(--radius-full)" }}>
                        {(["One-time", "Monthly"] as const).map((freq) => (
                          <button
                            key={freq}
                            type="button"
                            onClick={() => setFrequency(freq)}
                            style={{
                              padding: "0.35rem 0.85rem",
                              borderRadius: "var(--radius-full)",
                              border: "none",
                              background: frequency === freq ? "var(--green-700)" : "transparent",
                              color: frequency === freq ? "white" : "var(--stone-700)",
                              fontWeight: 700,
                              fontSize: "0.78rem",
                              cursor: "pointer",
                            }}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount Preset Buttons */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                      {DONATION_AMOUNTS.map((amt) => {
                        const active = !customAmount && selectedAmount === amt;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setSelectedAmount(amt);
                              setCustomAmount("");
                            }}
                            style={{
                              padding: "0.65rem 0.35rem",
                              borderRadius: "var(--radius-md)",
                              border: "1.5px solid",
                              borderColor: active ? "var(--terracotta)" : "var(--cream-200)",
                              background: active ? "var(--terracotta)" : "var(--cream-50)",
                              color: active ? "white" : "var(--stone-800)",
                              fontWeight: 800,
                              fontSize: "0.88rem",
                              cursor: "pointer",
                            }}
                          >
                            ₹{amt.toLocaleString("en-IN")}
                          </button>
                        );
                      })}
                    </div>

                    <div className="responsive-grid-2" style={{ gap: "0.8rem" }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="don-custom-amt">Custom Amount (₹)</label>
                        <input
                          id="don-custom-amt"
                          type="number"
                          min={10}
                          className="form-input"
                          placeholder="e.g., 2100"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="don-purpose">Allocate Towards</label>
                        <select
                          id="don-purpose"
                          className="form-select"
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                        >
                          {DONATION_PURPOSES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Live Impact Strip */}
                    <div
                      style={{
                        padding: "0.7rem 0.9rem",
                        borderRadius: "var(--radius-md)",
                        background: "var(--green-50)",
                        border: "1px solid var(--green-200)",
                        fontSize: "0.84rem",
                        color: "var(--green-700)",
                        fontWeight: 600,
                      }}
                    >
                      🐾 Impact of ₹{Number.isFinite(finalAmount) ? finalAmount.toLocaleString("en-IN") : 0}: {impactDescription}
                    </div>

                    <div className="responsive-grid-2" style={{ gap: "0.8rem" }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="don-name">Full Name *</label>
                        <input
                          id="don-name"
                          type="text"
                          required
                          className="form-input"
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="don-phone">Phone (for receipt) *</label>
                        <input
                          id="don-phone"
                          type="tel"
                          required
                          className="form-input"
                          placeholder="+91 98XXX XXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="responsive-grid-2" style={{ gap: "0.8rem" }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="don-email">Email *</label>
                        <input
                          id="don-email"
                          type="email"
                          required
                          className="form-input"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="don-pan">PAN (Optional for 80G)</label>
                        <input
                          id="don-pan"
                          type="text"
                          maxLength={10}
                          className="form-input"
                          placeholder="ABCDE1234F"
                          style={{ textTransform: "uppercase" }}
                          value={pan}
                          onChange={(e) => setPan(e.target.value.toUpperCase())}
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <div role="alert" style={{ padding: "0.8rem", borderRadius: "var(--radius-md)", background: "#FDF0F0", color: "#A62828", fontSize: "0.86rem", fontWeight: 600 }}>
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-terracotta btn-lg"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      {loading
                        ? "Opening Secure Checkout..."
                        : `Donate ₹${Number.isFinite(finalAmount) ? finalAmount.toLocaleString("en-IN") : 0} ${frequency === "Monthly" ? "/ mo " : ""}via UPI / Card`}
                    </button>
                    <p style={{ margin: 0, textAlign: "center", fontSize: "0.75rem", color: "var(--stone-500)" }}>
                      UPI (GPay / PhonePe / Paytm) • Cards • Netbanking via Razorpay
                    </p>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Urgent Medical Fundraisers Grid */}
      <section className="section">
        <div className="container">
          <FadeIn direction="up" distance={16}>
            <div style={{ marginBottom: "2rem" }}>
              <div className="section-tag" style={{ background: "#FDF0F0", color: "var(--crimson)" }}>
                Active Treatment Cases
              </div>
              <h2 style={{ marginBottom: "0.4rem" }}>Urgent Medical Fundraisers</h2>
              <p style={{ color: "var(--stone-600)", maxWidth: "56ch" }}>
                Select any injured resident below to automatically pre-fill the donation widget for their medical bill.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1.5rem" }}>
            {URGENT_MEDICAL_CASES.map((item) => {
              const pct = Math.min(100, Math.round((item.raisedInr / item.goalInr) * 100));
              return (
                <div
                  key={item.id}
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-xl)",
                    overflow: "hidden",
                    border: "1px solid var(--cream-200)",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ position: "relative", aspectRatio: "16 / 10", background: "var(--cream-100)" }}>
                    <Image src={item.image} alt={item.name} fill unoptimized sizes="(max-width: 768px) 100vw, 400px" style={{ objectFit: "cover" }} />
                    <span style={{ position: "absolute", top: 12, left: 12, background: "rgba(214,69,69,0.92)", color: "white", padding: "0.25rem 0.65rem", borderRadius: "var(--radius-full)", fontSize: "0.72rem", fontWeight: 700 }}>
                      {item.species} • {item.supporters} supporters
                    </span>
                  </div>
                  <div style={{ padding: "1.35rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ marginBottom: "0.35rem" }}>{item.name}</h3>
                    <p style={{ fontSize: "0.88rem", color: "var(--stone-600)", lineHeight: 1.6, marginBottom: "1rem", flex: 1 }}>
                      {item.summary}
                    </p>
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                        <span>₹{item.raisedInr.toLocaleString("en-IN")} raised</span>
                        <span style={{ color: "var(--stone-500)" }}>Goal: ₹{item.goalInr.toLocaleString("en-IN")}</span>
                      </div>
                      <div style={{ height: 8, background: "var(--cream-100)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "var(--terracotta)" }} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectUrgentCase(item)}
                      className="btn btn-primary btn-sm"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Contribute ₹{item.suggestedAmount.toLocaleString("en-IN")} to {item.name}’s Care
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sponsor a Permanent Resident Banner */}
      <section className="section-sm" style={{ background: "var(--green-50)", borderBlock: "1px solid var(--green-100)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          <div style={{ maxWidth: 620 }}>
            <div className="section-tag">Sponsor a Resident</div>
            <h2 style={{ marginBottom: "0.45rem" }}>Adopt from afar for ₹1,000–₹2,000 / month</h2>
            <p style={{ color: "var(--stone-700)", margin: 0, lineHeight: 1.7 }}>
              Senior dogs, injured cows, and special-needs companions stay permanently in our sanctuary. Virtual sponsors fund their monthly nutrition &amp; vet care and receive quarterly WhatsApp photo updates.
            </p>
          </div>
          <Link href="/sponsor" className="btn btn-terracotta btn-lg">
            Sponsor a Resident →
          </Link>
        </div>
      </section>

      {/* In-Kind Shelter Wishlist */}
      <section id="wishlist" className="section">
        <div className="container">
          <FadeIn direction="up" distance={16}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
              <div>
                <div className="section-tag">In-Kind Support</div>
                <h2 style={{ marginBottom: "0.35rem" }}>Shelter Needs Wishlist</h2>
                <p style={{ color: "var(--stone-600)", margin: 0 }}>
                  Prefer sending supplies instead of cash? Order essentials online or drop them directly at our Raniganj sanctuary.
                </p>
              </div>
              <a
                href={AYUDAR_LEGAL.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ gap: "0.4rem" }}
              >
                <MapPin size={15} /> Shelter Drop-Off Location <ExternalLink size={13} />
              </a>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {SHELTER_WISHLIST.map((w) => (
              <div
                key={w.item}
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.35rem",
                  border: "1px solid var(--cream-200)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                }}
              >
                <span className="badge badge-saffron" style={{ alignSelf: "flex-start" }}>
                  {w.need}
                </span>
                <h3 style={{ fontSize: "1.05rem", margin: 0 }}>{w.item}</h3>
                <p style={{ fontSize: "0.84rem", color: "var(--stone-600)", margin: 0, flex: 1 }}>{w.note}</p>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <a
                    href={`https://www.amazon.in/s?k=${encodeURIComponent(w.searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, justifyContent: "center", fontSize: "0.78rem" }}
                  >
                    Amazon
                  </a>
                  <a
                    href={`https://blinkit.com/s/?q=${encodeURIComponent(w.searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: "center", fontSize: "0.78rem" }}
                  >
                    Blinkit
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donor Trust FAQ Accordion */}
      <section className="section-sm" style={{ background: "var(--cream-100)", borderTop: "1px solid var(--cream-200)" }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <h2 style={{ textAlign: "center", marginBottom: "1.75rem" }}>Donor Trust &amp; 80G FAQs</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {DONOR_FAQS.map((faq, idx) => {
              const open = openFaqIdx === idx;
              return (
                <div
                  key={faq.q}
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--cream-200)",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(open ? null : idx)}
                    style={{
                      width: "100%",
                      padding: "1rem 1.25rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "transparent",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "var(--stone-800)",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={17} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
                  </button>
                  {open && (
                    <div style={{ padding: "0 1.25rem 1.15rem", fontSize: "0.9rem", color: "var(--stone-600)", lineHeight: 1.7 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function DonatePage() {
  return (
    <Suspense fallback={<main className="section"><div className="container">Loading donation portal...</div></main>}>
      <DonatePageContent />
    </Suspense>
  );
}
