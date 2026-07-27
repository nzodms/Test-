"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

const BANDS = ["Low", "Moderate", "Elevated", "High"] as const;

/**
 * Exposure level — four segments, filled to the band the score
 * falls in. The warm tone appears only at elevated and above, where
 * it means something; below that the reading stays neutral.
 */
export function ExposureMeter({
  score,
  reveal = true,
  className,
}: {
  score: number;
  reveal?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const band = Math.min(3, Math.floor(score / 25));
  const label = BANDS[band]!;
  const shown = reveal || Boolean(reduced);

  const fill = band >= 3 ? "bg-crit" : band >= 2 ? "bg-warn" : "bg-graphite";
  const text = band >= 3 ? "text-crit" : band >= 2 ? "text-warn" : "text-ink";

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[15px] text-ink-soft">Exposure status</span>
        <span className={cn("text-subject text-[17px]", text)}>{label}</span>
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {BANDS.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 overflow-hidden rounded-full bg-mineral-deep"
          >
            <motion.div
              className={cn("h-full rounded-full", fill)}
              initial={reduced ? false : { scaleX: 0 }}
              animate={{ scaleX: shown && i <= band ? 1 : 0 }}
              transition={{
                duration: reduced ? 0 : 0.4,
                delay: reduced ? 0 : 0.15 + i * 0.09,
                ease: motionTokens.ease.enter,
              }}
              style={{ originX: 0 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
