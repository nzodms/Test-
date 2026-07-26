"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ScanEvent, ScanPhase } from "@/lib/scan/types";
import { Redacted } from "./redacted";
import { counterSequences, sourceCoverage } from "@/lib/demo/scan-data";
import { CountUp } from "@/components/motion/count-up";
import { motionTokens } from "@/lib/motion";
import { platformLabels, type Platform } from "@/lib/validation";
import { cn } from "@/lib/utils";

/**
 * The scan, written into the file.
 *
 * Operations are entered as numbered record lines with their offset
 * — the file being typed up as the work happens. There is no panel
 * around this and no card: it is the page itself filling in.
 *
 * The one dark element is a thin analysis strip that appears only
 * while matching runs, and only across the width of the record. It
 * is an embedded layer, not the identity of the product.
 */
export function ScanSession({
  username,
  platform,
  phase,
  events,
  running,
  countProgress,
  openedSources,
  onSkip,
}: {
  username: string;
  platform: Platform | null;
  phase: ScanPhase;
  events: ScanEvent[];
  running: boolean;
  countProgress: number;
  openedSources: number;
  onSkip: () => void;
}) {
  const reduced = useReducedMotion();
  const analysing =
    phase === "matching" || phase === "analysis" || phase === "assembling";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_248px] lg:gap-16">
      {/* ── The record being written ─────────────────────────────── */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-report text-[30px] text-ink sm:text-[34px]">
            @{username}
          </h1>
          {platform ? (
            <span className="text-[15px] text-ink-soft">
              {platformLabels[platform]}
            </span>
          ) : null}
          {running ? (
            <button
              type="button"
              onClick={onSkip}
              className="ml-auto shrink-0 text-[14px] text-ink-soft underline decoration-edge-strong underline-offset-[3px] transition-colors hover:text-ink"
            >
              Skip
            </button>
          ) : null}
        </div>

        <ol className="mt-8">
          <AnimatePresence initial={false} mode="popLayout">
            {events.slice(-8).map((e, i, arr) => {
              const isLast = i === arr.length - 1;
              const n = events.length - arr.length + i + 1;
              return (
                <motion.li
                  key={e.id}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: motionTokens.duration.fast,
                    ease: motionTokens.ease.enter,
                  }}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 border-t border-edge py-2.5 first:border-t-0"
                >
                  <span className="font-mono text-[12.5px] tabular text-ink-faint">
                    {String(n).padStart(3, "0")}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 truncate text-[15.5px] transition-colors",
                      isLast && running ? "text-ink" : "text-ink-soft"
                    )}
                  >
                    {e.label}
                  </span>
                  <span className="font-mono text-[12.5px] tabular text-ink-faint">
                    {offset(e.at)}
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>

        {/* The embedded analysis layer — appears only while matching
            is actually running, then leaves with the phase. */}
        <AnimatePresence>
          {analysing ? (
            <motion.div
              initial={reduced ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduced ? undefined : { opacity: 0, height: 0 }}
              transition={{
                duration: motionTokens.duration.base,
                ease: motionTokens.ease.enter,
              }}
              className="mt-8 overflow-hidden"
            >
              <div className="rounded-[3px] bg-ink px-5 py-4 text-page">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[13.5px] text-page/60">
                    Comparing indexed material
                  </p>
                  <p className="font-mono text-[12.5px] tabular text-page/50">
                    {openedSources}/{sourceCoverage.length} source sets
                  </p>
                </div>
                <p className="mt-2.5 flex items-baseline gap-3 font-mono text-[14px] text-page/85">
                  <Redacted chars={7} className="!bg-page/25" />
                  <span className="text-page/40">·</span>
                  <Redacted chars={11} className="!bg-page/20" />
                  <span className="text-page/40">·</span>
                  <Redacted chars={5} className="!bg-page/25" />
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── Running tally in the margin ──────────────────────────── */}
      <div className="lg:pt-2">
        <p className="text-[14px] text-ink-soft">Potential matches</p>
        <p className="text-report mt-1 text-[52px] leading-none text-ink">
          {countProgress > 0 ? (
            <CountUp
              sequence={counterSequences.matches}
              progress={countProgress}
            />
          ) : (
            <span className="text-ink-faint">&mdash;</span>
          )}
        </p>

        <ul className="mt-8">
          {sourceCoverage.map((s, i) => {
            const opened = i < openedSources;
            return (
              <li
                key={s.kind}
                className={cn(
                  "flex items-baseline justify-between gap-4 border-t border-edge py-2.5 text-[14px] transition-colors duration-500",
                  opened ? "text-ink-soft" : "text-ink-faint"
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
  );
}

/** ms offset → "0:03.1" — the scan clock, not the wall clock. */
function offset(ms: number): string {
  return `0:${(ms / 1000).toFixed(1).padStart(4, "0")}`;
}
