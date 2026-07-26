"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ScanEvent, SourceCoverage } from "@/lib/scan/types";
import { StatusIndicator } from "@/components/primitives";
import { motionTokens } from "@/lib/motion";
import { copy } from "@/config/product";
import { cn } from "@/lib/utils";

/**
 * The operations ledger — the left column of the scanner. Each
 * fired event reveals as a new register entry (mono, timestamped),
 * the way an instrument logs what it just did. Entries never
 * reorder; the newest sits at the bottom and the list scrolls.
 */
export function OperationsRegistry({
  events,
  running,
}: {
  events: ScanEvent[];
  running: boolean;
}) {
  const reduced = useReducedMotion();
  const listRef = React.useRef<HTMLDivElement>(null);

  // Keep the newest entry in view as the ledger fills.
  React.useEffect(() => {
    const el = listRef.current;
    if (!el || reduced) return;
    el.scrollTop = el.scrollHeight;
  }, [events.length, reduced]);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-baseline justify-between">
        <h3 className="text-label-scan">{copy.scanner.registryTitle}</h3>
        <span className="text-data text-scan-faint tabular">
          {String(events.length).padStart(2, "0")}
        </span>
      </div>

      <div
        ref={listRef}
        // Capped on every breakpoint: this is a live log, not a
        // document. Uncapped it grows to 26 entries and buries the
        // results underneath it on a phone.
        className="scrollbar-quiet-dark mt-3 max-h-[164px] min-h-0 flex-1 overflow-y-auto lg:max-h-[248px]"
      >
        <ul className="space-y-px">
          <AnimatePresence initial={false}>
            {events.map((e, i) => {
              const isLast = i === events.length - 1;
              return (
                <motion.li
                  key={e.id}
                  initial={reduced ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: motionTokens.duration.fast,
                    ease: motionTokens.ease.enter,
                  }}
                  className="flex items-center gap-2.5 py-[5px]"
                >
                  <StatusIndicator
                    status={
                      isLast && running
                        ? "active"
                        : e.status === "warning"
                          ? "warning"
                          : "complete"
                    }
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[12.5px] leading-4",
                      isLast && running ? "text-scan-ink" : "text-scan-soft"
                    )}
                  >
                    {e.label}
                  </span>
                  <span className="shrink-0 text-data text-[10.5px] text-scan-faint">
                    {formatOffset(e.at)}
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}

/** ms offset → "0:03.1" — a scan clock, not a wall clock. */
function formatOffset(ms: number): string {
  const s = ms / 1000;
  return `0:${s.toFixed(1).padStart(4, "0")}`;
}

/**
 * Source coverage — builds as register lines, not five marketing
 * cards. Each line reveals when its source opens, then fills in its
 * count as matching proceeds.
 */
export function SourceCoverageList({
  sources,
  openedCount,
  countProgress,
}: {
  sources: SourceCoverage[];
  /** how many source lines have opened so far */
  openedCount: number;
  /** 0–1 — how far the counts have filled */
  countProgress: number;
}) {
  const reduced = useReducedMotion();
  const total = sources.reduce((a, s) => a + s.count, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-label-scan">{copy.scanner.sourcesTitle}</h3>
        <span className="text-data text-scan-faint tabular">
          {Math.round(total * Math.min(1, countProgress))}/{total}
        </span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {sources.map((s, i) => {
          const opened = i < openedCount;
          const shown = Math.round(
            s.count * Math.min(1, Math.max(0, countProgress * 1.15 - i * 0.05))
          );
          return (
            <li key={s.kind} className="flex items-center gap-2.5">
              <motion.span
                aria-hidden
                initial={reduced ? false : { scaleX: 0 }}
                animate={{ scaleX: opened ? 1 : 0 }}
                transition={{
                  duration: motionTokens.duration.base,
                  ease: motionTokens.ease.enter,
                }}
                style={{ originX: 0 }}
                className={cn(
                  "h-px flex-none",
                  opened ? "w-3 bg-accent-bright/60" : "w-3 bg-scan-high"
                )}
              />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[12.5px] transition-colors duration-300",
                  opened ? "text-scan-soft" : "text-scan-faint"
                )}
              >
                {s.label}
              </span>
              <span
                className={cn(
                  "shrink-0 text-data tabular transition-colors duration-300",
                  opened ? "text-scan-ink" : "text-scan-faint"
                )}
              >
                {opened ? shown : "—"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
