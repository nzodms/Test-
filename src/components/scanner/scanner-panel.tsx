"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import type { Platform } from "@/lib/validation";
import { useScanController } from "@/lib/scan/use-scan-controller";
import { scanTotals, sourceCoverage } from "@/lib/demo/scan-data";
import { copy } from "@/config/product";
import { ScanInstrument } from "./scan-instrument";
import { ScanReport } from "./scan-report";
import { MobileReportBar } from "./mobile-report-bar";

/* Choreography windows (ms) — mirrored from lib/scan/timeline.ts */
const SOURCES_START = 1720;
const SOURCES_STEP = 260;
const COUNT_START = 3000;
const COUNT_END = 7600;

function span(elapsed: number, from: number, to: number): number {
  return Math.max(0, Math.min(1, (elapsed - from) / (to - from)));
}

/**
 * Orchestrates the two states of a scan.
 *
 * While the scan runs, a dark instrument shows the work. When it
 * finishes, the instrument retracts and the findings resolve into an
 * editorial report on the light surface. The dark panel is never the
 * destination — it is the sound of the machine working.
 */
export function ScannerPanel({
  username,
  platform,
  onEdit,
}: {
  username: string;
  platform: Platform | null;
  onEdit: () => void;
}) {
  const scan = useScanController(username);
  const { elapsed, events, phase, isRunning, isLocked } = scan;

  const openedSources = Math.min(
    sourceCoverage.length,
    Math.max(0, Math.floor((elapsed - SOURCES_START) / SOURCES_STEP) + 1)
  );
  const countProgress = span(elapsed, COUNT_START, COUNT_END);

  return (
    <div>
      {/* The choreography is decorative; this carries the meaning. */}
      <p className="sr-only" role="status" aria-live="polite">
        {copy.scanner.statusByPhase[phase]}
        {isLocked
          ? ` — ${copy.lock.summary(scanTotals.matches, scanTotals.sources)} ${copy.lock.action}`
          : ""}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {!isLocked ? (
          <ScanInstrument
            key="instrument"
            username={username}
            platform={platform}
            phase={phase}
            events={events}
            running={isRunning}
            countProgress={countProgress}
            sources={sourceCoverage}
            openedSources={openedSources}
            onSkip={scan.skip}
          />
        ) : (
          <ScanReport
            key="report"
            username={username}
            platform={platform}
            onReplay={scan.replay}
            onNewSearch={onEdit}
          />
        )}
      </AnimatePresence>

      {/* Phones get a persistent way into the next step once the
          report exists, without a floating card in the flow. */}
      <MobileReportBar visible={isLocked} />
    </div>
  );
}
