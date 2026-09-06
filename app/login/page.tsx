"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";

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

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream-50)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ position: "absolute", top: "2rem", left: "2rem" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--stone-600)", textDecoration: "none", fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Website
        </Link>
      </div>

      <div style={{ width: "100%", maxWidth: 400, background: "white", padding: "2.5rem", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", border: "1px solid var(--cream-200)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", padding: "1rem", background: "var(--saffron-50)", color: "var(--saffron-600)", borderRadius: "50%", marginBottom: "1rem" }}>
            <Lock size={28} />
          </div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Admin Access</h1>
          <p style={{ color: "var(--stone-500)", fontSize: "0.9rem" }}>Sign in to manage the Ayudar platform.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              className="form-input" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ayudar.org"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password" 
              className="form-input" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
            />
          </div>
          
          {error && <div style={{ color: "var(--red-600)", fontSize: "0.85rem", fontWeight: 600 }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Verifying..." : "Login to Dashboard"}
          </button>
        </form>
        
        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.75rem", color: "var(--stone-400)" }}>
          Demo: <strong>admin@ayudar.org</strong> / <strong>Ayudar@2026</strong>
        </div>
      </div>
    </main>
  );
}
