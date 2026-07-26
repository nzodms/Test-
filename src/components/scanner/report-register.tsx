"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import type { DemoMatch } from "@/lib/scan/types";
import { formatDateUTC, cn } from "@/lib/utils";

/**
 * The findings register.
 *
 * A report reads as a register, not as a grid of cards: one hairline
 * between entries, no outer frame, and visual weight that follows
 * importance rather than a uniform rhythm. High-confidence entries
 * sit heavier; low-confidence ones recede.
 *
 * Occlusion is progressive down the list. The first entries stay
 * readable so the visitor understands the shape of a finding; each
 * subsequent one is harder to resolve, so the volume is legible
 * while the detail is not usable without verification.
 */

const SOURCE_LABEL: Record<DemoMatch["sourceKind"], string> = {
  website: "Public website",
  forum: "Forum",
  mirror: "Indexed mirror",
  channel: "Public channel",
  archive: "Archived page",
};

const CONFIDENCE_LABEL: Record<DemoMatch["confidence"], string> = {
  high: "High confidence",
  medium: "Possible match",
  low: "Low confidence",
};

/** How unreadable row `i` is. Row 0 stays crisp; the tail dissolves. */
function occlusion(index: number): number {
  if (index < 2) return 0;
  return Math.min(6.5, (index - 1) * 0.85);
}

export function ReportRegister({
  matches,
  className,
}: {
  matches: DemoMatch[];
  className?: string;
}) {
  return (
    <ol className={cn("mt-1", className)}>
      {matches.map((m, i) => {
        const blur = occlusion(i);
        const high = m.confidence === "high";
        const faded = i > 6;

        return (
          <li
            key={m.id}
            className={cn(
              "group relative border-t border-edge",
              // Rhythm is not uniform: the leading entries get room,
              // the tail tightens as it recedes.
              i < 3 ? "py-6 sm:py-7" : i < 7 ? "py-5" : "py-4",
              faded && "opacity-70"
            )}
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1.5 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:gap-x-8">
              <span
                aria-hidden
                className="font-mono text-[13px] tabular text-ink-faint"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate",
                    // Weight follows importance rather than position.
                    high
                      ? "text-[17px] font-medium text-ink sm:text-[18px]"
                      : "text-[16px] text-ink"
                  )}
                >
                  {m.matchType}
                </p>

                <p
                  className="mt-1 truncate font-mono text-[13.5px] text-ink-soft"
                  style={
                    blur > 0
                      ? { filter: `blur(${blur}px)`, userSelect: "none" }
                      : undefined
                  }
                  aria-hidden={blur > 0 || undefined}
                >
                  {m.domainMasked}
                </p>

                {/* Secondary line — mobile keeps it here, desktop
                    moves it to the right column below. */}
                <p className="mt-2 text-[14px] text-ink-soft sm:hidden">
                  <span className={high ? "text-warn" : undefined}>
                    {CONFIDENCE_LABEL[m.confidence]}
                  </span>
                  <span className="px-1.5 text-ink-faint">·</span>
                  {formatDateUTC(m.detectedAt)}
                </p>
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-[14px] text-ink-soft">
                  {SOURCE_LABEL[m.sourceKind]}
                </p>
                <p className="mt-1 text-[14px]">
                  <span className={high ? "text-warn" : "text-ink-soft"}>
                    {CONFIDENCE_LABEL[m.confidence]}
                  </span>
                  <span className="px-1.5 text-ink-faint">·</span>
                  <span className="font-mono text-[13px] text-ink-soft">
                    {formatDateUTC(m.detectedAt)}
                  </span>
                </p>
              </div>
            </div>

            {/* Source category on mobile, where the right column is
                not available. */}
            <p className="mt-1 pl-[calc(1rem+1.25rem)] text-[14px] text-ink-soft sm:hidden">
              {SOURCE_LABEL[m.sourceKind]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The tail of the register: states plainly how much more exists
 * rather than rendering dozens of unreadable rows.
 */
export function RegisterTail({
  shown,
  total,
}: {
  shown: number;
  total: number;
}) {
  return (
    <div className="border-t border-edge pt-6">
      <p className="text-[15px] text-ink-soft">
        <span className="tabular font-medium text-ink">{total - shown}</span>{" "}
        further matches are held in the full report, with their exact
        sources and evidence.
      </p>
    </div>
  );
}

export { ArrowRight };
