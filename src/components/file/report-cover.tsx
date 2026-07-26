"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ReportPage, VerificationSeal } from "./file-parts";
import { Redacted, RedactedDomain } from "./redacted";
import {
  DEMO_ANCHOR,
  demoMatches,
  exposureLevel,
  scanTotals,
} from "@/lib/demo/scan-data";
import { routes } from "@/config/navigation";
import { platformLabels, type Platform } from "@/lib/validation";
import { motionTokens } from "@/lib/motion";
import { formatLongDateUTC } from "@/lib/utils";
import { cn } from "@/lib/utils";

const BANDS = ["Low", "Moderate", "Elevated", "High"] as const;

/**
 * The completed file.
 *
 * A cover comes to the foreground carrying the four facts that
 * matter, and beneath it the report's own pages are visible at their
 * top edges — progressively more redacted the deeper they sit. The
 * visitor can see that a complete document exists and can measure
 * roughly how much of it there is, without being able to read any of
 * it.
 */
export function ReportCover({
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
  const band = Math.min(3, Math.floor(exposureLevel.score / 25));
  const bandLabel = BANDS[band]!;

  const peeked = demoMatches.slice(0, 9);

  return (
    <div className="relative">
      {/* ── Cover ─────────────────────────────────────────────────── */}
      <motion.div
        initial={
          reduced ? false : { opacity: 0, y: 26, scale: 0.985 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.72,
          ease: motionTokens.ease.enter,
        }}
        className="relative z-20"
      >
        <ReportPage className="px-6 py-10 sm:px-12 sm:py-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-edge pb-5">
            <p className="text-[14px] tracking-[0.02em] text-ink-soft">
              Profile exposure report
            </p>
            <p className="font-mono text-[12.5px] text-ink-faint">
              {reference}
            </p>
          </div>

          <h1 className="text-report mt-10 text-[42px] text-ink sm:text-[58px]">
            @{username}
          </h1>
          {platform ? (
            <p className="mt-2 text-[15px] text-ink-soft">
              {platformLabels[platform]}
            </p>
          ) : null}

          {/* The four facts, ruled — not four cards */}
          <dl className="mt-12 grid gap-x-12 gap-y-0 sm:grid-cols-2">
            <Fact
              value={String(scanTotals.matches)}
              label="potential matches"
              lead
            />
            <Fact
              value={String(scanTotals.sources)}
              label="indexed public sources"
            />
            <Fact
              value={String(scanTotals.highConfidence)}
              label="high-confidence findings"
            />
            <div className="flex items-baseline justify-between gap-6 border-t border-edge py-4">
              <dt className="text-[15px] text-ink-soft">Exposure status</dt>
              <dd className="text-report text-[24px] text-warn">{bandLabel}</dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-edge pt-6">
            <div>
              <p className="text-[13.5px] text-ink-soft">Generated</p>
              <p className="mt-0.5 font-mono text-[14px] text-ink">
                {formatLongDateUTC(DEMO_ANCHOR)}
              </p>
            </div>
            <VerificationSeal state="required" />
          </div>

          {/* The action belongs to the document, not to a banner */}
          <div className="mt-10 flex flex-col gap-4 border-t border-edge pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-sm text-[15px] leading-relaxed text-ink-soft">
              The complete file holds every source, its evidence and the
              removal actions available to you.
            </p>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={routes.onboardingDemo}
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2.5 rounded-[3px] bg-ink px-6",
                  "text-[15px] font-medium text-page transition-transform duration-200",
                  "hover:scale-[1.015] active:scale-[0.99]"
                )}
              >
                Unlock the complete case file
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={onNewScan}
                className="h-12 px-2 text-[15px] text-ink-soft transition-colors hover:text-ink"
              >
                Run another public scan
              </button>
            </div>
          </div>
        </ReportPage>
      </motion.div>

      {/* ── The pages beneath ─────────────────────────────────────── */}
      <div className="relative -mt-3" aria-hidden>
        {[0, 1, 2].map((depth) => (
          <motion.div
            key={depth}
            initial={reduced ? false : { opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: motionTokens.duration.reveal,
              delay: reduced ? 0 : 0.34 + depth * 0.09,
              ease: motionTokens.ease.enter,
            }}
            style={{
              zIndex: 10 - depth,
              marginInline: `${(depth + 1) * 14}px`,
            }}
            className="relative"
          >
            <div
              className="overflow-hidden rounded-[3px] border border-edge bg-page shadow-page"
              style={{
                height: depth === 2 ? 74 : 96,
                opacity: 1 - depth * 0.22,
              }}
            >
              <div className="px-6 pt-4 sm:px-10">
                <p className="text-[13px] text-ink-faint">
                  {["Findings register", "Source index", "Evidence"][depth]}
                </p>
                <ul className="mt-3 space-y-2.5">
                  {peeked
                    .slice(depth * 3, depth * 3 + 2)
                    .map((m) => (
                      <li
                        key={m.id}
                        className="flex items-baseline gap-4 text-[13.5px]"
                      >
                        <span className="font-mono text-[12px] text-ink-faint">
                          {m.id.slice(-3)}
                        </span>
                        <RedactedDomain
                          head={m.redaction.head}
                          tail={m.redaction.tail}
                          hiddenChars={m.redaction.hidden}
                          className="text-[13px] text-ink-soft"
                        />
                        <span className="ml-auto flex items-center gap-2">
                          <Redacted chars={9} className="opacity-70" />
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            {/* Each page fades into the desk as it recedes */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12 rounded-b-[3px]"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, var(--color-canvas))",
              }}
            />
          </motion.div>
        ))}

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 0.7, duration: 0.4 }}
          className="relative z-20 mt-6 text-center text-[14px] text-ink-soft"
        >
          <span className="tabular font-medium text-ink">
            {scanTotals.matches - 9}
          </span>{" "}
          further findings, their sources and evidence remain sealed in the
          file.
        </motion.p>
      </div>
    </div>
  );
}

function Fact({
  value,
  label,
  lead = false,
}: {
  value: string;
  label: string;
  lead?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-edge py-4">
      <dt className="text-[15px] text-ink-soft">{label}</dt>
      <dd
        className={cn(
          "text-report tabular text-ink",
          lead ? "text-[38px]" : "text-[24px]"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
