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
const MEASURE = { search: 1000, scan: 1080, report: 1080 } as const;

/**
 * The surface.
 *
 * Search, scan and report are one component tree. When a scan starts
 * the instrument *deploys*: the same container that will hold the
 * report goes deep — progress, figures, the working panel and the
 * operations are all on it — and the page reorganises around that.
 * When the work finishes the surface comes back to the light without
 * anything unmounting, so the figures the scan produced are still in
 * exactly the same place, now readable, with the report beneath them.
 *
 * That is the whole idea: dark means Argus is working, light means
 * you are reading. Neither one is the product's identity on its own.
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
            {/* ── Subject line — stays on the light page ───────── */}
            <div className="mb-6 flex flex-wrap items-baseline gap-x-5 gap-y-1.5 sm:mb-7">
              <h1 className="text-display text-[30px] text-ink sm:text-[36px]">
                @{session!.username}
              </h1>
              {session!.platform ? (
                <p className="text-[15px] text-ink-soft">
                  {platformLabels[session!.platform]}
                </p>
              ) : null}
              <p className="ml-auto hidden font-mono text-[12.5px] tabular text-ink-faint sm:block">
                {reference}
              </p>
            </div>

            {/* ── The instrument ───────────────────────────────────
                One container, two environments. Deep while the scan
                runs, light once there is something to read. */}
            <motion.div
              layout={!reduced}
              transition={{ duration: 0.5, ease: motionTokens.ease.enter }}
              className={cn(
                "surface-shift overflow-hidden rounded-[12px]",
                running
                  ? "surface-active shadow-scanner"
                  : "surface-resting border border-edge shadow-page"
              )}
            >
              {/* Session bar — the search, become a running session */}
              <div
                className={cn(
                  "flex items-center gap-4 border-b px-5 py-3 sm:px-7",
                  running ? "border-edge" : "border-edge"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 shrink-0 rounded-full transition-colors duration-500",
                    running ? "animate-pulse-quiet bg-accent" : "bg-ok"
                  )}
                />
                <p className="font-mono text-[12.5px] tabular text-ink-soft">
                  {running ? "SCANNING" : "SCAN COMPLETE"}
                  <span className="px-2 text-ink-faint">·</span>
                  <span className="text-ink-faint sm:hidden">{reference}</span>
                  <span className="hidden text-ink-faint sm:inline">
                    {reference}
                  </span>
                </p>

                <div className="ml-auto flex shrink-0 items-center gap-1">
                  {running ? (
                    <button
                      type="button"
                      onClick={skip}
                      className="flex min-h-[40px] items-center rounded-[5px] px-3 text-[13.5px] text-ink-soft transition-colors hover:bg-mineral hover:text-ink"
                    >
                      Skip
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={replay}
                      className="flex min-h-[40px] items-center gap-2 rounded-[5px] px-3 text-[13.5px] text-ink-soft transition-colors hover:bg-mineral hover:text-ink"
                    >
                      <RotateCcw className="size-3.5" aria-hidden />
                      Replay scan
                    </button>
                  )}
                </div>
              </div>

              <div className="px-5 py-7 sm:px-7 sm:py-8">
                <ScanProgress
                  stage={frame.stage}
                  stageProgress={frame.stageProgress}
                />

                {/* The figures never move between the two states. */}
                <div className="mt-8 grid grid-cols-2 items-end gap-x-8 gap-y-8 sm:grid-cols-4 sm:gap-x-10">
                  <Figure
                    value={frame.matches}
                    label="potential matches"
                    pending={frame.matches === 0}
                  />
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

                <div className="mt-9 border-t border-edge pt-7">
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
              </div>

              {/* Operations — the work, listed only while it happens */}
              <AnimatePresence>
                {running ? (
                  <motion.div
                    initial={reduced ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduced ? undefined : { opacity: 0, height: 0 }}
                    transition={{
                      duration: motionTokens.duration.slow,
                      ease: motionTokens.ease.enter,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-edge bg-paper px-5 py-3 sm:px-7">
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
            </motion.div>

            {/* Honest about what this is, once, at hairline weight. */}
            <p className="mt-5 font-mono text-[12.5px] text-ink-faint">
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
