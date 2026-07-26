"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useScanController } from "@/lib/scan/use-scan-controller";
import { caseReference } from "@/lib/case-ref";
import { scanTotals } from "@/lib/demo/scan-data";
import { motionTokens } from "@/lib/motion";
import { platformLabels, type Platform } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { Figure, ScanOperation, ScanProgress } from "./primitives";
import { ProfileSearch } from "./profile-search";
import { StagePanel } from "./stage-panels";
import { ScanReport } from "./report";

export interface ScanSession {
  username: string;
  platform: Platform | null;
  raw: string;
}

/** How wide the surface sits in each state, in px. */
const MEASURE = { search: 660, scan: 1080, report: 1080 } as const;

/**
 * The surface.
 *
 * Search, scan and report are one component tree, not three screens.
 * When a scan starts the page reorganises around it — the measure
 * widens, a progress rail appears, figures take their places — and
 * when it finishes nothing is torn down: the operations collapse, the
 * figures stay exactly where they were, and the working panel becomes
 * the readable report. That continuity is the whole point; a scan
 * that ends by replacing the page would just be a loader.
 */
export function ScanSurface({
  session,
  onScan,
  onReset,
}: {
  session: ScanSession | null;
  onScan: (username: string, platform: Platform | null, raw: string) => void;
  onReset: () => void;
}) {
  const reduced = useReducedMotion();
  const { frame, skip, replay } = useScanController(session?.username ?? null);

  const state = !session ? "search" : frame.isLocked ? "report" : "scan";
  const running = state === "scan";
  const reference = caseReference(session?.username ?? null);

  return (
    <motion.div
      initial={reduced ? false : { maxWidth: MEASURE[state] }}
      animate={reduced ? undefined : { maxWidth: MEASURE[state] }}
      style={reduced ? { maxWidth: MEASURE.report } : undefined}
      transition={{ duration: 0.62, ease: motionTokens.ease.enter }}
      className="mx-auto w-full px-5 py-12 sm:px-8 sm:py-16"
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "search" ? (
          <motion.div
            key="search"
            exit={reduced ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: motionTokens.duration.base }}
          >
            <ProfileSearch onScan={onScan} />
          </motion.div>
        ) : (
          <motion.div
            key="running"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: motionTokens.duration.base,
              ease: motionTokens.ease.enter,
            }}
          >
            {/* ── Subject line ─────────────────────────────────── */}
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
              <h1 className="text-display text-[30px] text-ink sm:text-[36px]">
                @{session!.username}
              </h1>
              {session!.platform ? (
                <p className="text-[15px] text-ink-soft">
                  {platformLabels[session!.platform]}
                </p>
              ) : null}

              <div className="flex w-full shrink-0 items-baseline justify-between gap-5 sm:ml-auto sm:w-auto sm:justify-end">
                <p className="font-mono text-[12.5px] tabular text-ink-faint">
                  {reference}
                </p>
                {running ? (
                  <button
                    type="button"
                    onClick={skip}
                    className="-mr-2 flex min-h-[44px] items-center px-2 text-[14px] text-ink-soft underline decoration-edge-strong underline-offset-[4px] transition-colors hover:text-ink sm:min-h-0 sm:py-1"
                  >
                    Skip
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={replay}
                    className="-mr-2 flex min-h-[44px] items-center gap-2 px-2 text-[14px] text-ink-soft transition-colors hover:text-ink sm:min-h-0 sm:py-1"
                  >
                    <RotateCcw className="size-3.5" aria-hidden />
                    Replay scan
                  </button>
                )}
              </div>
            </div>

            {/* ── Progress ─────────────────────────────────────── */}
            <ScanProgress
              stage={frame.stage}
              stageProgress={frame.stageProgress}
              className="mt-7 sm:mt-8"
            />

            {/* ── Figures — the same elements before and after ─── */}
            {/* items-end puts every label on one line while the lead
                figure stays visibly larger — aligning the numbers
                instead would leave the lead label stranded. */}
            <div className="mt-9 grid grid-cols-2 items-end gap-x-8 gap-y-8 sm:mt-10 sm:grid-cols-4 sm:gap-x-10">
              <div className="col-span-2 sm:col-span-1">
                <Figure
                  value={frame.matches}
                  label="potential matches"
                  pending={frame.matches === 0}
                />
              </div>
              <Figure
                size="base"
                value={frame.sources}
                label="indexed public sources"
                pending={frame.sources === 0}
              />
              <Figure
                size="base"
                value={frame.highConfidence}
                label="high confidence"
                tone="warn"
                pending={frame.highConfidence === 0}
              />
              <Figure
                size="base"
                value={bandOf(frame.exposureScore)}
                label="exposure status"
                tone="warn"
                pending={frame.exposureScore === 0}
              />
            </div>

            {/* ── The working region ───────────────────────────── */}
            <div className="mt-11 border-t border-edge pt-8 sm:mt-12">
              {running ? (
                <StagePanel
                  frame={frame}
                  username={session!.username}
                  platform={session!.platform}
                />
              ) : (
                <ScanReport onNewScan={onReset} />
              )}
            </div>

            {/* ── Operations — present only while work is happening ── */}
            <AnimatePresence>
              {running ? (
                <motion.div
                  initial={reduced ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={
                    reduced ? undefined : { opacity: 0, height: 0, marginTop: 0 }
                  }
                  transition={{
                    duration: motionTokens.duration.slow,
                    ease: motionTokens.ease.enter,
                  }}
                  className="mt-9 overflow-hidden"
                >
                  <div className="border-t border-edge pt-4">
                    {frame.events.slice(-3).map((e, i, arr) => (
                      <ScanOperation
                        key={e.id}
                        index={frame.events.length - arr.length + i + 1}
                        label={e.label}
                        value={e.value}
                        status={e.status}
                        offset={offset(e.at)}
                        current={i === arr.length - 1}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Honest about what this is, once, at hairline weight. */}
            <p
              className={cn(
                "mt-8 font-mono text-[12.5px] transition-colors duration-500",
                running ? "text-ink-soft" : "text-ink-faint"
              )}
            >
              DEMO · simulated scan over a fixed dataset of{" "}
              {scanTotals.matches} findings. No live source is contacted.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const BANDS = ["Low", "Moderate", "Elevated", "High"] as const;
function bandOf(score: number): string {
  return BANDS[Math.min(3, Math.floor(score / 25))]!;
}

/** ms → "0:03.4" — the scan clock, not the wall clock. */
function offset(ms: number): string {
  return `0:${(ms / 1000).toFixed(1).padStart(4, "0")}`;
}
