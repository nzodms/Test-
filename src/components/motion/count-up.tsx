"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Counts through an irregular, scan-like sequence of checkpoints as
 * scan progress advances — not a smooth linear tween. Driven by an
 * external progress value (0–1) so it stays in lockstep with the
 * scan controller rather than running its own clock.
 */
export function CountUp({
  sequence,
  progress,
  className,
}: {
  /** ascending checkpoints, e.g. [0,4,11,27,58,96,143,187] */
  sequence: readonly number[];
  /** 0–1 scan progress for this metric's window */
  progress: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const final = sequence[sequence.length - 1] ?? 0;
  if (reduced) return <span className={className}>{final}</span>;

  const clamped = Math.max(0, Math.min(1, progress));
  // Map progress across the checkpoint list with slight easing so
  // values arrive in uneven steps, as if tied to discoveries.
  const idx = Math.min(
    sequence.length - 1,
    Math.floor(clamped * (sequence.length - 1) + 0.0001)
  );
  const value = sequence[idx] ?? final;
  return (
    <span className={className} aria-live="off">
      {value}
    </span>
  );
}
