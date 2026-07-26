import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge has to be told about our own utilities.
 *
 * Left to its defaults it reads `text-display`, `text-figure` and the
 * rest as font-size classes, so `cn("text-figure", "text-[58px]")`
 * silently DROPS the first one — taking the weight, tracking and
 * leading with it. They live in their own group instead: they only
 * conflict with each other, never with a size or a colour.
 */
const twMerge = extendTailwindMerge<"argus-type">({
  extend: {
    classGroups: {
      "argus-type": [
        "text-display",
        "text-title",
        "text-subject",
        "text-figure",
        "text-label",
        "text-label-scan",
        "text-data",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number with compact notation: 12400 → "12.4K" */
export function formatCompact(value: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatNumber(value: number): string {
  return Intl.NumberFormat("en-US").format(value);
}

/** "2026-07-21T09:24:00Z" → "Jul 21, 09:24" (UTC, SSR-stable) */
export function formatDateTimeUTC(iso: string): string {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** "2026-07-21T…" → "Jul 21" (UTC, SSR-stable) */
export function formatDateUTC(iso: string): string {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Relative time against the demo anchor, SSR-stable. */
export function formatRelative(iso: string, nowIso: string): string {
  const diffMin = Math.round(
    (new Date(nowIso).getTime() - new Date(iso).getTime()) / 60_000
  );
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "yesterday";
  if (diffD < 7) return `${diffD}d ago`;
  return formatDateUTC(iso);
}

/** "2026-07-24T…" → "24 July 2026" — how a file is dated. */
export function formatLongDateUTC(iso: string): string {
  return Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function initials(name: string): string {
  return name
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
