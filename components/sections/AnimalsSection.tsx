"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import AnimalCard from "@/components/shared/AnimalCard";

export interface HomeAnimalItem {
  id: string;
  name: string;
  type: string;
  breed: string;
  gender: string;
  age: string;
  image: string;
  status: string;
  vaccinated: boolean;
  sterilized: boolean;
  location: string;
}

interface AnimalsSectionProps {
  animals: HomeAnimalItem[];
}

export default function AnimalsSection({ animals }: AnimalsSectionProps) {
  return (
    <section
      className="section"
      aria-labelledby="adoption-section-heading"
      style={{
        background: "var(--cream-50)",
      }}
    >
      <div className="container">
        <FadeIn direction="up" distance={12}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "1.5rem",
              marginBottom: "clamp(2.25rem, 4vw, 3.25rem)",
            }}
          >
            <div>
              <span className="editorial-eyebrow" style={{ marginBottom: "0.8rem" }}>
                Adoption &amp; Sanctuary Residents
              </span>
              <h2
                id="adoption-section-heading"
                style={{
                  fontSize: "clamp(1.9rem, 3.4vw, 2.65rem)",
                  color: "var(--stone-900)",
                  margin: 0,
                  maxWidth: "24ch",
                }}
              >
                Recovered animals ready for a loving home.
              </h2>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", alignItems: "center" }}>
              <Link
                href="/animals"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--stone-700)",
                  textDecoration: "none",
                }}
              >
                Browse All Residents
              </Link>
              <Link
                href="/adoption"
                className="btn btn-primary"
                style={{ borderRadius: "var(--radius-sm)" }}
              >
                Start Adoption Application <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </FadeIn>

        {animals.length === 0 ? (
          <div
            style={{
              padding: "2.25rem",
              background: "var(--color-surface)",
              border: "1px solid var(--cream-200)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <p style={{ margin: 0, color: "var(--stone-600)", fontSize: "0.95rem" }}>
              [Admin Placeholder: No animals are currently marked &ldquo;Available for Adoption&rdquo; in the database. View permanent sanctuary residents or update animal statuses in the Admin Dashboard.]
            </p>
            <Link href="/animals" className="btn btn-outline btn-sm" style={{ borderRadius: "var(--radius-sm)" }}>
              View Sanctuary Registry
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
              gap: "1.75rem",
            }}
          >
            {animals.map((animal, idx) => (
              <FadeIn key={animal.id} delay={idx * 0.05} direction="up" distance={12}>
                <AnimalCard
                  id={animal.id}
                  name={animal.name}
                  type={animal.type}
                  breed={animal.breed}
                  gender={animal.gender}
                  age={animal.age}
                  image={animal.image}
                  status={animal.status}
                  vaccinated={animal.vaccinated}
                  sterilized={animal.sterilized}
                  location={animal.location}
                />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
