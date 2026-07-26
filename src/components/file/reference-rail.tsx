"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The reference rail.
 *
 * A hairline running down the left margin carrying the case
 * reference and section marks. It is a document device — a printed
 * file has one, a dashboard does not — and it is what tells the eye
 * that everything to its right belongs to a single record.
 *
 * Marks are added as sections come into existence, so during a scan
 * the rail visibly grows.
 */
export interface RailMark {
  id: string;
  label: string;
  /** Marks that exist but are not yet reached read as pending. */
  state: "pending" | "active" | "done";
}

export function ReferenceRail({
  reference,
  marks,
  className,
}: {
  reference: string;
  marks: RailMark[];
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div className={cn("relative", className)} aria-hidden>
      {/* The rule itself */}
      <span className="absolute left-0 top-0 h-full w-px bg-edge" />

      <p className="pl-4 font-mono text-[12px] tracking-[0.04em] text-ink-faint">
        {reference}
      </p>

      <ul className="mt-6 space-y-5">
        {marks.map((mark, i) => (
          <motion.li
            key={mark.id}
            initial={reduced ? false : { opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: motionTokens.duration.base,
              delay: reduced ? 0 : i * 0.04,
              ease: motionTokens.ease.enter,
            }}
            className="relative pl-4"
          >
            {/* Tick on the rule */}
            <span
              className={cn(
                "absolute left-0 top-[0.55em] h-px transition-all duration-500",
                mark.state === "pending"
                  ? "w-1.5 bg-edge-strong"
                  : mark.state === "active"
                    ? "w-3 bg-accent"
                    : "w-2.5 bg-graphite"
              )}
            />
            <span
              className={cn(
                "block font-mono text-[12px] tabular transition-colors duration-500",
                mark.state === "pending" ? "text-ink-faint" : "text-ink-soft"
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={cn(
                "mt-0.5 block text-[13px] transition-colors duration-500",
                mark.state === "pending"
                  ? "text-ink-faint"
                  : mark.state === "active"
                    ? "text-ink"
                    : "text-ink-soft"
              )}
            >
              {mark.label}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
