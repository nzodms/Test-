"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import type { ScanEvent, ScanPhase } from "./types";
import { buildScanTimeline, SCAN_DURATION_MS } from "./timeline";

/**
 * The single scan controller. Given a username it schedules the
 * event stream on one rAF-driven clock, exposing the current phase,
 * fired events, and derived progress. Supports skip and replay, and
 * collapses to an instant complete state under reduced motion.
 *
 * Components read state from here — they never run their own timers.
 */

export interface ScanState {
  phase: ScanPhase;
  events: ScanEvent[];
  /** elapsed ms since scan start */
  elapsed: number;
  /** count of fired events, for cheap memo keys */
  firedCount: number;
  isRunning: boolean;
  isComplete: boolean; // phase === complete or locked
  isLocked: boolean; // phase === locked
}

export function useScanController(username: string | null) {
  const reduced = useReducedMotion();
  const [state, setState] = React.useState<ScanState>({
    phase: "idle",
    events: [],
    elapsed: 0,
    firedCount: 0,
    isRunning: false,
    isComplete: false,
    isLocked: false,
  });

  const rafRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number>(0);
  const timelineRef = React.useRef<ScanEvent[]>([]);
  const skipRef = React.useRef(false);

  const stop = React.useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const finishInstantly = React.useCallback((timeline: ScanEvent[]) => {
    setState({
      phase: "locked",
      events: timeline.map((e) => ({ ...e, status: e.status })),
      elapsed: SCAN_DURATION_MS,
      firedCount: timeline.length,
      isRunning: false,
      isComplete: true,
      isLocked: true,
    });
  }, []);

  const run = React.useCallback(
    (name: string) => {
      stop();
      const timeline = buildScanTimeline(name);
      timelineRef.current = timeline;
      skipRef.current = false;

      if (reduced) {
        finishInstantly(timeline);
        return;
      }

      // performance.now avoids the banned Date.now while giving a
      // monotonic clock for the animation.
      startRef.current = performance.now();
      setState({
        phase: "initializing",
        events: [],
        elapsed: 0,
        firedCount: 0,
        isRunning: true,
        isComplete: false,
        isLocked: false,
      });

      // Derived values (counters, source fills, card counts) change
      // ~10×/second at most, so quantize the clock instead of
      // re-rendering the whole scanner every frame.
      const QUANTUM = 80;
      let lastBucket = -1;

      const tick = () => {
        const elapsed = skipRef.current
          ? SCAN_DURATION_MS
          : performance.now() - startRef.current;
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

        if (!done) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [reduced, stop, finishInstantly]
  );

  const skip = React.useCallback(() => {
    if (state.phase === "idle") return;
    skipRef.current = true;
  }, [state.phase]);

  const replay = React.useCallback(() => {
    if (username) run(username);
  }, [username, run]);

  const reset = React.useCallback(() => {
    stop();
    setState({
      phase: "idle",
      events: [],
      elapsed: 0,
      firedCount: 0,
      isRunning: false,
      isComplete: false,
      isLocked: false,
    });
  }, [stop]);

  // Start / restart whenever the username changes.
  React.useEffect(() => {
    if (username) run(username);
    else reset();
    return stop;
    // run/reset are stable via useCallback deps
  }, [username, run, reset, stop]);

  return { ...state, skip, replay, reset };
}
