"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

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

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="card"
      style={{
        maxWidth: 320,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "var(--radius-xl)",
        boxShadow: isHovered
          ? "0 14px 30px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.25s ease, border-color 0.25s ease",
        borderColor: isHovered ? "var(--saffron-200)" : "var(--cream-200)",
      }}
    >
      {/* Image container */}
      <div style={{ position: "relative", height: 240, overflow: "hidden" }}>
        <motion.div
          animate={{ scale: isHovered ? 1.06 : 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", height: "100%", position: "relative" }}
        >
          <Image
            src={image}
            alt={name}
            fill
            style={{ objectFit: "cover" }}
          />
        </motion.div>

        {/* Status badge */}
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            left: "0.75rem",
            padding: "0.25rem 0.75rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.72rem",
            fontWeight: 700,
            background: isAvailable ? "var(--green-500)" : "var(--saffron-500)",
            color: "white",
            letterSpacing: "0.04em",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {isAvailable ? "Available" : status}
        </div>

        {/* Type badge */}
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            padding: "0.25rem 0.75rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.72rem",
            fontWeight: 600,
            background: "rgba(255,255,255,0.94)",
            color: "var(--stone-800)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            backdropFilter: "blur(6px)",
          }}
        >
          {type}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
        <div>
          <div style={{ marginBottom: "0.5rem" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.25rem", color: "var(--stone-800)" }}>{name}</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--stone-500)", margin: 0 }}>
              {breed} • {gender} • {age}
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--stone-400)", margin: "0.25rem 0 0" }}>
              📍 {location}
            </p>
          </div>

          {/* Health badges */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            {vaccinated && (
              <span className="badge badge-green" style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}>
                <CheckCircle size={11} /> Vaccinated
              </span>
            )}
            {sterilized && (
              <span className="badge badge-green" style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}>
                <CheckCircle size={11} /> Sterilized
              </span>
            )}
          </div>
        </div>

        {/* Actions with tactile motion */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ flex: 1 }}>
            <Link
              href={`/animals/${id}`}
              className="btn btn-outline btn-sm"
              style={{ width: "100%", justifyContent: "center" }}
            >
              View Profile
            </Link>
          </motion.div>

          {isAvailable && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ flex: 1 }}>
              <Link
                href={`/adoption?animal=${id}`}
                className="btn btn-primary btn-sm"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Adopt Me
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
