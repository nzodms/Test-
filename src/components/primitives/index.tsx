"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   Proprietary primitives for Argus. These carry the product's
   visual grammar: registry rows, metrics, statuses, masked content,
   source badges, timeline entries, progress rail. All are context-
   aware (light environment vs. black-glass scanner) via `tone`.
   ════════════════════════════════════════════════════════════════ */

/* ── StatusIndicator ───────────────────────────────────────────── */

export type IndicatorStatus =
  | "pending"
  | "active"
  | "complete"
  | "warning"
  | "critical";

export function StatusIndicator({
  status,
  className,
}: {
  status: IndicatorStatus;
  className?: string;
}) {
  if (status === "active") {
    return (
      <span className={cn("relative flex size-2.5 items-center justify-center", className)}>
        <span className="absolute size-2.5 animate-pulse-quiet rounded-full bg-accent-bright/40" />
        <span className="size-1.5 rounded-full bg-accent-bright" />
      </span>
    );
  }
  if (status === "complete") {
    return (
      <span className={cn("flex size-2.5 items-center justify-center", className)}>
        <svg viewBox="0 0 10 10" className="size-2.5 text-ok-bright" aria-hidden>
          <path
            d="M1.5 5.2 4 7.5 8.5 2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  const color =
    status === "warning"
      ? "bg-warn-bright"
      : status === "critical"
        ? "bg-crit-bright"
        : "bg-scan-faint";
  return (
    <span className={cn("flex size-2.5 items-center justify-center", className)}>
      <span className={cn("size-1.5 rounded-full", color)} />
    </span>
  );
}

/* ── DataRow — a ledger/registry line ──────────────────────────── */

export function DataRow({
  status,
  label,
  meta,
  trailing,
  mono = false,
  className,
}: {
  status?: IndicatorStatus;
  label: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2 text-scan-ink",
        className
      )}
    >
      {status ? <StatusIndicator status={status} /> : null}
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[13px]",
          mono && "text-data"
        )}
      >
        {label}
      </span>
      {meta ? (
        <span className="shrink-0 text-data text-scan-faint">{meta}</span>
      ) : null}
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </div>
  );
}

/* ── Metric ────────────────────────────────────────────────────── */

export function Metric({
  label,
  value,
  hint,
  tone = "scan",
  emphasis = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "scan" | "light";
  emphasis?: boolean;
  className?: string;
}) {
  const dark = tone === "scan";
  return (
    <div className={cn("min-w-0", className)}>
      <p className={cn("truncate text-2xs", dark ? "text-scan-faint" : "text-ink-soft")}>
        {label}
      </p>
      <p
        className={cn(
          "tabular mt-1 tracking-tight",
          emphasis ? "text-3xl font-semibold" : "text-xl font-medium",
          dark
            ? emphasis
              ? "text-accent-bright"
              : "text-scan-ink"
            : "text-ink"
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className={cn("mt-0.5 text-2xs", dark ? "text-scan-soft" : "text-ink-soft")}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* ── SourceBadge ───────────────────────────────────────────────── */

const SOURCE_GLYPH: Record<string, string> = {
  website: "WEB",
  forum: "FRM",
  mirror: "MIR",
  channel: "CHN",
  archive: "ARC",
};

export function SourceBadge({
  kind,
  label,
  tone = "scan",
}: {
  kind: keyof typeof SOURCE_GLYPH | string;
  label?: string;
  tone?: "scan" | "light";
}) {
  const glyph = SOURCE_GLYPH[kind] ?? kind.slice(0, 3).toUpperCase();
  const dark = tone === "scan";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs border px-1.5 py-0.5 text-data",
        dark
          ? "border-scan-edge-strong bg-scan-high text-scan-soft"
          : "border-edge bg-mineral text-ink-soft"
      )}
    >
      <span className={cn("font-semibold", dark ? "text-scan-ink" : "text-ink")}>
        {glyph}
      </span>
      {label ? <span className="opacity-80">{label}</span> : null}
    </span>
  );
}

/* ── MaskedContent — selective lock ────────────────────────────── */

/**
 * Wraps sensitive content, blurs it, and removes it from the
 * accessibility tree + tab order (inert). Non-sensitive siblings
 * stay fully legible — the lock is selective, never a full-screen
 * curtain.
 *
 * `showLock` is off by default on purpose: repeating a padlock on
 * every masked item turns the lock into wallpaper. State the lock
 * once per region instead, and let the blur carry the rest.
 */
export function MaskedContent({
  locked,
  intensity = "soft",
  children,
  label = "Locked until verification",
  showLock = false,
  className,
}: {
  locked: boolean;
  intensity?: "soft" | "hard";
  children: React.ReactNode;
  label?: string;
  showLock?: boolean;
  className?: string;
}) {
  if (!locked) return <>{children}</>;
  return (
    <span
      className={cn("relative inline-flex items-center", className)}
      title={label}
    >
      <span
        aria-hidden
        inert
        className={intensity === "soft" ? "masked-soft" : "masked-hard"}
      >
        {children}
      </span>
      {showLock ? (
        <Lock
          className="pointer-events-none absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 text-scan-soft"
          aria-hidden
        />
      ) : null}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/* ── TimelineEntry ─────────────────────────────────────────────── */

export function TimelineEntry({
  index,
  active,
  complete,
  name,
  children,
  last = false,
}: {
  index: number;
  active?: boolean;
  complete?: boolean;
  name: string;
  children?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-4 pb-8 last:pb-0">
      {!last ? (
        <span
          aria-hidden
          className={cn(
            "absolute left-[13px] top-7 h-[calc(100%-1rem)] w-px",
            complete ? "bg-accent/40" : "bg-edge"
          )}
        />
      ) : null}
      <span
        className={cn(
          "relative z-10 flex size-[26px] shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular",
          active
            ? "border-accent bg-accent text-[#f6fbfb]"
            : complete
              ? "border-accent/40 bg-accent-tint text-accent-deep"
              : "border-edge-strong bg-paper text-ink-faint"
        )}
      >
        {String(index).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p
          className={cn(
            "text-title text-[15px]",
            active || complete ? "text-ink" : "text-ink-soft"
          )}
        >
          {name}
        </p>
        {children ? (
          <div className="mt-1 text-sm leading-relaxed text-ink-soft">
            {children}
          </div>
        ) : null}
      </div>
    </li>
  );
}

/* ── ProgressRail — stepwise, not a 0-100 bar ──────────────────── */

export function ProgressRail({
  total,
  current,
  tone = "light",
  className,
}: {
  total: number;
  current: number;
  tone?: "light" | "scan";
  className?: string;
}) {
  const dark = tone === "scan";
  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`Step ${current} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        return (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              done
                ? dark
                  ? "bg-accent-bright"
                  : "bg-accent"
                : dark
                  ? "bg-scan-high"
                  : "bg-mineral-deep"
            )}
          />
        );
      })}
    </div>
  );
}
