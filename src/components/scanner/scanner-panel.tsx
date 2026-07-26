"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Platform } from "@/lib/validation";
import { useScanController } from "@/lib/scan/use-scan-controller";
import {
  activitySeries,
  counterSequences,
  exposureLevel,
  featuredMatches,
  scanTotals,
  sourceCoverage,
} from "@/lib/demo/scan-data";
import { Lock } from "lucide-react";
import { Metric } from "@/components/primitives";
import { CountUp } from "@/components/motion/count-up";
import { ActivityChart } from "./activity-chart";
import { ExposureMeter } from "./exposure-meter";
import { MatchCard, MatchCardSkeleton } from "./match-card";
import { OperationsRegistry, SourceCoverageList } from "./operations-registry";
import { SessionHeader } from "./session-header";
import { ClaimBand } from "./claim-band";
import { copy } from "@/config/product";
import { motionTokens } from "@/lib/motion";

/* Choreography windows (ms) — mirrored from lib/scan/timeline.ts */
const SOURCES_START = 1720;
const SOURCES_STEP = 260;
const MATCH_START = 3120;
const MATCH_STEP = 230;
const COUNT_START = 3000;
const COUNT_END = 7600;
const CHART_AT = 7700;
const EXPOSURE_AT = 6100;

function span(elapsed: number, from: number, to: number): number {
  return Math.max(0, Math.min(1, (elapsed - from) / (to - from)));
}

