"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ImageUploader from "@/components/shared/ImageUploader";
import { updateAnimal } from "@/app/admin/actions";

interface EditAnimalProps {
  animal: {
    id: string;
    name: string;
    type: string;
    breed: string;
    gender: string;
    age: string;
    color: string;
    location: string;
    status: string;
    image: string;
    vaccinated: boolean;
    dewormed: boolean;
    sterilized: boolean;
    rescueDate: string;
    shelter: string;
    story: string;
  };
}

export default function EditAnimalForm({ animal }: EditAnimalProps) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(animal.image);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateAnimal(animal.id, formData);
      router.push("/admin/animals");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save animal updates.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 820 }}>
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
        <h1>Edit {animal.name}</h1>
        <p style={{ color: "var(--stone-500)", fontSize: "0.9rem" }}>
          Update medical status, shelter placement, availability, and story details.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--color-surface)",
          padding: "1.75rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--cream-200)",
          display: "flex",
          flexDirection: "column",
          gap: "1.35rem",
        }}
      >
        <div
          style={{
            background: "var(--cream-50)",
            padding: "1.25rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--cream-200)",
          }}
        >
          <ImageUploader
            label="Animal Photo"
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
          />
          <input type="hidden" name="image" value={imageUrl} />
        </div>

        <div className="responsive-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-name">Name *</label>
            <input id="edit-name" name="name" required defaultValue={animal.name} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-type">Type *</label>
            <select id="edit-type" name="type" required defaultValue={animal.type} className="form-select">
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

        <div className="responsive-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-breed">Breed *</label>
            <input id="edit-breed" name="breed" required defaultValue={animal.breed} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-gender">Gender *</label>
            <select id="edit-gender" name="gender" required defaultValue={animal.gender} className="form-select">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
        </div>

        <div className="responsive-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-age">Age *</label>
            <input id="edit-age" name="age" required defaultValue={animal.age} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-color">Color *</label>
            <input id="edit-color" name="color" required defaultValue={animal.color} className="form-input" />
          </div>
        </div>

        <div className="responsive-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-location">Found Location *</label>
            <input id="edit-location" name="location" required defaultValue={animal.location} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-status">Status *</label>
            <select id="edit-status" name="status" required defaultValue={animal.status} className="form-select">
              <option value="Available for Adoption">Available for Adoption</option>
              <option value="Rescued">Rescued</option>
              <option value="Under Treatment">Under Treatment</option>
              <option value="Recovering">Recovering</option>
              <option value="Sponsored">Sponsored</option>
              <option value="Adopted">Adopted</option>
            </select>
          </div>
        </div>

        <div className="responsive-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-rescue-date">Rescue Date</label>
            <input
              id="edit-rescue-date"
              type="date"
              name="rescueDate"
              defaultValue={animal.rescueDate}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-shelter">Current Shelter *</label>
            <input id="edit-shelter" name="shelter" required defaultValue={animal.shelter} className="form-input" />
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", padding: "0.5rem 0" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, fontSize: "0.9rem" }}>
            <input type="checkbox" name="vaccinated" defaultChecked={animal.vaccinated} /> Vaccinated
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, fontSize: "0.9rem" }}>
            <input type="checkbox" name="dewormed" defaultChecked={animal.dewormed} /> Dewormed
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, fontSize: "0.9rem" }}>
            <input type="checkbox" name="sterilized" defaultChecked={animal.sterilized} /> Sterilized
          </label>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-story">Story &amp; Medical Notes *</label>
          <textarea id="edit-story" name="story" required rows={4} defaultValue={animal.story} className="form-textarea" />
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

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Saving Changes..." : "Save Changes"}
          </button>
          <Link href="/admin/animals" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
