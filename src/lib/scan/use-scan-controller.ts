"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import type { ScanFrame } from "./types";
import { PHASE_STAGE, REPORT_SECTIONS } from "./types";
import {
  SCAN_DURATION_MS,
  buildScanTimeline,
  confidenceSplitAt,
  exposureAt,
  findingsShownAt,
  matchesAt,
  phaseAt,
  reportSectionsAt,
  sourceCountsAt,
  sourcesAt,
  sourcesOpenAt,
  windowFor,
} from "./timeline";
import { exposureLevel, scanTotals, sourceCoverage } from "@/lib/demo/scan-data";

/**
 * The single scan controller.
 *
 * One rAF clock produces one frame; every counter, every stage and
 * every operation line is derived from elapsed time in one place.
 * Components read the frame — they never run timers and never
 * recompute a window.
 *
 * State is written only from inside an animation frame, never
 * synchronously in the effect body, and the clock is quantized so a
 * scan costs about twelve renders a second rather than sixty.
 */

const FINAL_FRAME_BASE = {
  phase: "locked" as const,
  stage: PHASE_STAGE.locked,
  stageProgress: 1,
  elapsed: SCAN_DURATION_MS,
  matches: scanTotals.matches,
  sources: scanTotals.sources,
  sourcesOpen: sourceCoverage.length,
  sourceCounts: sourceCoverage.map((s) => s.count),
  highConfidence: scanTotals.highConfidence,
  confidenceSplit: {
    high: scanTotals.highConfidence,
    likely: 62,
    possible: scanTotals.matches - scanTotals.highConfidence - 62,
  },
  findingsShown: 8,
  exposureScore: exposureLevel.score,
  reportSections: REPORT_SECTIONS.length,
  isRunning: false,
  isComplete: true,
  isLocked: true,
};

const IDLE_FRAME: ScanFrame = {
  phase: "idle",
  stage: -1,
  stageProgress: 0,
  elapsed: 0,
  events: [],
  matches: 0,
  sources: 0,
  sourcesOpen: 0,
  sourceCounts: sourceCoverage.map(() => 0),
  highConfidence: 0,
  confidenceSplit: { high: 0, likely: 0, possible: 0 },
  findingsShown: 0,
  exposureScore: 0,
  reportSections: 0,
  isRunning: false,
  isComplete: false,
  isLocked: false,
};

/** Derive one painted frame from the clock. */
function frameAt(elapsed: number, timeline: ScanFrame["events"]): ScanFrame {
  const done = elapsed >= SCAN_DURATION_MS;
  if (done) return { ...FINAL_FRAME_BASE, events: timeline };

  const phase = phaseAt(elapsed);
  const w = windowFor(phase)!;
  const span = w.to - w.from || 1;

  return {
    phase,
    stage: PHASE_STAGE[phase],
    stageProgress: Math.max(0, Math.min(1, (elapsed - w.from) / span)),
    elapsed,
    events: timeline.filter((e) => e.at <= elapsed),
    matches: matchesAt(elapsed),
    sources: sourcesAt(elapsed),
    sourcesOpen: sourcesOpenAt(elapsed),
    sourceCounts: sourceCountsAt(elapsed),
    highConfidence: confidenceSplitAt(elapsed).high,
    confidenceSplit: confidenceSplitAt(elapsed),
    findingsShown: findingsShownAt(elapsed),
    exposureScore: exposureAt(elapsed, exposureLevel.score),
    reportSections: reportSectionsAt(elapsed, REPORT_SECTIONS.length),
    isRunning: true,
    isComplete: phase === "complete",
    isLocked: false,
  };
}

export function useScanController(username: string | null) {
  const reduced = useReducedMotion();
  const [frame, setFrame] = React.useState<ScanFrame>(IDLE_FRAME);

  const rafRef = React.useRef<number | null>(null);
  const skipRef = React.useRef(false);

  const stop = React.useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const run = React.useCallback(
    (name: string) => {
      stop();
      const timeline = buildScanTimeline(name);
      skipRef.current = false;

      if (reduced) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          setFrame({ ...FINAL_FRAME_BASE, events: timeline });
        });
        return;
      }

      // performance.now is monotonic and unaffected by wall-clock
      // changes, unlike the banned Date.now.
      const startedAt = performance.now();
      const QUANTUM = 80;
      let lastBucket = -1;

      const tick = () => {
        const elapsed = skipRef.current
          ? SCAN_DURATION_MS
          : performance.now() - startedAt;
        const done = elapsed >= SCAN_DURATION_MS;
        const bucket = Math.floor(elapsed / QUANTUM);

        if (done || bucket !== lastBucket) {
          lastBucket = bucket;
          setFrame(frameAt(Math.min(elapsed, SCAN_DURATION_MS), timeline));
        }

        rafRef.current = done ? null : requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [reduced, stop]
  );

  const skip = React.useCallback(() => {
    skipRef.current = true;
  }, []);

  const replay = React.useCallback(() => {
    if (username) run(username);
  }, [username, run]);

  const reset = React.useCallback(() => {
    stop();
    setFrame(IDLE_FRAME);
  }, [stop]);

  /* Start / restart whenever the subject changes. The effect only
     schedules frames and tears them down; it writes no state itself. */
  React.useEffect(() => {
    if (!username) return;
    run(username);
    return stop;
  }, [username, run, stop]);

  return { frame, skip, replay, reset };
}
