"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ActivityChart } from "@/components/scanner/activity-chart";
import { RedactedDomain } from "./redacted";
import { VerificationSeal } from "./file-parts";
import {
  DEMO_ANCHOR,
  activitySeries,
  demoMatches,
  exposureLevel,
  scanTotals,
  sourceCoverage,
} from "@/lib/demo/scan-data";
import { routes } from "@/config/navigation";
import { platformLabels, type Platform } from "@/lib/validation";
import { motionTokens } from "@/lib/motion";
import { formatDateUTC, formatLongDateUTC, cn } from "@/lib/utils";

const BANDS = ["Low", "Moderate", "Elevated", "High"] as const;
const PAGES = ["Summary", "Exposure", "Sources", "Findings", "The file"];

/**
 * The file on a phone.
 *
 * Not the desktop report reflowed — a sequence of report pages, one
 * screen each, turned by hand. Each page holds one idea at a size
 * that can be read at arm's length, and the action lives on the last
 * page rather than hovering over the others.
 */
export function MobileReport({
  username,
  platform,
  reference,
  onNewScan,
}: {
  username: string;
  platform: Platform | null;
  reference: string;
  onNewScan: () => void;
}) {
  const reduced = useReducedMotion();
  const [page, setPage] = React.useState(0);
  const [dir, setDir] = React.useState(1);

  const go = (next: number) => {
    if (next < 0 || next >= PAGES.length) return;
    setDir(next > page ? 1 : -1);
    setPage(next);
  };

  const slide = reduced
    ? {}
    : {
        initial: { opacity: 0, x: dir * 28 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: dir * -28 },
        transition: {
          duration: motionTokens.duration.base,
          ease: motionTokens.ease.enter,
        },
      };

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] flex-col">
      {/* Page marker */}
      <div className="flex items-baseline justify-between border-b border-edge pb-3">
        <p className="font-mono text-[13px] tabular text-ink-faint">
          {String(page + 1).padStart(2, "0")} / {String(PAGES.length).padStart(2, "0")}
        </p>
        <p className="text-[14px] text-ink-soft">{PAGES[page]}</p>
      </div>

      {/* Page body */}
      <div className="flex-1 py-9">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={page} {...slide}>
            {page === 0 ? (
              <PageSummary
                username={username}
                platform={platform}
                reference={reference}
              />
            ) : page === 1 ? (
              <PageExposure />
            ) : page === 2 ? (
              <PageSources />
            ) : page === 3 ? (
              <PageFindings />
            ) : (
              <PageUnlock onNewScan={onNewScan} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Turn controls — in the flow, not floating over the page */}
      <div className="flex items-center gap-3 border-t border-edge pt-4">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page === 0}
          aria-label="Previous page"
          className="flex size-12 items-center justify-center rounded-full border border-edge-strong text-ink transition-colors disabled:opacity-30"
        >
          <ArrowLeft className="size-4.5" aria-hidden />
        </button>

        <div className="flex flex-1 gap-1.5" aria-hidden>
          {PAGES.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-0.5 flex-1 rounded-full transition-colors duration-300",
                i <= page ? "bg-ink" : "bg-edge-strong"
              )}
            />
          ))}
        </div>

        {page < PAGES.length - 1 ? (
          <button
            type="button"
            onClick={() => go(page + 1)}
            aria-label="Next page"
            className="flex size-12 items-center justify-center rounded-full bg-ink text-page"
          >
            <ArrowRight className="size-4.5" aria-hidden />
          </button>
        ) : (
          <span className="size-12" />
        )}
      </div>
    </div>
  );
}

/* ── 01 Summary ────────────────────────────────────────────────── */

