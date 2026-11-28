"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { shouldBypassImageOptimization } from "@/lib/image-url";
import { Clock, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
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
  const shouldReduceMotion = useReducedMotion();

  return (
    <HoverCard
      lift={3}
      scale={1}
      style={{ width: "100%", height: "100%" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <article
        className="card"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: "var(--radius-md)",
          border: isHovered ? "1px solid var(--cream-300)" : "1px solid var(--cream-200)",
          boxShadow: isHovered ? "0 14px 30px rgba(24, 34, 24, 0.08)" : "0 1px 4px rgba(24, 34, 24, 0.04)",
          transition: "border-color 0.25s ease, box-shadow 0.25s ease",
        }}
      >
        <Link
          href={`/stories/${slug}`}
          style={{
            position: "relative",
            aspectRatio: "16 / 10",
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
              src={coverImage}
              alt={`${animal} rescue story: ${title}`}
              fill
              unoptimized={shouldBypassImageOptimization(coverImage)}
              style={{ objectFit: "cover", objectPosition: "center 35%" }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </motion.div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(16, 26, 20, 0.72) 0%, transparent 55%)",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              position: "absolute",
              bottom: "0.85rem",
              left: "0.85rem",
              padding: "0.24rem 0.6rem",
              background: "hsl(152, 34%, 22%)",
              color: "#FFFFFF",
              borderRadius: "3px",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {outcome}
          </span>
        </Link>

        <div
          style={{
            padding: "1.35rem",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                marginBottom: "0.75rem",
                fontSize: "0.75rem",
                color: "var(--stone-400)",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--saffron-600)",
                }}
              >
                {animal}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <Clock size={12} aria-hidden="true" />
                <span>{readTime}</span>
                {date ? ` · ${date}` : ""}
              </span>
            </div>

            <h3
              style={{
                fontSize: "1.22rem",
                marginBottom: "0.4rem",
                color: "var(--stone-800)",
                fontFamily: "var(--font-fraunces), Georgia, serif",
                lineHeight: 1.28,
              }}
            >
              <Link href={`/stories/${slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                {title}
              </Link>
            </h3>
            <p style={{ fontSize: "0.84rem", color: "var(--stone-500)", marginBottom: "0.6rem", fontStyle: "italic" }}>
              {subtitle}
            </p>
            <p style={{ fontSize: "0.88rem", color: "var(--stone-600)", lineHeight: 1.65, margin: 0 }}>
              {excerpt.length > 135 ? `${excerpt.slice(0, 135).trimEnd()}…` : excerpt}
            </p>
          </div>

          <Link
            href={`/stories/${slug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: isHovered ? "0.55rem" : "0.35rem",
              color: "var(--saffron-600)",
              fontWeight: 600,
              fontSize: "0.85rem",
              textDecoration: "none",
              transition: "gap 0.2s ease",
              paddingTop: "0.5rem",
              borderTop: "1px solid var(--cream-200)",
            }}
          >
            Read Rescue Chronicle <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </article>
    </HoverCard>
  );
}
