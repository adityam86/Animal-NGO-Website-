"use client";

import { useState } from "react";
import { CalendarPlus, CheckCircle2, AlertCircle } from "lucide-react";

export default function DriveRequestForm() {
  const [coordinatorName, setCoordinatorName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [wardOrLocality, setWardOrLocality] = useState("");
  const [driveType, setDriveType] = useState<"ABC Sterilization" | "Anti-Rabies Camp" | "Deworming & Checkup">(
    "Anti-Rabies Camp"
  );
  const [estimatedAnimals, setEstimatedAnimals] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/drives/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coordinatorName,
          phone,
          email,
          wardOrLocality,
          driveType,
          estimatedAnimals: estimatedAnimals ? Number(estimatedAnimals) : null,
          notes,
        }),
      });
      const data = (await res.json()) as { success?: boolean; requestId?: string; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error || "Please check all fields and retry.");
      } else {
        setSubmittedId(data.requestId || "LOGGED");
        setCoordinatorName("");
        setPhone("");
        setEmail("");
        setWardOrLocality("");
        setEstimatedAnimals("");
        setNotes("");
      }
    } catch {
      setError("Network error while submitting ward drive request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="card card-elevated" style={{ padding: "2rem", background: "var(--green-50)", border: "1.5px solid var(--green-300)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.65rem" }}>
          <CheckCircle2 size={24} style={{ color: "var(--green-700)" }} />
          <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--green-900)" }}>Ward Camp Request Received</h3>
        </div>
        <p style={{ color: "var(--stone-700)", fontSize: "0.92rem", lineHeight: 1.65 }}>
          Thank you for organizing compassionate street-dog care in your neighborhood. Reference ID: <strong>{submittedId}</strong>. Our veterinary scheduling coordinator will call you to assess logistics.
        </p>
        <button type="button" onClick={() => setSubmittedId("")} className="btn btn-outline btn-sm">
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card card-elevated" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
        <CalendarPlus size={20} style={{ color: "var(--terracotta)" }} />
        <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Request an ABC or Vaccination Drive in Your Locality</h3>
      </div>
      <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--stone-600)", lineHeight: 1.55 }}>
        Resident welfare associations (RWAs), feeder groups, and housing colonies in Asansol, Raniganj, or Durgapur can propose a ward vaccination or ABC catch-neuter-vaccinate-return camp.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.85rem" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="drive-name">Coordinator Name *</label>
          <input id="drive-name" className="form-input" required value={coordinatorName} onChange={(e) => setCoordinatorName(e.target.value)} placeholder="Your full name" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="drive-phone">Mobile / WhatsApp *</label>
          <input id="drive-phone" className="form-input" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98..." />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="drive-email">Email *</label>
          <input id="drive-email" type="email" className="form-input" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="drive-locality">Locality / Ward *</label>
          <input id="drive-locality" className="form-input" required value={wardOrLocality} onChange={(e) => setWardOrLocality(e.target.value)} placeholder="e.g., Burnpur Ward 14 / Kumarpur" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="drive-type">Camp Focus *</label>
          <select id="drive-type" className="form-select" value={driveType} onChange={(e) => setDriveType(e.target.value as typeof driveType)}>
            <option value="Anti-Rabies Camp">Anti-Rabies Vaccination Camp (ARV)</option>
            <option value="ABC Sterilization">ABC Sterilization Drive</option>
            <option value="Deworming & Checkup">Community Deworming &amp; Checkup</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="drive-count">Approx. Community Dogs</label>
          <input id="drive-count" type="number" min={1} max={500} className="form-input" value={estimatedAnimals} onChange={(e) => setEstimatedAnimals(e.target.value)} placeholder="e.g., 15" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="drive-notes">Feeder Support &amp; Timing Notes</label>
        <textarea id="drive-notes" className="form-textarea" style={{ minHeight: 74 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Share whether local feeders can help identify friendly / unsterilized dogs..." />
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: "var(--crimson)", fontSize: "0.86rem", fontWeight: 600 }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? "Submitting Request..." : "Submit Locality Drive Request"}
        </button>
      </div>
    </form>
  );
}
