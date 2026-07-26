"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Exposure level — a segmented arc-free meter reading from four
 * bands. Fills to the score when `reveal` is true. Uses the warm
 * warning tone at elevated/high levels, never fluorescent.
 */
const BANDS = ["Low", "Moderate", "Elevated", "High"] as const;

export function ExposureMeter({
  score,
  reveal,
  tone = "scan",
}: {
  score: number; // 0–100
  reveal: boolean;
  tone?: "scan" | "light";
}) {
  const reduced = useReducedMotion();
  const dark = tone === "scan";
  const bandIndex = Math.min(3, Math.floor(score / 25));
  const label = BANDS[bandIndex]!;
  const shown = reveal || reduced;

  const activeColor =
    bandIndex >= 3
      ? dark
        ? "bg-crit-bright"
        : "bg-crit"
      : bandIndex >= 2
        ? dark
          ? "bg-warn-bright"
          : "bg-warn"
        : dark
          ? "bg-accent-bright"
          : "bg-accent";

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span
          className={cn(
            "text-2xs",
            dark ? "text-scan-faint" : "text-ink-soft"
          )}
        >
          Exposure level
        </span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: shown ? 1 : 0 }}
          className={cn(
            "text-sm font-medium",
            bandIndex >= 2
              ? dark
                ? "text-warn-bright"
                : "text-warn"
              : dark
                ? "text-scan-ink"
                : "text-ink"
          )}
        >
          {label}
        </motion.span>
      </div>
      <div className="mt-2 flex gap-1">
        {BANDS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 overflow-hidden rounded-full",
              dark ? "bg-scan-high" : "bg-mineral-deep"
            )}
          >
            <motion.div
              className={cn("h-full rounded-full", activeColor)}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: shown && i <= bandIndex ? 1 : 0 }}
              transition={{
                duration: reduced ? 0 : 0.4,
                delay: reduced ? 0 : 0.2 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ originX: 0 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
