import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number with compact notation: 12400 → "12.4k" */
export function formatCompact(value: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Format a signed delta as a percentage string: 0.124 → "+12.4%" */
export function formatDelta(ratio: number): string {
  const pct = (ratio * 100).toFixed(1);
  return ratio >= 0 ? `+${pct}%` : `${pct}%`;
}

export function formatNumber(value: number): string {
  return Intl.NumberFormat("en-US").format(value);
}

/** "2026-07-21T09:24:00Z" → "Jul 21, 09:24" (stable across server/client) */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(d);
}

export function formatDate(iso: string): string {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Relative time against the demo "now" anchor, stable for SSR. */
export function formatRelative(iso: string, nowIso: string): string {
  const then = new Date(iso).getTime();
  const now = new Date(nowIso).getTime();
  const diffMin = Math.round((now - then) / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "yesterday";
  if (diffD < 7) return `${diffD}d ago`;
  return formatDate(iso);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