function PageSummary({
  username,
  platform,
  reference,
}: {
  username: string;
  platform: Platform | null;
  reference: string;
}) {
  return (
    <div>
      <p className="text-[15px] text-ink-soft">Profile exposure report</p>
      <h1 className="text-report mt-2 text-[38px] leading-[1.04] text-ink">
        @{username}
      </h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        {platform ? platformLabels[platform] : "Any platform"}
        <span className="px-2 text-ink-faint">·</span>
        <span className="font-mono text-[13px]">{reference}</span>
      </p>

      <p className="text-report mt-12 text-[86px] leading-[0.86] text-ink">
        {scanTotals.matches}
      </p>
      <p className="mt-3 text-[19px] text-ink">potential matches</p>

      <dl className="mt-10">
        <div className="flex items-baseline justify-between gap-6 border-t border-edge py-4">
          <dt className="text-[16px] text-ink-soft">Indexed public sources</dt>
          <dd className="tabular text-[20px] text-ink">{scanTotals.sources}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-6 border-t border-edge py-4">
          <dt className="text-[16px] text-ink-soft">High-confidence findings</dt>
          <dd className="tabular text-[20px] text-ink">
            {scanTotals.highConfidence}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-6 border-t border-edge py-4">
          <dt className="text-[16px] text-ink-soft">Generated</dt>
          <dd className="font-mono text-[15px] text-ink">
            {formatLongDateUTC(DEMO_ANCHOR)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/* ── 02 Exposure ───────────────────────────────────────────────── */

function PageExposure() {
  const reduced = useReducedMotion();
  const band = Math.min(3, Math.floor(exposureLevel.score / 25));
  const last = activitySeries[activitySeries.length - 1]!;
  const prev = activitySeries[activitySeries.length - 2]!;

  return (
    <div>
      <p className="text-[15px] text-ink-soft">Exposure status</p>
      <p className="text-report mt-2 text-[52px] leading-none text-warn">
        {BANDS[band]}
      </p>

      <div className="mt-7 flex gap-2" aria-hidden>
        {BANDS.map((_, i) => (
          <motion.span
            key={i}
            initial={reduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.4,
              delay: reduced ? 0 : 0.1 + i * 0.09,
              ease: motionTokens.ease.enter,
            }}
            style={{ originX: 0 }}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i <= band ? "bg-warn" : "bg-mineral-deep"
            )}
          />
        ))}
      </div>

      <p className="mt-8 text-[16px] leading-relaxed text-ink-soft">
        Weighted from match volume, confidence and how many separate
        sources carry the content.
      </p>

      <div className="mt-12">
        <p className="text-[15px] text-ink-soft">Detection activity</p>
        <div className="mt-3 h-[150px]">
          <ActivityChart data={activitySeries} draw tone="light" height={150} />
        </div>
        <p className="mt-4 text-[16px] text-ink">
          Detections rose from{" "}
          <span className="tabular">{prev.detections}</span> to{" "}
          <span className="tabular font-medium">{last.detections}</span> last
          week.
        </p>
      </div>
    </div>
  );
}

/* ── 03 Sources ────────────────────────────────────────────────── */

function PageSources() {
  const total = sourceCoverage.reduce((a, s) => a + s.count, 0);
  return (
    <div>
      <p className="text-[15px] text-ink-soft">Source distribution</p>
      <p className="text-report mt-2 text-[46px] leading-none text-ink">
        {total}
      </p>
      <p className="mt-2 text-[17px] text-ink">indexed public sources</p>

      <dl className="mt-10">
        {sourceCoverage.map((s) => (
          <div
            key={s.kind}
            className="border-t border-edge py-4"
          >
            <div className="flex items-baseline justify-between gap-6">
              <dt className="text-[17px] text-ink">{s.label}</dt>
              <dd className="tabular text-[19px] text-ink">{s.count}</dd>
            </div>
            <div className="mt-2.5 h-1 rounded-full bg-mineral">
              <div
                className="h-full rounded-full bg-graphite"
                style={{ width: `${(s.count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ── 04 Findings ───────────────────────────────────────────────── */

function PageFindings() {
  const rows = demoMatches.slice(0, 6);
  return (
    <div>
      <p className="text-[15px] text-ink-soft">Findings register</p>
      <p className="mt-2 text-[17px] text-ink">
        Showing 6 of{" "}
        <span className="tabular">{scanTotals.matches}</span>
      </p>

      <ol className="mt-8">
        {rows.map((m, i) => (
          <li key={m.id} className="border-t border-edge py-5">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[13px] tabular text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="min-w-0 flex-1 text-[17px] text-ink">
                {m.matchType}
              </p>
            </div>
            <div className="mt-2 pl-8">
              <RedactedDomain
                head={m.redaction.head}
                tail={m.redaction.tail}
                hiddenChars={m.redaction.hidden}
                className="text-[15px] text-ink-soft"
              />
              <p className="mt-1.5 text-[15px] text-ink-soft">
                <span
                  className={m.confidence === "high" ? "text-warn" : undefined}
                >
                  {m.confidence === "high"
                    ? "High confidence"
                    : m.confidence === "medium"
                      ? "Possible match"
                      : "Low confidence"}
                </span>
                <span className="px-2 text-ink-faint">·</span>
                {formatDateUTC(m.detectedAt)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── 05 Unlock ─────────────────────────────────────────────────── */

function PageUnlock({ onNewScan }: { onNewScan: () => void }) {
  return (
    <div>
      <p className="text-[15px] text-ink-soft">The complete file</p>
      <h2 className="text-report mt-2 text-[34px] leading-[1.06] text-ink">
        Verify that this profile belongs to you
      </h2>
      <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
        The full file holds every source, its evidence and the removal
        actions available to you.
      </p>

      <ul className="mt-9">
        {[
          "Exact source addresses",
          "Preview evidence",
          "Complete findings register",
          "Removal requests",
          "Continuous monitoring",
        ].map((item) => (
          <li
            key={item}
            className="border-t border-edge py-3.5 text-[17px] text-ink"
          >
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <VerificationSeal state="required" />
      </div>

      <Link
        href={routes.onboardingDemo}
        className="mt-7 flex h-14 items-center justify-center gap-2.5 rounded-[3px] bg-ink text-[17px] font-medium text-page"
      >
        Unlock the complete case file
        <ArrowRight className="size-4.5" aria-hidden />
      </Link>

      <button
        type="button"
        onClick={onNewScan}
        className="mt-3 flex h-12 w-full items-center justify-center text-[16px] text-ink-soft"
      >
        Run another public scan
      </button>
    </div>
  );
}
