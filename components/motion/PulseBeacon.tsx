"use client";

import { motion } from "framer-motion";
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
  color = "hsl(0, 80%, 52%)",
  size = 10,
  pulseScale = 2.4,
  duration = 2,
  className,
  style,
}: PulseBeaconProps) {
  return (
    <span
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        ...style,
      }}
    >
      {/* Expanding pulse ring */}
      <motion.span
        animate={{
          scale: [1, pulseScale],
          opacity: [0.75, 0],
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
      {/* Solid center dot */}
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
