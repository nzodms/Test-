"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import type { ScanEvent, ScanPhase } from "./types";
import { buildScanTimeline, SCAN_DURATION_MS } from "./timeline";

/**
 * The single scan controller. Given a username it schedules the
 * event stream on one rAF-driven clock, exposing the current phase,
 * fired events and elapsed time. Supports skip and replay, and
 * collapses to an instant completed state under reduced motion.
 *
 * Components read state from here — they never run their own timers.
 *
 * Every state write happens inside an animation frame, never
 * synchronously from the effect body: the first frame produces the
 * same "initializing" state a synchronous write would, one frame
 * earlier than any human can perceive, without the cascading render
 * that setState-in-effect causes.
 */

export interface ScanState {
  phase: ScanPhase;
  events: ScanEvent[];
  /** elapsed ms since scan start */
  elapsed: number;
  /** count of fired events, for cheap memo keys */
  firedCount: number;
  isRunning: boolean;
  isComplete: boolean;
  isLocked: boolean;
}

const IDLE_STATE: ScanState = {
  phase: "idle",
  events: [],
  elapsed: 0,
  firedCount: 0,
  isRunning: false,
  isComplete: false,
  isLocked: false,
};

export function useScanController(username: string | null) {
  const reduced = useReducedMotion();
  const [state, setState] = React.useState<ScanState>(IDLE_STATE);

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
          setState({
            phase: "locked",
            events: timeline,
            elapsed: SCAN_DURATION_MS,
            firedCount: timeline.length,
            isRunning: false,
            isComplete: true,
            isLocked: true,
          });
        });
        return;
      }

      // performance.now gives a monotonic clock without the banned
      // Date.now, and is unaffected by wall-clock changes.
      const startedAt = performance.now();

      // Derived values (counters, source fills, card counts) change
      // about ten times a second at most, so quantize the clock
      // instead of re-rendering the scanner on every frame.
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
          const fired = timeline.filter((e) => e.at <= elapsed);
          const lastPhase = fired.length
            ? fired[fired.length - 1]!.phase
            : "initializing";

          setState({
            phase: done ? "locked" : lastPhase,
            events: fired,
            elapsed: Math.min(elapsed, SCAN_DURATION_MS),
            firedCount: fired.length,
            isRunning: !done,
            isComplete:
              lastPhase === "complete" || lastPhase === "locked" || done,
            isLocked: done || lastPhase === "locked",
          });
        }

        if (done) {
          rafRef.current = null;
        } else {
          rafRef.current = requestAnimationFrame(tick);
        }
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
    setState(IDLE_STATE);
  }, [stop]);

  // Start / restart whenever the username changes. The effect only
  // schedules frames and tears them down; it writes no state itself.
  React.useEffect(() => {
    if (!username) return;
    run(username);
    return stop;
  }, [username, run, stop]);

  return { ...state, skip, replay, reset };
}
