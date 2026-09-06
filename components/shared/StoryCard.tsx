"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import HoverCard from "@/components/motion/HoverCard";

interface StoryCardProps {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  readTime: string;
  coverImage: string;
  outcome: string;
  excerpt: string;
  animal: string;
}

export default function StoryCard({
  slug,
  title,
  subtitle,
  date,
  readTime,
  coverImage,
  outcome,
  excerpt,
  animal,
}: StoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <HoverCard
      lift={6}
      scale={1.015}
      style={{ maxWidth: 380, width: "100%" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div
        className="card"
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: "var(--radius-xl)",
          border: isHovered ? "1px solid var(--saffron-300)" : "1px solid var(--cream-200)",
          boxShadow: isHovered ? "0 12px 28px rgba(0,0,0,0.08)" : "0 2px 10px rgba(0,0,0,0.03)",
          transition: "border-color 0.25s, box-shadow 0.25s",
        }}
      >
        <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
          <motion.div
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%", height: "100%", position: "relative" }}
          >
            <Image src={coverImage} alt={title} fill style={{ objectFit: "cover" }} />
          </motion.div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "0.75rem",
              left: "0.75rem",
              padding: "0.25rem 0.75rem",
              background: "var(--green-500)",
              color: "white",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {outcome}
          </div>
        </div>

        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <span className="badge badge-saffron" style={{ fontSize: "0.72rem" }}>
                {animal}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--stone-400)" }}>
                <Clock size={12} /> {readTime}
              </span>
            </div>
            <h3 style={{ fontSize: "1.15rem", marginBottom: "0.35rem", color: "var(--stone-800)" }}>{title}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--stone-500)", marginBottom: "0.5rem", fontStyle: "italic" }}>{subtitle}</p>
            <p style={{ fontSize: "0.85rem", color: "var(--stone-600)", lineHeight: 1.65, marginBottom: "1rem" }}>
              {excerpt.slice(0, 120)}...
            </p>
          </div>

          <Link
            href={`/stories/${slug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: isHovered ? "0.65rem" : "0.4rem",
              color: "var(--saffron-600)",
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
              transition: "gap 0.2s ease",
            }}
          >
            Read Full Story <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </HoverCard>
  );
}
