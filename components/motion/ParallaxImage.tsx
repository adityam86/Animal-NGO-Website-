"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

interface ParallaxImageProps {
  children: ReactNode;
  offset?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ParallaxImage({
  children,
  offset = 32,
  className,
  style,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  return (
    <div ref={ref} className={className} style={{ position: "relative", overflow: "hidden", ...style }}>
      {prefersReduced ? (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>{children}</div>
      ) : (
        <motion.div style={{ y, width: "100%", height: "112%", position: "relative", top: "-6%" }}>
          {children}
        </motion.div>
      )}
    </div>
  );
}
