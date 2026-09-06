"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAnimal } from "../../actions";
import ImageUploader from "@/components/shared/ImageUploader";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewAnimalPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createAnimal(formData);
      router.push("/admin/animals");
    } catch (err) {
      console.error("Failed to save animal:", err);
      alert("Failed to save animal. Please check the inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/admin/animals"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--stone-500)",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "0.5rem",
          }}
        >
          <ArrowLeft size={16} /> Back to Animals
        </Link>
        <h1>Add New Animal</h1>
        <p style={{ color: "var(--stone-500)", fontSize: "0.9rem" }}>
          Register a newly rescued animal to the platform and public adoption gallery.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--cream-200)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Photo Upload with Live Preview */}
        <div style={{ background: "var(--cream-50)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--cream-200)" }}>
          <ImageUploader
            label="Animal Photo *"
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
          />
          <input type="hidden" name="image" value={imageUrl} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input name="name" required className="form-input" placeholder="e.g. Bruno, Bella..." />
          </div>
          <div className="form-group">
            <label className="form-label">Type *</label>
            <select name="type" required className="form-select">
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Cow">Cow</option>
              <option value="Puppy">Puppy</option>
              <option value="Kitten">Kitten</option>
              <option value="Calf">Calf</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Breed *</label>
            <input name="breed" required className="form-input" placeholder="e.g. Indian Pariah, Domestic Short Hair..." />
          </div>
          <div className="form-group">
            <label className="form-label">Gender *</label>
            <select name="gender" required className="form-select">
              <option>Male</option>
              <option>Female</option>
              <option>Unknown</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Age *</label>
            <input name="age" required className="form-input" placeholder="e.g. ~2 years, 4 months" />
          </div>
          <div className="form-group">
            <label className="form-label">Color *</label>
            <input name="color" required className="form-input" placeholder="e.g. Brown & White, Golden, Black" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Status *</label>
            <select name="status" required className="form-select">
              <option>Available for Adoption</option>
              <option>Rescued</option>
              <option>Under Treatment</option>
              <option>Recovering</option>
              <option>Sponsored</option>
              <option>Adopted</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Rescue Location *</label>
            <input name="location" required className="form-input" placeholder="e.g. Raniganj, Asansol..." />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Shelter Facility *</label>
            <input name="shelter" required className="form-input" defaultValue="Ayudar Main Shelter" placeholder="Ayudar Main Shelter" />
          </div>
          <div className="form-group">
            <label className="form-label">Rescue Date *</label>
            <input type="date" name="rescueDate" required className="form-input" defaultValue={new Date().toISOString().substring(0, 10)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "2rem", marginBlock: "0.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}>
            <input type="checkbox" name="vaccinated" defaultChecked /> Vaccinated
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}>
            <input type="checkbox" name="dewormed" defaultChecked /> Dewormed
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}>
            <input type="checkbox" name="sterilized" /> Sterilized
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Their Story / Background *</label>
          <textarea
            name="story"
            required
            className="form-textarea"
            rows={4}
            placeholder="Tell how this animal was rescued, their personality, and what kind of loving home they need..."
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Saving Animal..." : "Save Animal"}
          </button>
          <Link href="/admin/animals" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
