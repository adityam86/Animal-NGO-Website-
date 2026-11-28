"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface HoverCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  lift?: number;
  scale?: number;
  className?: string;
}

export default function HoverCard({
  children,
  lift = 3,
  scale = 1,
  className,
  style,
  ...props
}: HoverCardProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <motion.div className={className} style={style} {...props}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{
        y: -lift,
        scale,
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      }}
      className={className}
      style={{
        transformOrigin: "center center",
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
