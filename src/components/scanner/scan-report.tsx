"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportRegister, RegisterTail } from "./report-register";
import { ActivityChart } from "./activity-chart";
import {
  activitySeries,
  demoMatches,
  exposureLevel,
  scanTotals,
  sourceCoverage,
} from "@/lib/demo/scan-data";
import { routes } from "@/config/navigation";
import { platformLabels, type Platform } from "@/lib/validation";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* The register shows a readable slice; the rest is stated, not
   rendered as dozens of unreadable rows. */
const REGISTER_ROWS = 12;

const EXPOSURE_BANDS = ["Low", "Moderate", "Elevated", "High"] as const;

/**
 * The report.
 *
 * This — not the dark instrument — is where the scan lands. It reads
 * as an editorial intelligence brief on the same porcelain surface
 * as the rest of the site: one primary figure, a sentence that
 * explains it, a frameless curve, a compact secondary reading, and
 * a register of findings that grows harder to resolve as it goes.
 *
 * There are no cards. Structure comes from hairlines, type scale and
 * space.
 */
export function ScanReport({
  username,
  platform,
  onReplay,
  onNewSearch,
}: {
  username: string;
  platform: Platform | null;
  onReplay: () => void;
  onNewSearch: () => void;
}) {
  const reduced = useReducedMotion();
  const rows = demoMatches.slice(0, REGISTER_ROWS);

  const band = Math.min(3, Math.floor(exposureLevel.score / 25));
  const bandLabel = EXPOSURE_BANDS[band]!;

  const step = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: motionTokens.duration.slow,
            delay,
            ease: motionTokens.ease.enter,
          },
        };

  return (
    <div className="pb-28 sm:pb-16">
      {/* ── Session line ─────────────────────────────────────────── */}
      <motion.div
        {...step(0)}
        className="flex flex-wrap items-baseline gap-x-3 gap-y-2 pb-6"
      >
        <p className="text-[15px] text-ink">
          Scan complete
          <span className="px-2 text-ink-faint">·</span>
          <span className="font-mono text-[14px]">@{username}</span>
          {platform ? (
            <>
              <span className="px-2 text-ink-faint">·</span>
              <span className="text-ink-soft">{platformLabels[platform]}</span>
            </>
          ) : null}
        </p>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex h-9 items-center gap-2 rounded-sm px-2.5 text-[14px] text-ink-soft transition-colors hover:bg-mineral hover:text-ink"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Replay
          </button>
          <button
            type="button"
            onClick={onNewSearch}
            className="inline-flex h-9 items-center rounded-sm px-2.5 text-[14px] text-ink-soft transition-colors hover:bg-mineral hover:text-ink"
          >
            New search
          </button>
        </div>
      </motion.div>

      {/* ── Headline reading ─────────────────────────────────────────
          Three blocks, placed rather than stacked. On a phone they
          read in DOM order — figure, then what it means, then where
          it sits. On a wide screen the middle block moves to its own
          column so the figure and the breakdown share the left. */}
      <div className="grid gap-12 border-t border-ink/15 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-x-20 lg:gap-y-14">
        <motion.div {...step(0.08)} className="lg:col-start-1 lg:row-start-1">
          <p className="text-display text-[76px] leading-[0.92] text-ink sm:text-[96px]">
            {scanTotals.matches}
          </p>
          <p className="mt-3 text-[20px] text-ink sm:text-[22px]">
            potential matches
          </p>
          <p className="mt-2 max-w-sm text-[17px] leading-relaxed text-ink-soft">
            detected across {scanTotals.sources} indexed public sources.
          </p>
        </motion.div>

        <motion.div
          {...step(0.16)}
          className="flex flex-col gap-8 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:justify-start"
        >
          {/* Frameless curve — it belongs to the composition, not to
              a card sitting inside it. */}
          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-[14px] text-ink-soft">Detection activity</p>
              <p className="font-mono text-[13px] text-ink-faint">8 weeks</p>
            </div>
            <div className="mt-2 h-[92px]">
              <ActivityChart
                data={activitySeries}
                draw
                tone="light"
                height={92}
              />
            </div>
          </div>

          <dl className="space-y-3.5">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[15px] text-ink-soft">High confidence</dt>
              <dd className="tabular text-[17px] font-medium text-ink">
                {scanTotals.highConfidence}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[15px] text-ink-soft">Active this week</dt>
              <dd className="tabular text-[17px] font-medium text-ink">
                {scanTotals.activeThisWeek}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-edge pt-3.5">
              <dt className="text-[15px] text-ink-soft">Exposure level</dt>
              <dd className="text-[17px] font-medium text-warn">
                {bandLabel}
              </dd>
            </div>
            <div className="flex gap-1.5" aria-hidden>
              {EXPOSURE_BANDS.map((_, i) => (
                <motion.span
                  key={i}
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: reduced ? 0 : 0.4 + i * 0.09,
                    ease: motionTokens.ease.enter,
                  }}
                  style={{ originX: 0 }}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    i <= band ? "bg-warn" : "bg-mineral-deep"
                  )}
                />
              ))}
            </div>
          </dl>
        </motion.div>

        {/* Where those sources sit — substance in place of an empty
            column, answering the question the figure above raises. */}
        <motion.dl
          {...step(0.22)}
          className="max-w-md lg:col-start-1 lg:row-start-2"
        >
          {sourceCoverage.map((s) => (
            <div
              key={s.kind}
              className="flex items-baseline justify-between gap-6 border-t border-edge py-3"
            >
              <dt className="text-[15px] text-ink-soft">{s.label}</dt>
              <dd className="tabular text-[16px] text-ink">{s.count}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* ── Findings register ────────────────────────────────────── */}
      <motion.section {...step(0.26)} className="mt-16 sm:mt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 className="text-title text-[22px] text-ink">Findings</h2>
          <p className="text-[14px] text-ink-soft">
            Showing {REGISTER_ROWS} of {scanTotals.matches}
            <span className="px-1.5 text-ink-faint">·</span>
            domains partially masked
          </p>
        </div>

        <ReportRegister matches={rows} className="mt-5" />
        <RegisterTail shown={REGISTER_ROWS} total={scanTotals.matches} />
      </motion.section>

      {/* ── The next step, written into the report ───────────────── */}
      <motion.section
        {...step(0.34)}
        aria-labelledby="claim-heading"
        className="mt-14 border-t border-ink/15 pt-10 sm:mt-20"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <div>
            <h2
              id="claim-heading"
              className="text-display text-[26px] text-ink sm:text-[30px]"
            >
              The full report is ready.
            </h2>
            <p className="mt-3 max-w-lg text-[17px] leading-relaxed text-ink-soft">
              Verify that this profile belongs to you to reveal exact
              sources, evidence and removal options.
            </p>
          </div>

          <div className="shrink-0">
            <Button variant="accent" size="lg" asChild className="w-full sm:w-auto">
              <Link href={routes.onboardingDemo}>
                Claim this profile
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>

        <p className="mt-8 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          Argus searches indexed public sources only. Exact domains,
          previews and removal actions stay protected until ownership is
          verified.
        </p>
      </motion.section>
    </div>
  );
}
