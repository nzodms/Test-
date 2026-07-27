"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SCAN_STAGES } from "@/lib/scan/types";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   Argus product primitives.

   Each of these exists because the product needs it, not because a
   design system should have one. None of them is a card: structure
   comes from rules, alignment, weight and position.
   ════════════════════════════════════════════════════════════════ */

/* ── ScanProgress ──────────────────────────────────────────────── */

/**
 * The five stages of a scan. Not a progress bar: each stage is a
 * named operation that is pending, running or done, and the running
 * one carries a thin determinate rule of its own.
 */
export function ScanProgress({
  stage,
  stageProgress,
  className,
}: {
  stage: number;
  stageProgress: number;
  className?: string;
}) {
  const current = SCAN_STAGES[Math.max(0, Math.min(SCAN_STAGES.length - 1, stage))];

  return (
    <div className={className}>
      {/* Phones get the same five rules, but the label belongs to the
          running stage alone — five truncated words is not a status. */}
      <div className="sm:hidden">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[15px] font-medium text-ink">{current?.label}</p>
          <p className="font-mono text-[13px] tabular text-ink-soft">
            {String(Math.max(0, stage) + 1).padStart(2, "0")} /{" "}
            {String(SCAN_STAGES.length).padStart(2, "0")}
          </p>
        </div>
        <div className="mt-2.5 grid grid-cols-5 gap-x-2">
          {SCAN_STAGES.map((s, i) => (
            <div key={s.id} className="relative h-px bg-edge-strong/45">
              <motion.div
                className={cn(
                  "absolute inset-y-0 left-0 w-full origin-left",
                  i < stage ? "bg-ink" : "bg-accent"
                )}
                initial={false}
                animate={{
                  scaleX:
                    i < stage
                      ? 1
                      : i === stage
                        ? Math.max(0.04, stageProgress)
                        : 0,
                }}
                transition={{ duration: 0.14, ease: "linear" }}
              />
            </div>
          ))}
        </div>
      </div>

      <ol
        className="hidden grid-cols-5 gap-x-5 sm:grid"
        aria-label="Scan progress"
      >
      {SCAN_STAGES.map((s, i) => {
        const done = i < stage;
        const active = i === stage;
        return (
          <li key={s.id} className="min-w-0">
            {/* The rule is the state: full when done, filling when
                active, hairline when still ahead. */}
            <div className="relative h-px w-full bg-edge-strong/45">
              <motion.div
                className={cn(
                  "absolute inset-y-0 left-0 origin-left",
                  done ? "bg-ink" : "bg-accent"
                )}
                style={{ width: "100%" }}
                initial={false}
                animate={{
                  scaleX: done ? 1 : active ? Math.max(0.04, stageProgress) : 0,
                }}
                transition={{ duration: 0.14, ease: "linear" }}
              />
            </div>
            <p
              className={cn(
                "mt-2.5 truncate text-[13.5px] transition-colors duration-300",
                done
                  ? "text-ink-soft"
                  : active
                    ? "font-medium text-ink"
                    : "text-ink-faint"
              )}
            >
              <span className="font-mono tabular">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="pl-2">{s.label}</span>
            </p>
          </li>
        );
      })}
      </ol>
    </div>
  );
}

/* ── ScanOperation ─────────────────────────────────────────────── */

/** One line of work the scan actually did, with what it produced. */
export function ScanOperation({
  index,
  label,
  value,
  offset,
  status,
  current,
}: {
  index: number;
  label: string;
  value?: string;
  offset: string;
  status: "pending" | "active" | "complete" | "warning";
  current: boolean;
}) {
  return (
    <div className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-x-3.5 py-1.5">
      <span className="font-mono text-[12.5px] tabular text-ink-faint">
        {String(index).padStart(2, "0")}
      </span>
      <span
        className={cn(
          "min-w-0 truncate text-[14.5px] transition-colors duration-300",
          current ? "text-ink" : "text-ink-soft"
        )}
      >
        {label}
      </span>
      <span className="flex shrink-0 items-baseline gap-3">
        {value ? (
          <span
            className={cn(
              "font-mono text-[12.5px] tabular",
              status === "warning" ? "text-warn" : "text-ink-soft"
            )}
          >
            {value}
          </span>
        ) : null}
        <span className="font-mono text-[12.5px] tabular text-ink-faint">
          {offset}
        </span>
      </span>
    </div>
  );
}

/* ── Figure ────────────────────────────────────────────────────── */

/**
 * A measured value. The same component carries it while it climbs
 * during the scan and after it settles in the report — which is what
 * makes the two feel like one surface rather than two screens.
 */
export function Figure({
  value,
  label,
  size = "lead",
  tone = "ink",
  pending = false,
}: {
  value: number | string;
  label: string;
  size?: "lead" | "base";
  tone?: "ink" | "warn";
  pending?: boolean;
}) {
  /* A value that has not been produced yet is absent, not zero —
     showing 0 high-confidence findings mid-scan states something the
     scan has not determined. */
  const shown = pending ? "—" : value;

  return (
    <div className="min-w-0">
      <p
        className={cn(
          "text-figure transition-colors duration-500",
          size === "lead"
            ? "text-[46px] sm:text-[58px]"
            : "text-[26px] sm:text-[30px]",
          pending ? "text-ink-faint" : tone === "warn" ? "text-warn" : "text-ink"
        )}
      >
        {shown}
      </p>
      <p
        className={cn(
          "text-ink-soft",
          size === "lead" ? "mt-2.5 text-[15px]" : "mt-1.5 text-[14px]"
        )}
      >
        {label}
      </p>
    </div>
  );
}