/**
 * The scanner — a black-glass instrument embedded in the porcelain
 * page. It assembles itself as the scan proceeds: operations log on
 * the left, matches building in the centre, a summary consolidating
 * on the right, and the activity chart drawing last. When the scan
 * completes, sensitive details lock while totals stay legible.
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
  const reduced = useReducedMotion();
  const scan = useScanController(username);
  const { elapsed, events, phase, isRunning, isLocked } = scan;

  const openedSources = Math.min(
    sourceCoverage.length,
    Math.max(0, Math.floor((elapsed - SOURCES_START) / SOURCES_STEP) + 1)
  );
  const visibleMatches = Math.min(
    featuredMatches.length,
    Math.max(0, Math.floor((elapsed - MATCH_START) / MATCH_STEP) + 1)
  );
  const countProgress = span(elapsed, COUNT_START, COUNT_END);
  const drawChart = elapsed >= CHART_AT;
  const revealExposure = elapsed >= EXPOSURE_AT;

  return (
    <div className="relative">
      {/* The instrument surface unfolds from the porcelain page */}
      <motion.div
        initial={reduced ? false : { opacity: 0, scaleY: 0.94, y: -8 }}
        animate={{ opacity: 1, scaleY: 1, y: 0 }}
        transition={{
          duration: motionTokens.duration.slow,
          ease: motionTokens.ease.enter,
        }}
        style={{ originY: 0 }}
        className="surface-scanner scanner-reflection overflow-hidden rounded-xl"
      >
        <SessionHeader
          username={username}
          platform={platform}
          phase={phase}
          running={isRunning}
          onEdit={onEdit}
          onSkip={scan.skip}
          onReplay={scan.replay}
        />

        {/* Live status for screen readers — the visual choreography
            is decorative, this carries the meaning. */}
        <p className="sr-only" role="status" aria-live="polite">
          {copy.scanner.statusByPhase[phase]}
          {isLocked
            ? ` — ${copy.lock.summary(scanTotals.matches, scanTotals.sources)} ${copy.lock.action}`
            : ""}
        </p>

        {/* ── Main composition ─────────────────────────────────── */}
        <div className="grid gap-px bg-scan-edge lg:grid-cols-[236px_minmax(0,1fr)_216px]">
          {/* Left — operations ledger + source coverage.
              On a phone the log drops below the results: it explains
              the work, but the findings are what the visitor came
              for. Designed order is restored from lg up. */}
          <div className="order-3 flex flex-col gap-6 bg-scan px-4 py-5 sm:px-6 lg:order-none lg:px-5">
            <OperationsRegistry events={events} running={isRunning} />
            <div className="scan-edge-fade-x h-px" aria-hidden />
            <SourceCoverageList
              sources={sourceCoverage}
              openedCount={openedSources}
              countProgress={countProgress}
            />
          </div>

          {/* Centre — potential matches */}
          <div className="order-2 bg-scan px-4 py-5 sm:px-6 lg:order-none lg:px-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-label-scan">{copy.scanner.matchesTitle}</h3>
              {/* Live discovery count while running; once locked the
                  footer line below carries the total instead, so the
                  same figure never appears twice at rest. */}
              {!isLocked ? (
                <span className="text-data tabular text-scan-faint">
                  <CountUp
                    sequence={counterSequences.matches}
                    progress={countProgress}
                  />{" "}
                  found
                </span>
              ) : null}
            </div>

            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              <AnimatePresence initial={false}>
                {featuredMatches.slice(0, visibleMatches).map((m, i) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    locked={isLocked}
                    index={i}
                  />
                ))}
              </AnimatePresence>
              {/* Slots waiting to be filled — the mosaic has shape
                  before it has content */}
              {!reduced &&
                visibleMatches < featuredMatches.length &&
                Array.from({
                  length: Math.min(2, featuredMatches.length - visibleMatches),
                }).map((_, i) => <MatchCardSkeleton key={`sk-${i}`} />)}
            </ul>

            {isLocked ? (
              <p className="mt-3 flex items-center gap-2 text-2xs text-scan-faint">
                <Lock className="size-3 shrink-0" aria-hidden />
                Showing {featuredMatches.length} of{" "}
                <span className="tabular text-scan-soft">
                  {scanTotals.matches}
                </span>{" "}
                potential matches
                <span className="text-scan-faint/60">·</span>
                domains partially masked
              </p>
            ) : null}
          </div>

          {/* Right — evolving summary */}
          <div className="order-1 flex flex-col gap-5 bg-scan px-4 py-5 sm:px-6 lg:order-none lg:px-5">
            <h3 className="text-label-scan">{copy.scanner.summaryTitle}</h3>

            <Metric
              label={copy.scanner.kpis.matches}
              emphasis
              value={
                <CountUp
                  sequence={counterSequences.matches}
                  progress={countProgress}
                />
              }
            />

            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-4">
              <Metric
                label={copy.scanner.kpis.sources}
                value={
                  <CountUp
                    sequence={counterSequences.sources}
                    progress={countProgress}
                  />
                }
              />
              <Metric
                label={copy.scanner.kpis.highConfidence}
                value={
                  <CountUp
                    sequence={counterSequences.highConfidence}
                    progress={countProgress}
                  />
                }
              />
              <Metric
                label={copy.scanner.kpis.recentActivity}
                value={
                  <CountUp
                    sequence={counterSequences.activeThisWeek}
                    progress={countProgress}
                  />
                }
              />
            </div>

            <div className="scan-edge-fade-x h-px" aria-hidden />

            <ExposureMeter
              score={exposureLevel.score}
              reveal={revealExposure}
              tone="scan"
            />

            {/* General reading stays legible — it is not sensitive. */}
            <p className="text-2xs leading-relaxed text-scan-faint">
              Concentrated on mirror and forum sources, rising over the
              last three weeks.
            </p>

            {/* Naming what verification unlocks is clearer — and more
                honest — than blurring an arbitrary sentence. */}
            {isLocked ? (
              <div className="border-t border-scan-edge pt-4">
                <p className="flex items-center gap-1.5 text-2xs text-scan-faint">
                  <Lock className="size-3 shrink-0" aria-hidden />
                  Available after verification
                </p>
                <ul className="mt-2 space-y-1">
                  {[
                    "Exact source URLs",
                    "Full match history",
                    "Preview evidence",
                    "Removal requests",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-2xs text-scan-soft"
                    >
                      <span
                        aria-hidden
                        className="h-px w-2 shrink-0 bg-scan-edge-strong"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Activity chart ───────────────────────────────────── */}
        <div className="border-t border-scan-edge bg-scan px-4 py-5 sm:px-6">
          <div className="flex items-baseline justify-between">
            <h3 className="text-label-scan">{copy.scanner.activityTitle}</h3>
            <span className="text-data text-scan-faint">8 weeks</span>
          </div>
          <div className="mt-3 h-[120px] sm:h-[132px]">
            <ActivityChart data={activitySeries} draw={drawChart} tone="scan" />
          </div>
          <div className="mt-2 flex items-center gap-4 text-2xs text-scan-faint">
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-px w-3 bg-accent-bright"
              />
              Detections
            </span>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-px w-3 border-t border-dashed border-scan-soft"
              />
              Recurrences
            </span>
          </div>
        </div>

        <ClaimBand visible={isLocked} onNewSearch={onEdit} />
      </motion.div>
    </div>
  );
}
