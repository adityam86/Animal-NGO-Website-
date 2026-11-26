"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch {
      setError("Network error occurred while signing in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream-50)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", position: "relative" }}>
      <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--stone-600)", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Back to Website
        </Link>
      </div>

      <div style={{ width: "100%", maxWidth: 410, background: "white", padding: "2.25rem", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", border: "1px solid var(--cream-200)" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ display: "inline-flex", padding: "0.9rem", background: "var(--green-50)", color: "var(--green-600)", borderRadius: "50%", marginBottom: "1rem", border: "1px solid var(--green-200)" }}>
            <Lock size={26} />
          </div>
          <h1 style={{ fontSize: "1.65rem", marginBottom: "0.4rem" }}>Ayudar Command Access</h1>
          <p style={{ color: "var(--stone-500)", fontSize: "0.88rem", margin: 0 }}>
            Authorized NGO staff sign-in portal.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Staff Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="form-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@ayudar.org"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="form-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter staff password"
            />
          </div>

          {error && (
            <div
              role="alert"
              style={{
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-md)",
                background: "var(--red-100)",
                color: "var(--red-700)",
                fontSize: "0.84rem",
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Verifying Credentials..." : "Sign In to Operations Center"}
          </button>
        </form>

        <div style={{ marginTop: "1.75rem", paddingTop: "1rem", borderTop: "1px solid var(--cream-200)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", fontSize: "0.75rem", color: "var(--stone-500)" }}>
          <ShieldCheck size={14} style={{ color: "var(--green-600)" }} />
          <span>Protected by signed HttpOnly sessions & audit logging</span>
        </div>
      </div>
    </main>
  );
}
