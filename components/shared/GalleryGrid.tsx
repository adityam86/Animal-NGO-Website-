"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, MapPin, X } from "lucide-react";

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  caption: string | null;
  location: string | null;
  takenDate: string | null;
  imageUrl: string;
};

const CATEGORIES = ["All", "Rescue", "Medical Care", "Gaushala", "Adoption", "Community Drive"];

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  const filtered =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.75rem" }}>
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${active ? "btn-primary" : "btn-outline"}`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--cream-300)" }}>
          <Camera size={28} style={{ color: "var(--stone-400)", marginBottom: "0.5rem" }} />
          <p style={{ color: "var(--stone-700)", fontWeight: 600, marginBottom: "0.35rem" }}>
            No photographs uploaded for &ldquo;{selectedCategory}&rdquo; yet.
          </p>
          <p style={{ color: "var(--stone-500)", fontSize: "0.86rem", margin: 0 }}>
            Sanctuary staff can upload verified field moments directly from the Admin Gallery manager.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 290px), 1fr))", gap: "1.35rem" }}>
          {filtered.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActivePhoto(photo)}
              className="card card-elevated"
              style={{
                padding: 0,
                overflow: "hidden",
                textAlign: "left",
                cursor: "pointer",
                border: "1px solid var(--cream-200)",
                background: "var(--color-surface)",
              }}
            >
              <div style={{ position: "relative", aspectRatio: "4 / 3", width: "100%", background: "var(--cream-100)" }}>
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div style={{ padding: "1rem 1.1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <span className="badge badge-green">{photo.category}</span>
                  {photo.takenDate && <span style={{ fontSize: "0.74rem", color: "var(--stone-500)" }}>{photo.takenDate}</span>}
                </div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--stone-900)", marginBottom: "0.25rem" }}>
                  {photo.title}
                </div>
                {photo.location && (
                  <div style={{ fontSize: "0.78rem", color: "var(--stone-500)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <MapPin size={12} /> {photo.location}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
          onClick={() => setActivePhoto(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(12, 24, 18, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.25rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-surface)",
              borderRadius: "var(--radius-xl)",
              maxWidth: "760px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ position: "relative", aspectRatio: "16 / 10", background: "#0E1C16" }}>
              <Image
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                fill
                style={{ objectFit: "contain" }}
                sizes="760px"
              />
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                aria-label="Close lightbox"
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(14,28,22,0.8)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "1.25rem 1.5rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--green-700)", textTransform: "uppercase" }}>
                {activePhoto.category}{activePhoto.location ? ` · ${activePhoto.location}` : ""}
              </div>
              <h3 style={{ margin: "0.25rem 0 0.45rem" }}>{activePhoto.title}</h3>
              {activePhoto.caption && (
                <p style={{ margin: 0, color: "var(--stone-600)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                  {activePhoto.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
