import * as React from "react";

import { sourceCoverage } from "@/lib/demo/scan-data";
import type { Confidence, MatchState, SourceKind } from "@/lib/scan/types";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   Shared vocabulary for the Findings and Sources workspaces.

   Both pages read the same demo dataset and must speak about it in
   exactly the same words: a "high confidence" finding is labelled
   identically whether it appears in the review queue or under the
   domain that hosts it.

   NOTE ON CLASS NAMES — `text-data`, `text-title` and `text-label`
   are project utilities that tailwind-merge classifies as text
   classes, so passing them through `cn()` next to a `text-*` colour
   silently drops one of the two. Elements that need both are given
   a plain string className instead of a merged one.
   ════════════════════════════════════════════════════════════════ */

export const SOURCE_KINDS: readonly SourceKind[] = [
  "website",
  "forum",
  "mirror",
  "channel",
  "archive",
];

const coverageLabels = new Map<SourceKind, string>(
  sourceCoverage.map((entry) => [entry.kind, entry.label] as const)
);

/** Category names, taken from the coverage dataset so they can't drift. */
export const sourceLabels: Record<SourceKind, string> = {
  website: coverageLabels.get("website") ?? "Public websites",
  forum: coverageLabels.get("forum") ?? "Forums",
  mirror: coverageLabels.get("mirror") ?? "Indexed mirrors",
  channel: coverageLabels.get("channel") ?? "Public channels",
  archive: coverageLabels.get("archive") ?? "Archived pages",
};

/** Singular and lowercase — for use inside sentences. */
export const sourceSingular: Record<SourceKind, string> = {
  website: "public website",
  forum: "forum",
  mirror: "indexed mirror",
  channel: "public channel",
  archive: "archived page",
};

/* ── Badge conventions (light environment) ─────────────────────── */

export const confidenceMeta: Record<
  Confidence,
  { variant: "warn" | "accent" | "neutral"; label: string }
> = {
  high: { variant: "warn", label: "High confidence" },
  medium: { variant: "accent", label: "Possible match" },
  low: { variant: "neutral", label: "Low confidence" },
};

export const stateMeta: Record<
  MatchState,
  { variant: "outline" | "accent" | "ok"; label: string }
> = {
  possible: { variant: "outline", label: "Possible" },
  review: { variant: "accent", label: "In review" },
  confirmed: { variant: "ok", label: "Confirmed" },
};

const CONFIDENCE_RANK: Record<Confidence, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export function confidenceRank(confidence: Confidence): number {
  return CONFIDENCE_RANK[confidence];
}

/* ── Proportion bar ────────────────────────────────────────────────
   One bar, one hue, five steps of lightness. Five different colours
   would read as five unrelated things; a lightness ramp reads as one
   quantity split into parts — which is what it is. */

const SEGMENT_TONES: readonly string[] = [
  "bg-ink/82",
  "bg-ink/62",
  "bg-ink/46",
  "bg-ink/30",
  "bg-ink/18",
];

export function segmentTone(index: number): string {
  return SEGMENT_TONES[index % SEGMENT_TONES.length] ?? "bg-ink/40";
}

export interface ProportionSegment {
  key: string;
  label: string;
  count: number;
  /** integer percent — shares always add up to exactly 100 */
  percent: number;
  tone: string;
}

/**
 * Percent shares that sum to exactly 100 (largest-remainder method).
 * Naive rounding on 12/7/8/4/3 of 34 produces 101%, which is the
 * kind of detail this product cannot afford to get wrong.
 */
export function largestRemainderShares(counts: readonly number[]): number[] {
  const total = counts.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return counts.map(() => 0);

  const exact = counts.map((value) => (value / total) * 100);
  const shares = exact.map((value) => Math.floor(value));
  let remainder = 100 - shares.reduce((sum, value) => sum + value, 0);

  const byFraction = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  for (const entry of byFraction) {
    if (remainder <= 0) break;
    const current = shares[entry.index];
    if (current === undefined) continue;
    shares[entry.index] = current + 1;
    remainder -= 1;
  }

  return shares;
}

export function buildSegments<T extends { key: string; label: string; count: number }>(
  input: readonly T[]
): ProportionSegment[] {
  const shares = largestRemainderShares(input.map((entry) => entry.count));
  return input.map((entry, index) => ({
    key: entry.key,
    label: entry.label,
    count: entry.count,
    percent: shares[index] ?? 0,
    tone: segmentTone(index),
  }));
}

export function segmentsSummary(segments: readonly ProportionSegment[]): string {
  return segments
    .map((segment) => `${segment.label} ${segment.count} (${segment.percent}%)`)
    .join(", ");
}

export function ProportionBar({
  segments,
  ariaLabel,
  className,
}: {
  segments: readonly ProportionSegment[];
  ariaLabel: string;
  className?: string;
}) {
  const visible = segments.filter((segment) => segment.count > 0);
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "flex h-2.5 w-full gap-px overflow-hidden rounded-full bg-mineral-deep",
        className
      )}
    >
      {visible.map((segment) => (
        <span
          key={segment.key}
          className={cn("h-full", segment.tone)}
          style={{ width: `${segment.percent}%` }}
        />
      ))}
    </div>
  );
}

export function LegendSwatch({ tone }: { tone: string }) {
  return (
    <span
      aria-hidden
      className={cn("size-2.5 shrink-0 rounded-xs", tone)}
    />
  );
}
