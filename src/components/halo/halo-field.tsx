import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Halo Field — the signature light motif of the interface.
 *
 * A diffuse bloom wrapped in a faint elliptical ring, slightly
 * off-center. Placed behind strategic zones only: the primary CTA,
 * a selected KPI, the active onboarding step, global search, and
 * important events. Rendered with pure CSS gradients (see the
 * `halo-field` utility in globals.css) so it costs nothing.
 */
export function HaloField({
  x = 62,
  y = 38,
  strength = 0.14,
  tone = "halo",
  drift = false,
  className,
}: {
  /** Horizontal center of the bloom, percent. */
  x?: number;
  /** Vertical center of the bloom, percent. */
  y?: number;
  /** Peak opacity of the bloom, 0–1. Keep below 0.2. */
  strength?: number;
  tone?: "halo" | "ember";
  /** Slow ambient drift — hero sections only. */
  drift?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        tone === "halo" ? "halo-field" : "halo-field-ember",
        drift && "motion-safe:animate-halo-drift",
        className
      )}
      style={
        {
          "--halo-x": `${x}%`,
          "--halo-y": `${y}%`,
          "--halo-strength": strength,
        } as React.CSSProperties
      }
    />
  );
}
