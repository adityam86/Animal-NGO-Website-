"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PulseBeacon from "@/components/motion/PulseBeacon";

export default function EmergencyFAB() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hide-desktop"
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 999,
          }}
        >
          <Link
            href="/rescue"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.85rem 1.3rem",
              background: "hsl(0, 80%, 50%)",
              color: "white",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
              boxShadow: "0 8px 24px hsla(0, 80%, 50%, 0.45)",
            }}
            aria-label="Report an animal emergency"
          >
            <PulseBeacon color="#ffffff" size={8} pulseScale={2.6} />
            <span>🚨 Report Animal</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
