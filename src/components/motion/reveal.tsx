"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion";

/**
 * Scroll-triggered reveal for editorial sequences. One-time, short
 * distance, decisive curve. Use deliberately — not on everything.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 14,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: motionTokens.duration.slow,
        delay,
        ease: motionTokens.ease.enter,
      }}
    >
      {children}
    </motion.div>
  );
}
