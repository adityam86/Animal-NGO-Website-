"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface HoverCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  lift?: number;
  scale?: number;
  className?: string;
}

export default function HoverCard({
  children,
  lift = 6,
  scale = 1.01,
  className,
  style,
  ...props
}: HoverCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -lift,
        scale,
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.98 }}
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