/* ── SourceEntry ───────────────────────────────────────────────── */

export function SourceEntry({
  label,
  count,
  total,
  detected,
  index,
}: {
  label: string;
  count: number;
  total: number;
  detected: boolean;
  index: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: detected ? 1 : 0.32, y: 0 }}
      transition={{
        duration: motionTokens.duration.base,
        delay: reduced ? 0 : index * 0.02,
        ease: motionTokens.ease.enter,
      }}
      className="border-t border-edge py-2.5"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span
          className={cn(
            "min-w-0 truncate text-[14.5px] transition-colors duration-500",
            detected ? "text-ink" : "text-ink-faint"
          )}
        >
          {label}
        </span>
        <span className="shrink-0 font-mono text-[13px] tabular text-ink-soft">
          {detected ? count : "—"}
        </span>
      </div>
      {/* Proportion, drawn only once the source has actually landed */}
      <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-mineral">
        <motion.div
          className="h-full rounded-full bg-graphite"
          initial={false}
          animate={{ scaleX: total > 0 ? count / total : 0 }}
          style={{ originX: 0, width: "100%" }}
          transition={{ duration: 0.22, ease: "linear" }}
        />
      </div>
    </motion.li>
  );
}

/* ── FindingRow ────────────────────────────────────────────────── */

export function FindingRow({
  index,
  subject,
  source,
  confidence,
  meta,
  action,
  onClick,
  selected = false,
  entering = false,
}: {
  index: number;
  subject: string;
  source: React.ReactNode;
  confidence: "high" | "medium" | "low";
  meta?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  /** Dropping into a register that is still being written. */
  entering?: boolean;
}) {
  const reduced = useReducedMotion();
  const label =
    confidence === "high"
      ? "High confidence"
      : confidence === "medium"
        ? "Likely match"
        : "Possible match";

  const body = (
    <>
      <span className="pt-[3px] font-mono text-[12.5px] tabular text-ink-faint">
        {String(index).padStart(2, "0")}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] text-ink">{subject}</span>
        <span className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          {source}
          {meta ? (
            <span className="font-mono text-[12.5px] text-ink-faint">
              {meta}
            </span>
          ) : null}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-4">
        <span
          className={cn(
            "text-[13.5px] whitespace-nowrap",
            confidence === "high" ? "text-warn" : "text-ink-soft"
          )}
        >
          {label}
        </span>
        {action}
      </span>
    </>
  );

  const shell = cn(
    "grid w-full grid-cols-[1.75rem_minmax(0,1fr)_auto] items-start gap-x-3.5 border-t border-edge py-3.5 text-left",
    "transition-colors duration-150",
    onClick && "-mx-3 w-[calc(100%+1.5rem)] px-3 hover:bg-page",
    selected && "bg-page"
  );

  /* The entry animation lives on the <li> itself — wrapping the row in
     a motion.div would put a <div> straight inside the <ul>. */
  const enter =
    entering && !reduced
      ? {
          initial: { opacity: 0, y: -8 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: motionTokens.duration.fast,
            ease: motionTokens.ease.enter,
          },
        }
      : {};

  return (
    <motion.li className="list-none" {...enter}>
      {onClick ? (
        <button type="button" onClick={onClick} className={shell}>
          {body}
        </button>
      ) : (
        <div className={shell}>{body}</div>
      )}
    </motion.li>
  );
}

/* ── ExposureStatus ────────────────────────────────────────────── */

const BANDS = ["Low", "Moderate", "Elevated", "High"] as const;

export function ExposureStatus({
  score,
  size = "base",
  note,
}: {
  score: number;
  size?: "lead" | "base";
  note?: string;
}) {
  const band = Math.min(3, Math.floor(score / 25));
  const elevated = band >= 2;

  return (
    <div className="min-w-0">
      <p
        className={cn(
          "text-display transition-colors duration-500",
          size === "lead" ? "text-[38px] sm:text-[46px]" : "text-[26px]",
          score === 0 ? "text-ink-faint" : elevated ? "text-warn" : "text-ink"
        )}
      >
        {score === 0 ? "—" : BANDS[band]}
      </p>

      {/* Four segments, filling as the weighting resolves */}
      <div className="mt-3.5 flex gap-1.5" aria-hidden>
        {BANDS.map((_, i) => {
          const filled = score > 0 && i <= band;
          return (
            <motion.span
              key={i}
              initial={false}
              animate={{ opacity: filled ? 1 : 0.25 }}
              transition={{ duration: 0.3, delay: filled ? i * 0.06 : 0 }}
              className={cn(
                "h-1 flex-1 rounded-full",
                filled
                  ? elevated
                    ? "bg-warn"
                    : "bg-graphite"
                  : "bg-mineral-deep"
              )}
            />
          );
        })}
      </div>

      {note ? (
        <p className="mt-3.5 text-[14px] leading-relaxed text-ink-soft">
          {note}
        </p>
      ) : null}
    </div>
  );
}

/* ── Actions ───────────────────────────────────────────────────── */

export const primaryAction = cn(
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-[6px] bg-ink px-6",
  "text-[15px] font-medium text-page",
  "transition-[transform,background-color] duration-150",
  "hover:bg-graphite active:scale-[0.985]"
);

export const quietAction = cn(
  "inline-flex h-12 items-center justify-center rounded-[6px] px-4",
  "text-[15px] text-ink-soft transition-colors duration-150 hover:text-ink"
);
