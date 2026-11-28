"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

interface PulseBeaconProps {
  color?: string;
  size?: number;
  pulseScale?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

export default function PulseBeacon({
  color = "hsl(8, 68%, 48%)",
  size = 9,
  pulseScale = 2.2,
  duration = 2.2,
  className,
  style,
}: PulseBeaconProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
    >
      {!shouldReduceMotion && (
        <motion.span
          animate={{
            scale: [1, pulseScale],
            opacity: [0.65, 0],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
      )}
      <span
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
    </span>
  );
}
