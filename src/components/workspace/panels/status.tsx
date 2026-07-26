"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ActivityChart } from "@/components/scanner/activity-chart";
import { exposureLabels, type FileRecord } from "@/lib/demo/files";
import { DEMO_ANCHOR, activitySeries } from "@/lib/demo/scan-data";
import { motionTokens } from "@/lib/motion";
import { cn, formatRelative } from "@/lib/utils";
import { Figure, Jump, Measure, PanelHead, type OpenSection } from "../parts";
import { SealNotice } from "./seal";

const BANDS = ["Low", "Moderate", "Elevated", "High"] as const;

/**
 * 02 — the measurement surface.
 *
 * One reading dominates: the exposure band, in words, with the score
 * that produced it beside it. Everything else on the panel is a
 * figure aligned to a rule, so the panel can be read down the right
 * edge as a column of numbers.
 */
export function StatusPanel({
  file,
  onOpenSection,
}: {
  file: FileRecord;
  onOpenSection: OpenSection;
}) {
  const reduced = useReducedMotion();
  const band = Math.min(3, Math.floor(file.exposureScore / 25));
  const elevated = band >= 2;

  const peak = Math.max(...activitySeries.map((d) => d.detections));
  const recurrences = activitySeries.reduce((a, d) => a + d.recurrences, 0);

  return (
    <div>
      <PanelHead
        index="02"
        title="Exposure status"
        note="Weighted from match volume, confidence, and how many separate sources carry the content."
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
        <div className="min-w-0">
          {/* ── The reading ──────────────────────────────────────── */}
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <p
              className={cn(
                "text-display text-[52px] sm:text-[64px]",
                elevated ? "text-warn" : "text-ink"
              )}
            >
              {exposureLabels[file.exposure]}
            </p>
            <p className="pb-1">
              <Figure
                value={file.exposureScore}
                suffix="/100"
                tone={elevated ? "warn" : "ink"}
                className="text-[30px]"
              />
            </p>
          </div>

          <div className="mt-6 flex gap-1.5" aria-hidden>
            {BANDS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-mineral-deep"
              >
                <motion.span
                  className={cn(
                    "block h-full rounded-full",
                    elevated ? "bg-warn" : "bg-graphite"
                  )}
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: i <= band ? 1 : 0 }}
                  transition={{
                    duration: reduced ? 0 : motionTokens.duration.slow,
                    delay: reduced ? 0 : 0.06 + i * 0.07,
                    ease: motionTokens.ease.enter,
                  }}
                  style={{ originX: 0 }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1.5">
            {BANDS.map((b, i) => (
              <span
                key={b}
                className={cn(
                  "flex-1 text-[13px]",
                  i === band ? "text-ink" : "text-ink-faint"
                )}
              >
                {b}
              </span>
            ))}
          </div>

          {/* ── The figures ──────────────────────────────────────── */}
          <dl className="mt-10">
            <Measure label="Findings on file" value={file.findings} />
            <Measure
              label="New since last week"
              value={file.newFindings}
              tone={file.newFindings > 0 ? "warn" : "ink"}
            />
            <Measure label="High confidence" value={file.highConfidence} />
            <Measure label="Indexed public sources" value={file.sources} />
            <Measure
              label="Awaiting your decision"
              value={file.awaitingReview}
              tone={file.awaitingReview > 0 ? "warn" : "ink"}
            />
            <Measure label="Confirmed removed" value={file.removed} />
          </dl>

          {file.verified && file.awaitingReview > 0 ? (
            <div className="mt-5">
              <Jump onClick={() => onOpenSection("findings")}>
                Review the {file.awaitingReview} open findings
              </Jump>
            </div>
          ) : null}
        </div>

        {/* ── The period ───────────────────────────────────────────── */}
        <div className="min-w-0">
          <h3 className="text-subject text-[15.5px] text-ink">
            Detection activity
          </h3>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            Detections per week, last eight weeks.
          </p>

          <div className="mt-4 h-[150px]">
            <ActivityChart data={activitySeries} draw tone="light" height={150} />
          </div>
          <div className="mt-1 flex items-baseline justify-between font-mono text-[12.5px] text-ink-soft">
            <span>8 weeks ago</span>
            <span>this week</span>
          </div>

          <dl className="mt-6">
            <Measure label="Peak week" value={peak} />
            <Measure label="Recurrences in period" value={recurrences} />
          </dl>

          <p className="mt-6 border-t border-edge pt-4 text-[14px] leading-relaxed text-ink-soft">
            {file.monitoring === "paused"
              ? "Comparison is paused until ownership is verified."
              : `${
                  file.monitoring === "daily" ? "Daily" : "Weekly"
                } comparison. Last run ${formatRelative(
                  file.lastScan,
                  DEMO_ANCHOR
                )}.`}
          </p>
        </div>
      </div>

      {!file.verified ? <SealNotice file={file} /> : null}
    </div>
  );
}
