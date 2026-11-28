"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { shouldBypassImageOptimization } from "@/lib/image-url";
import { MoveHorizontal } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeObjectPosition?: string;
  afterObjectPosition?: string;
  aspectRatio?: string;
  initialPosition?: number;
  className?: string;
  title?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Day 1 of Rescue",
  afterLabel = "Recovered & Happy",
  beforeObjectPosition = "center center",
  afterObjectPosition = "center center",
  aspectRatio = "16/10",
  initialPosition = 50,
  className,
  title,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div className={className} style={{ width: "100%" }}>
      {title && (
        <div style={{ marginBottom: "0.75rem" }}>
          <h3 style={{ fontSize: "1.1rem", margin: 0, color: "var(--stone-800)", fontFamily: "var(--font-fraunces), Georgia, serif" }}>{title}</h3>
        </div>
      )}

      <div
        ref={containerRef}
        role="slider"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Before and after rescue comparison slider"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio,
          overflow: "hidden",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 10px 28px rgba(16, 26, 20, 0.14)",
          cursor: isDragging ? "grabbing" : "ew-resize",
          userSelect: "none",
          touchAction: "none",
          border: "1px solid var(--cream-300)",
        }}
      >
        {/* AFTER image (Background base) */}
        <div style={{ position: "absolute", inset: 0 }}>
          <Image
            src={afterImage}
            alt={afterLabel}
            fill
            unoptimized={shouldBypassImageOptimization(afterImage)}
            style={{ objectFit: "cover", objectPosition: afterObjectPosition }}
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>

        {/* BEFORE image (Clipped overlay) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <Image
            src={beforeImage}
            alt={beforeLabel}
            fill
            unoptimized={shouldBypassImageOptimization(beforeImage)}
            style={{ objectFit: "cover", objectPosition: beforeObjectPosition }}
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>

        {/* Divider vertical bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${sliderPosition}%`,
            width: "2px",
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            boxShadow: "0 0 10px rgba(0,0,0,0.45)",
            zIndex: 10,
            transform: "translateX(-50%)",
          }}
        >
          {/* Grab Handle */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#FAF8F5",
              color: "#1B241E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(0,0,0,0.32)",
              border: "2px solid var(--saffron-500)",
              transition: isDragging ? "transform 0.1s" : "transform 0.2s ease",
            }}
          >
            <MoveHorizontal size={18} style={{ color: "var(--saffron-600)" }} />
          </div>
        </div>

        {/* BEFORE Label */}
        <div
          style={{
            position: "absolute",
            bottom: "0.9rem",
            left: "0.9rem",
            padding: "0.3rem 0.7rem",
            background: "rgba(16, 26, 20, 0.84)",
            color: "#FAF8F5",
            borderRadius: "3px",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            pointerEvents: "none",
            zIndex: 5,
            border: "1px solid rgba(255, 255, 255, 0.16)",
          }}
        >
          {beforeLabel}
        </div>

        {/* AFTER Label */}
        <div
          style={{
            position: "absolute",
            bottom: "0.9rem",
            right: "0.9rem",
            padding: "0.3rem 0.7rem",
            background: "rgba(29, 76, 54, 0.9)",
            color: "#FAF8F5",
            borderRadius: "3px",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            pointerEvents: "none",
            zIndex: 5,
            border: "1px solid rgba(255, 255, 255, 0.16)",
          }}
        >
          {afterLabel}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "0.6rem", fontSize: "0.76rem", color: "var(--stone-400)" }}>
        Drag slider or use arrow keys to compare rescue intake and recovery
      </div>
    </div>
  );
}
