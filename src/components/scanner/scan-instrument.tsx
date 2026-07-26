"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SkipForward } from "lucide-react";
import type { ScanEvent, ScanPhase, SourceCoverage } from "@/lib/scan/types";
import { CountUp } from "@/components/motion/count-up";
import { counterSequences } from "@/lib/demo/scan-data";
import { copy } from "@/config/product";
import { motionTokens } from "@/lib/motion";
import { platformLabels, type Platform } from "@/lib/validation";
import { cn } from "@/lib/utils";

/**
 * The instrument — visible only while the scan is working.
 *
 * It is deliberately narrow in what it shows: the operations it is
 * carrying out, and the count those operations are producing. No
 * columns of cards, no chart, no summary panel — the report that
 * follows carries all of that on the light surface.
 *
 * Everything here is temporary. It exists to make the work visible
 * for about ten seconds, then it retracts.
 */
/** Phones show a shorter tail of the log than wide screens. */
const LOG_LINES = 5;

export function ScanInstrument({
  username,
  platform,
  phase,
  events,
  running,
  countProgress,
  sources,
  openedSources,
  onSkip,
}: {
  username: string;
  platform: Platform | null;
  phase: ScanPhase;
  events: ScanEvent[];
  running: boolean;
  countProgress: number;
  sources: SourceCoverage[];
  openedSources: number;
  onSkip: () => void;
}) {
  const reduced = useReducedMotion();
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = listRef.current;
    if (!el || reduced) return;
    el.scrollTop = el.scrollHeight;
  }, [events.length, reduced]);

  // Only the most recent operations stay on screen: this is a live
  // instrument, not a transcript.
  const visible = events.slice(-LOG_LINES);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={
        reduced
          ? undefined
          : { opacity: 0, scale: 0.985, filter: "blur(6px)" }
      }
      transition={{
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.enter,
      }}
      className="surface-scanner scanner-reflection overflow-hidden rounded-xl"
    >
      {/* Session line. On a phone the identity and the status stack
          rather than wrapping into a ragged row, and the skip control
          shrinks to its icon. */}
      <div className="flex items-start gap-3 border-b border-scan-edge px-5 py-4 sm:items-center sm:px-8 sm:py-5">
        <span className="relative mt-1.5 flex size-2 shrink-0 items-center justify-center sm:mt-0">
          <span className="absolute size-2 animate-pulse-quiet rounded-full bg-accent-bright/40" />
          <span className="size-1.5 rounded-full bg-accent-bright" />
        </span>

        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
          <p className="min-w-0 truncate text-[15px] text-scan-ink">
            <span className="font-mono">@{username}</span>
            {platform ? (
              <span className="ml-2.5 text-scan-soft">
                {platformLabels[platform]}
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-[15px] text-scan-soft sm:mt-0">
            {copy.scanner.statusByPhase[phase]}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-[13px] text-scan-faint lg:inline">
            {copy.landing.demoNotice}
          </span>
          {running ? (
            <button
              type="button"
              onClick={onSkip}
              aria-label={copy.scanner.skip}
              className="inline-flex h-9 items-center gap-2 rounded-sm px-2.5 text-[14px] text-scan-soft transition-colors hover:bg-scan-high hover:text-scan-ink sm:px-3"
            >
              <SkipForward className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">{copy.scanner.skip}</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Working area — operations lead, the count follows */}
      <div className="grid gap-10 px-5 py-7 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
        <div
          ref={listRef}
          className="scrollbar-quiet-dark overflow-hidden sm:min-h-[196px]"
        >
          <ul className="space-y-0.5">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((e, i) => {
                const isLast = i === visible.length - 1;
                return (
                  <motion.li
                    key={e.id}
                    layout={!reduced}
                    initial={reduced ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: isLast && running ? 1 : 0.55, x: 0 }}
                    exit={reduced ? undefined : { opacity: 0 }}
                    transition={{
                      duration: motionTokens.duration.fast,
                      ease: motionTokens.ease.enter,
                    }}
                    className="flex items-baseline gap-4 py-1.5"
                  >
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-[15px]",
                        isLast && running
                          ? "text-scan-ink"
                          : "text-scan-soft"
                      )}
                    >
                      {e.label}
                    </span>
                    <span className="shrink-0 font-mono text-[13px] tabular text-scan-faint">
                      {formatOffset(e.at)}
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>

        <div className="flex flex-col justify-between gap-8">
          <div>
            <p className="text-display text-[54px] leading-none text-scan-ink">
              {countProgress > 0 ? (
                <CountUp
                  sequence={counterSequences.matches}
                  progress={countProgress}
                />
              ) : (
                <span className="text-[28px] text-scan-faint">&mdash;</span>
              )}
            </p>
            <p className="mt-2 text-[15px] text-scan-soft">
              potential matches
            </p>
          </div>

          <ul className="space-y-2">
            {sources.map((s, i) => {
              const opened = i < openedSources;
              return (
                <li
                  key={s.kind}
                  className={cn(
                    "flex items-baseline justify-between gap-4 text-[14px] transition-colors duration-500",
                    opened ? "text-scan-soft" : "text-scan-faint"
                  )}
                >
                  <span className="truncate">{s.label}</span>
                  <span className="shrink-0 font-mono tabular">
                    {opened ? s.count : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

/** ms offset → "0:03.1" — a scan clock, not a wall clock. */
function formatOffset(ms: number): string {
  return `0:${(ms / 1000).toFixed(1).padStart(4, "0")}`;
}
