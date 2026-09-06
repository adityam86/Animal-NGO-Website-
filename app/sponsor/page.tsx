"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import FadeIn from "@/components/motion/FadeIn";

type Animal = { id: string; name: string; type: string; image: string };

function SponsorForm() {
  const searchParams = useSearchParams();
  const preselectedAnimalId = searchParams.get("animal") || "";
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState(preselectedAnimalId);

  useEffect(() => {
    fetch("/api/animals")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.animals || [];
        setAnimals(list);
      })
      .catch((err) => console.error("Failed to load animals for sponsor:", err));
  }, []);

  useEffect(() => {
    if (preselectedAnimalId) {
      setSelectedAnimal(preselectedAnimalId);
    }
  }, [preselectedAnimalId]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      sponsorName: formData.get("sponsorName"),
      sponsorPhone: formData.get("sponsorPhone"),
      sponsorEmail: formData.get("sponsorEmail"),
      animalId: formData.get("animalId") || null,
      tier: formData.get("tier"),
      frequency: formData.get("frequency"),
    };

    try {
      // 1. Create sponsorship record
      const res = await fetch("/api/sponsorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to initiate sponsorship");

      // 2. Load Razorpay
      const resScript = await loadRazorpayScript();
      if (!resScript) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // 3. Create Order
      const tierMap: Record<string, number> = {
        "Food - 500": 500,
        "Medical - 1000": 1000,
        "Care - 1500": 1500,
        "Full Care - 3000": 3000,
      };
      const amount = tierMap[data.tier as string] || 500;

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, purpose: `Sponsorship: ${data.tier}` }),
      });
      const order = await orderRes.json();

      // 4. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
        amount: order.amount,
        currency: order.currency,
        name: "Ayudar Animal Welfare",
        description: "Sponsorship",
        order_id: order.id,
        handler: async function (response: any) {
          // 5. Verify Payment
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || order.id,
              razorpay_payment_id: response.razorpay_payment_id || "pay_mock",
              razorpay_signature: response.razorpay_signature || "sig_mock",
              sponsorshipId: result.sponsorship.id,
            }),
          });
          const verifyResult = await verifyRes.json();
          if (verifyResult.success) {
            alert("Payment Successful! Thank you for your sponsorship.");
            window.location.href = "/cow-care";
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: data.sponsorName,
          email: data.sponsorEmail,
          contact: data.sponsorPhone,
        },
        theme: {
          color: "#f97316",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function () {
        alert("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeIn direction="up" distance={20}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "2.5rem",
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
            onChange={(e) => setSelectedAnimal(e.target.value)}
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Phone *</label>
            <input name="sponsorPhone" required type="tel" className="form-input" placeholder="+91 XXXXX XXXXX" />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Email *</label>
            <input name="sponsorEmail" required type="email" className="form-input" placeholder="your@email.com" />
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <button
            disabled={loading}
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", fontSize: "1.05rem" }}
          >
            {loading ? "Processing..." : "Continue to Payment (Razorpay)"}
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
