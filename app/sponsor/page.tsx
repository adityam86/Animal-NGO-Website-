"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import FadeIn from "@/components/motion/FadeIn";

type Animal = { id: string; name: string; type: string; image: string };

interface RazorpayResponse {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void> | void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
}

interface RazorpayInstance {
  on: (event: string, cb: () => void) => void;
  open: () => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

function SponsorForm() {
  const searchParams = useSearchParams();
  const preselectedAnimalId = searchParams.get("animal") || "";
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [manualAnimalId, setManualAnimalId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    sponsorshipId: string;
    paymentId: string;
    tier: string;
    amount: number;
    frequency: string;
    sponsorName: string;
  } | null>(null);
  const selectedAnimal = manualAnimalId !== null ? manualAnimalId : preselectedAnimalId;

  useEffect(() => {
    fetch("/api/animals")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.animals || [];
        setAnimals(list);
      })
      .catch((err) => console.error("Failed to load animals for sponsor:", err));
  }, []);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window !== "undefined" && (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      sponsorName: String(formData.get("sponsorName") || "").trim(),
      sponsorPhone: String(formData.get("sponsorPhone") || "").trim(),
      sponsorEmail: String(formData.get("sponsorEmail") || "").trim(),
      animalId: formData.get("animalId") || null,
      tier: String(formData.get("tier") || "Food - 500"),
      frequency: String(formData.get("frequency") || "Monthly"),
    };

    try {
      // 1. Create pending sponsorship record (amount computed server-side)
      const res = await fetch("/api/sponsorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to initiate sponsorship");

      // 2. Create server-bound order using sponsorship ID
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordType: "sponsorship", recordId: result.sponsorship.id }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || "Failed to create order");

      const completeVerification = async (paymentParams: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...paymentParams,
            sponsorshipId: result.sponsorship.id,
          }),
        });
        const verifyResult = await verifyRes.json();
        if (!verifyRes.ok || !verifyResult.verified) {
          throw new Error(verifyResult.error || "Payment verification failed.");
        }
        setReceipt({
          sponsorshipId: result.sponsorship.id,
          paymentId: verifyResult.paymentId || paymentParams.razorpay_payment_id,
          tier: result.sponsorship.tier,
          amount: result.sponsorship.amount,
          frequency: result.sponsorship.frequency,
          sponsorName: data.sponsorName,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      };

      // 3. Explicit Non-Production Demo Mode Only (rejected in production)
      if (order.isMock) {
        await completeVerification({
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "sig_mock_demo",
        });
        return;
      }

      // 4. Load Live Razorpay Checkout
      const resScript = await loadRazorpayScript();
      if (!resScript) {
        setErrorMsg("Razorpay Checkout SDK could not be loaded. Please check your connection.");
        return;
      }

      const RazorpayClass = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
      if (!RazorpayClass) {
        setErrorMsg("Payment gateway is temporarily unavailable.");
        return;
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: "Ayudar Animal Welfare",
        description: `Sponsorship: ${data.tier}`,
        order_id: order.id,
        handler: async (response: RazorpayResponse) => {
          try {
            await completeVerification({
              razorpay_order_id: response.razorpay_order_id || order.id,
              razorpay_payment_id: response.razorpay_payment_id || "",
              razorpay_signature: response.razorpay_signature || "",
            });
          } catch (verifyErr) {
            setErrorMsg(
              verifyErr instanceof Error
                ? verifyErr.message
                : "Could not verify sponsorship payment signature."
            );
          }
        },
        prefill: {
          name: data.sponsorName,
          email: data.sponsorEmail,
          contact: data.sponsorPhone,
        },
        theme: {
          color: "#15803d",
        },
      };

      const rzp = new RazorpayClass(options);
      rzp.on("payment.failed", () => {
        setErrorMsg("Payment failed or was cancelled. Sponsorship was not activated.");
      });
      rzp.open();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (receipt) {
    return (
      <FadeIn direction="up" distance={20}>
        <div
          style={{
            background: "white",
            padding: "2.25rem 2rem",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--cream-200)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3.25rem", marginBottom: "0.75rem" }}>🌿</div>
          <h2 style={{ color: "var(--green-700)", marginBottom: "0.5rem" }}>Sponsorship Confirmed!</h2>
          <p style={{ color: "var(--stone-600)", marginBottom: "1.5rem" }}>
            Thank you, <strong>{receipt.sponsorName}</strong>. Your verified sponsorship supports daily shelter nutrition &amp; medical care.
          </p>
          <div
            style={{
              background: "var(--cream-50)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
              border: "1px solid var(--cream-200)",
              textAlign: "left",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
            }}
          >
            <div><strong>Sponsorship ID:</strong> {receipt.sponsorshipId}</div>
            <div><strong>Payment Ref:</strong> {receipt.paymentId}</div>
            <div><strong>Plan:</strong> {receipt.tier} ({receipt.frequency})</div>
            <div><strong>Verified Amount:</strong> ₹{receipt.amount.toLocaleString("en-IN")}</div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => window.print()} className="btn btn-primary">
              Print Receipt
            </button>
            <Link href="/cow-care" className="btn btn-outline">
              Visit Gaushala Care
            </Link>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn direction="up" distance={20}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--cream-200)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Which animal would you like to sponsor?</label>
          <select
            name="animalId"
            value={selectedAnimal}
            onChange={(e) => setManualAnimalId(e.target.value)}
            className="form-select"
          >
            <option value="">General Fund (No specific animal)</option>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.type})
              </option>
            ))}
          </select>
        </div>

        <div className="responsive-grid-2">
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Sponsorship Tier</label>
            <select name="tier" required className="form-select">
              <option value="Food - 500">Food (₹500 / month)</option>
              <option value="Medical - 1000">Medical (₹1000 / month)</option>
              <option value="Care - 1500">Care (₹1500 / month)</option>
              <option value="Full Care - 3000">Full Care (₹3000 / month)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Frequency</label>
            <select name="frequency" required className="form-select">
              <option value="Monthly">Monthly Recurring</option>
              <option value="One-time">One-time Gift</option>
            </select>
          </div>
        </div>

        <hr style={{ borderTop: "1px solid var(--cream-200)", marginBlock: "0.5rem" }} />

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Your Name *</label>
          <input name="sponsorName" required className="form-input" placeholder="Full name" />
        </div>

        <div className="responsive-grid-2">
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Phone *</label>
            <input name="sponsorPhone" required type="tel" className="form-input" placeholder="+91 XXXXX XXXXX" />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Email *</label>
            <input name="sponsorEmail" required type="email" className="form-input" placeholder="your@email.com" />
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)",
              background: "hsl(0, 80%, 96%)",
              border: "1px solid hsl(0, 70%, 82%)",
              color: "hsl(0, 72%, 38%)",
              fontSize: "0.88rem",
              fontWeight: 600,
            }}
          >
            {errorMsg}
          </div>
        )}

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <button
            disabled={loading}
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", fontSize: "1.05rem" }}
          >
            {loading ? "Processing..." : "Continue to Payment"}
          </button>
        </motion.div>
      </form>
    </FadeIn>
  );
}

export default function SponsorPage() {
  return (
    <main style={{ paddingTop: "68px", minHeight: "90vh", background: "var(--cream-50)" }}>
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <FadeIn direction="up" distance={20}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div className="section-tag" style={{ background: "var(--green-100)", color: "var(--green-700)" }}>
                Sponsor
              </div>
              <h2>Sponsor an Animal</h2>
              <p style={{ marginTop: "0.5rem", color: "var(--stone-600)" }}>
                Your sponsorship directly funds food, veterinary surgery, and shelter for helpless animals.
              </p>
            </div>
          </FadeIn>

          <Suspense fallback={<div style={{ textAlign: "center", padding: "2rem", color: "var(--stone-400)" }}>Loading sponsorship form...</div>}>
            <SponsorForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
