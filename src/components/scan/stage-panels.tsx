"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ActivityChart } from "@/components/scanner/activity-chart";
import { RedactedDomain, Redacted } from "@/components/file/redacted";
import { ExposureStatus, FindingRow, SourceEntry } from "./primitives";
import type { ScanFrame } from "@/lib/scan/types";
import { REPORT_SECTIONS } from "@/lib/scan/types";
import {
  activitySeries,
  featuredMatches,
  sourceCoverage,
} from "@/lib/demo/scan-data";
import { motionTokens } from "@/lib/motion";
import { platformLabels, type Platform } from "@/lib/validation";
import { formatDateUTC, cn } from "@/lib/utils";

/**
 * The working panel.
 *
 * One region of the page that shows what the scan is doing *now*.
 * It is not a loader with a percentage — each stage renders the real
 * material it is producing, and that material stays on the page
 * afterwards as part of the report.
 */
export function StagePanel({
  frame,
  username,
  platform,
}: {
  frame: ScanFrame;
  username: string;
  platform: Platform | null;
}) {
  const reduced = useReducedMotion();
  const stage = Math.max(0, frame.stage);

  return (
    <div className="min-h-[268px] sm:min-h-[300px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stage}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -6 }}
          transition={{
            duration: motionTokens.duration.base,
            ease: motionTokens.ease.enter,
          }}
        >
          {stage === 0 ? (
            <IdentityPanel
              frame={frame}
              username={username}
              platform={platform}
            />
          ) : stage === 1 ? (
            <SourcesPanel frame={frame} />
          ) : stage === 2 ? (
            <FindingsPanel frame={frame} />
          ) : stage === 3 ? (
            <ExposurePanel frame={frame} />
          ) : (
            <ReportBuildPanel frame={frame} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── 01 Identity ───────────────────────────────────────────────── */

function IdentityPanel({
  frame,
  username,
  platform,
}: {
  frame: ScanFrame;
  username: string;
  platform: Platform | null;
}) {
  const checking = frame.phase === "checking_profiles";
  const rows: Array<[string, React.ReactNode, boolean]> = [
    ["Handle", `@${username}`, true],
    [
      "Platform",
      platform ? platformLabels[platform] : "Any platform",
      frame.elapsed > 420,
    ],
    ["Public profile", "Reachable", frame.elapsed > 640],
    ["Username variants", checking ? "3 linked" : "Checking…", checking],
  ];

  return (
    <div>
      <PanelHead title="Resolving public identity" />
      <dl className="mt-5">
        {rows.map(([label, value, ready], i) => (
          <motion.div
            key={label}
            initial={false}
            animate={{ opacity: ready ? 1 : 0.35 }}
            transition={{ duration: 0.25 }}
            className="flex items-baseline justify-between gap-6 border-t border-edge py-3"
          >
            <dt className="text-[14.5px] text-ink-soft">{label}</dt>
            <dd
              className={cn(
                "text-right text-[15px]",
                ready ? "text-ink" : "text-ink-faint",
                i === 0 && "font-medium"
              )}
            >
              {value}
            </dd>
          </motion.div>
        ))}
      </dl>
    </div>
  );
}

/* ── 02 Sources ────────────────────────────────────────────────── */

function SourcesPanel({ frame }: { frame: ScanFrame }) {
  const max = Math.max(...sourceCoverage.map((s) => s.count));
  return (
    <div>
      <PanelHead
        title="Indexing public sources"
        value={`${frame.sourcesOpen} of ${sourceCoverage.length} kinds`}
      />
      <ul className="mt-5">
        {sourceCoverage.map((s, i) => (
          <SourceEntry
            key={s.kind}
            index={i}
            label={s.label}
            count={frame.sourceCounts[i] ?? 0}
            total={max}
            detected={i < frame.sourcesOpen}
          />
        ))}
      </ul>
    </div>
  );
}

/* ── 03 Findings ───────────────────────────────────────────────── */

function FindingsPanel({ frame }: { frame: ScanFrame }) {
  const reduced = useReducedMotion();
  const shown = featuredMatches.slice(0, frame.findingsShown);

  return (
    <div>
      <PanelHead
        title="Matching content"
        value={`${frame.matches} potential matches`}
      />

      {/* The one dark surface in the product: a local comparison
          instrument, the width of the panel, alive only while matching
          actually runs. */}
      <div className="mt-5 flex items-center gap-4 rounded-[6px] bg-ink px-4 py-3">
        <span className="text-[13px] text-page/55">Comparing</span>
        <span className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden">
          <Redacted chars={6} className="!bg-page/25" />
          <span className="text-page/30">·</span>
          <Redacted chars={9} className="!bg-page/20" />
          <span className="text-page/30">·</span>
          <Redacted chars={4} className="!bg-page/25" />
        </span>
        <span className="shrink-0 font-mono text-[12.5px] tabular text-page/50">
          {frame.sources} src
        </span>
      </div>

      <ul className="mt-2">
        <AnimatePresence initial={false}>
          {shown.map((m, i) => (
            <motion.div
              key={m.id}
              initial={reduced ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: motionTokens.duration.fast,
                ease: motionTokens.ease.enter,
              }}
            >
              <FindingRow
                index={i + 1}
                subject={m.matchType}
                confidence={m.confidence}
                meta={formatDateUTC(m.detectedAt)}
                source={
                  <RedactedDomain
                    head={m.redaction.head}
                    tail={m.redaction.tail}
                    hiddenChars={m.redaction.hidden}
                    className="text-[13.5px] text-ink-soft"
                  />
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/* ── 04 Exposure ───────────────────────────────────────────────── */

function ExposurePanel({ frame }: { frame: ScanFrame }) {
  const split = frame.confidenceSplit;
  const total = Math.max(1, split.high + split.likely + split.possible);
  const classifying = frame.phase === "classifying_findings";

  return (
    <div>
      <PanelHead
        title={classifying ? "Classifying findings" : "Weighting exposure"}
      />

      <div className="mt-5 grid gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-10">
        <div className="min-w-0">
          {/* One stacked rule, split three ways — the classification
              itself, not three coloured badges. */}
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-mineral">
            {(
              [
                ["high", split.high, "bg-warn"],
                ["likely", split.likely, "bg-graphite"],
                ["possible", split.possible, "bg-mineral-deep"],
              ] as const
            ).map(([key, v, tone]) => (
              <motion.span
                key={key}
                initial={false}
                animate={{ flexGrow: v / total }}
                transition={{ duration: 0.24, ease: "linear" }}
                className={tone}
                style={{ flexBasis: 0 }}
              />
            ))}
          </div>

          <dl className="mt-4">
            {(
              [
                ["High confidence", split.high, true],
                ["Likely match", split.likely, false],
                ["Possible match", split.possible, false],
              ] as const
            ).map(([label, v, warn]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-4 border-t border-edge py-2.5"
              >
                <dt className="text-[14.5px] text-ink-soft">{label}</dt>
                <dd
                  className={cn(
                    "font-mono text-[13.5px] tabular",
                    warn ? "text-warn" : "text-ink"
                  )}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="min-w-0">
          <ExposureStatus score={frame.exposureScore} />
          <div className="mt-6 h-[86px]">
            <ActivityChart
              data={activitySeries}
              draw={!classifying}
              tone="light"
              height={86}
            />
          </div>
          <p className="mt-2 text-[13.5px] text-ink-soft">
            Detections, last eight weeks
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── 05 Report ─────────────────────────────────────────────────── */

function ReportBuildPanel({ frame }: { frame: ScanFrame }) {
  return (
    <div>
      <PanelHead
        title="Assembling report"
        value={`${frame.reportSections} of ${REPORT_SECTIONS.length}`}
      />
      <ul className="mt-5">
        {REPORT_SECTIONS.map((s, i) => {
          const laid = i < frame.reportSections;
          return (
            <li
              key={s}
              className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-x-3.5 border-t border-edge py-3"
            >
              <span className="font-mono text-[12.5px] tabular text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "text-[15px] transition-colors duration-300",
                  laid ? "text-ink" : "text-ink-faint"
                )}
              >
                {s}
              </span>
              <motion.span
                initial={false}
                animate={{ opacity: laid ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-[12.5px] text-ink-soft"
              >
                ready
              </motion.span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Shared head ───────────────────────────────────────────────── */

function PanelHead({ title, value }: { title: string; value?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <h2 className="text-[16px] font-medium text-ink">{title}</h2>
      {value ? (
        <p className="font-mono text-[12.5px] tabular text-ink-soft">{value}</p>
      ) : null}
    </div>
  );
}
