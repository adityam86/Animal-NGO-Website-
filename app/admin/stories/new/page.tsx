"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createStory } from "../../actions";
import ImageUploader from "@/components/shared/ImageUploader";

export default function NewStoryPage() {
  const router = useRouter();
  const [coverImage, setCoverImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createStory(formData);
      router.push("/admin/stories");
    } catch (err) {
      console.error("Failed to publish story:", err);
      alert("Failed to publish story. Please check required fields.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/admin/stories"
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
          <ArrowLeft size={16} /> Back to Stories
        </Link>
        <h1>Draft New Rescue Story</h1>
        <p style={{ color: "var(--stone-500)", fontSize: "0.9rem" }}>
          Share a rescued animal&apos;s healing journey from rescue day to recovery.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--cream-200)",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <div style={{ background: "var(--cream-50)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--cream-200)" }}>
          <ImageUploader
            label="Cover Photo"
            value={coverImage}
            onChange={(url) => setCoverImage(url)}
          />
          <input type="hidden" name="coverImage" value={coverImage} />
        </div>

        <div className="responsive-grid-2">
          <div className="form-group">
            <label className="form-label">Story Title *</label>
            <input name="title" required className="form-input" placeholder="e.g. Bella's Second Chance" />
          </div>
          <div className="form-group">
            <label className="form-label">Subtitle</label>
            <input name="subtitle" className="form-input" placeholder="e.g. Rescued from railway tracks to a forever home" />
          </div>
        </div>

        <div className="responsive-grid-2">
          <div className="form-group">
            <label className="form-label">Animal Name *</label>
            <input name="animal" required className="form-input" placeholder="e.g. Bella" />
          </div>
          <div className="form-group">
            <label className="form-label">Animal Type *</label>
            <select name="animalType" required className="form-select">
              <option>Dog</option>
              <option>Cat</option>
              <option>Cow</option>
              <option>Bird</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="responsive-grid-2">
          <div className="form-group">
            <label className="form-label">Outcome Badge *</label>
            <input name="outcome" required className="form-input" defaultValue="Adopted ❤️" placeholder="e.g. Adopted ❤️, Sponsored & Thriving" />
          </div>
          <div className="form-group">
            <label className="form-label">Read Time</label>
            <input name="readTime" className="form-input" defaultValue="3 min read" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Summary Excerpt *</label>
          <textarea
            name="excerpt"
            required
            className="form-textarea"
            rows={3}
            placeholder="Brief highlight shown on the stories gallery card..."
          />
        </div>

        <div className="responsive-grid-2">
          <div className="form-group">
            <label className="form-label">Phase 1: Before / Rescue</label>
            <textarea name="phase_before" className="form-textarea" rows={2} placeholder="How and where the animal was found..." />
          </div>
          <div className="form-group">
            <label className="form-label">Phase 2: Treatment</label>
            <textarea name="phase_treatment" className="form-textarea" rows={2} placeholder="Medical procedures and shelter care..." />
          </div>
        </div>

        <div className="responsive-grid-2">
          <div className="form-group">
            <label className="form-label">Phase 3: Recovery</label>
            <textarea name="phase_recovery" className="form-textarea" rows={2} placeholder="Rehabilitation progress..." />
          </div>
          <div className="form-group">
            <label className="form-label">Phase 4: After / Happy Ending</label>
            <textarea name="phase_after" className="form-textarea" rows={2} placeholder="Current life today..." />
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Publishing..." : "Publish Story"}
          </button>
          <Link href="/admin/stories" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
