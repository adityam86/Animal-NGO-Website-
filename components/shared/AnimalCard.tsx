"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, MapPin, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { shouldBypassImageOptimization } from "@/lib/image-url";

interface AnimalCardProps {
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

export default function AnimalCard({
  id,
  name,
  type,
  breed,
  gender,
  age,
  image,
  status,
  vaccinated,
  sterilized,
  location,
}: AnimalCardProps) {
  const isAvailable = status === "Available for Adoption";
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="card"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "var(--radius-md)",
        boxShadow: isHovered
          ? "0 14px 30px rgba(24, 34, 24, 0.08)"
          : "0 1px 4px rgba(24, 34, 24, 0.04)",
        transition: "box-shadow 0.28s ease, border-color 0.28s ease",
        borderColor: isHovered ? "var(--cream-300)" : "var(--cream-200)",
      }}
    >
      {/* Portrait frame */}
      <Link
        href={`/animals/${id}`}
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          width: "100%",
          overflow: "hidden",
          display: "block",
          background: "var(--cream-200)",
        }}
      >
        <motion.div
          animate={{ scale: !shouldReduceMotion && isHovered ? 1.035 : 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", height: "100%", position: "relative" }}
        >
          <Image
            src={image}
            alt={`${name}, ${breed} ${type} at Ayudar sanctuary`}
            fill
            unoptimized={shouldBypassImageOptimization(image)}
            style={{ objectFit: "cover", objectPosition: "center 30%" }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </motion.div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(16, 26, 20, 0.45) 0%, transparent 45%)",
            pointerEvents: "none",
          }}
        />

        {/* Editorial status label */}
        <span
          style={{
            position: "absolute",
            top: "0.75rem",
            left: "0.75rem",
            padding: "0.24rem 0.6rem",
            borderRadius: "3px",
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: isAvailable ? "hsl(152, 34%, 22%)" : "hsl(12, 62%, 44%)",
            color: "#FFFFFF",
          }}
        >
          {isAvailable ? "Ready for Home" : status}
        </span>

        {/* Species label */}
        <span
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            padding: "0.24rem 0.6rem",
            borderRadius: "3px",
            fontSize: "0.68rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            background: "rgba(250, 248, 245, 0.94)",
            color: "#1B241E",
          }}
        >
          {type}
        </span>
      </Link>

      {/* Details */}
      <div
        style={{
          padding: "1.25rem 1.35rem 1.35rem",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.5rem" }}>
            <h3
              style={{
                fontSize: "1.3rem",
                marginBottom: "0.25rem",
                color: "var(--stone-800)",
                fontFamily: "var(--font-fraunces), Georgia, serif",
              }}
            >
              <Link href={`/animals/${id}`} style={{ color: "inherit", textDecoration: "none" }}>
                {name}
              </Link>
            </h3>
            <span style={{ fontSize: "0.76rem", color: "var(--stone-400)", fontWeight: 500 }}>
              {age}
            </span>
          </div>

          <p style={{ fontSize: "0.84rem", color: "var(--stone-500)", margin: "0 0 0.45rem" }}>
            {breed} · {gender}
          </p>

          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--stone-400)",
              margin: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <MapPin size={12} aria-hidden="true" />
            <span>{location}</span>
          </p>

          {(vaccinated || sterilized) && (
            <div
              style={{
                display: "flex",
                gap: "0.65rem",
                flexWrap: "wrap",
                marginTop: "0.85rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid var(--cream-200)",
              }}
            >
              {vaccinated && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    color: "var(--green-600)",
                  }}
                >
                  <Check size={12} aria-hidden="true" /> Vaccinated
                </span>
              )}
              {sterilized && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    color: "var(--green-600)",
                  }}
                >
                  <Check size={12} aria-hidden="true" /> Sterilized
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            paddingTop: "0.25rem",
          }}
        >
          <Link
            href={`/animals/${id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.84rem",
              fontWeight: 600,
              color: "var(--stone-700)",
              textDecoration: "none",
              padding: "0.45rem 0",
            }}
          >
            View Dossier <ArrowRight size={14} aria-hidden="true" />
          </Link>

          {isAvailable && (
            <Link
              href={`/adoption?animal=${id}`}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              Apply to Adopt
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}
