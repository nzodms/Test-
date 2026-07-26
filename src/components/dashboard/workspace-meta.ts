import type { BadgeProps } from "@/components/ui/badge";
import { copy } from "@/config/product";
import type { DemoProfile, TakedownStatus } from "@/lib/demo/scan-data";
import { DEMO_ANCHOR, sourceCoverage } from "@/lib/demo/scan-data";
import type { Confidence, SourceKind } from "@/lib/scan/types";

/* ════════════════════════════════════════════════════════════════
   Reading conventions for the Monitoring, Takedowns, Profiles and
   Settings workspaces.

   Confidence, takedown status and exposure resolve to one label and
   one tone wherever they appear, so a colour keeps meaning the same
   thing across the whole workspace.

   NOTE ON CLASS NAMES — `text-data`, `text-title` and `text-label`
   are project utilities that tailwind-merge reads as text classes,
   so passing one through `cn()` beside a `text-*` colour silently
   drops one of the two. Elements needing both take a plain string.
   ════════════════════════════════════════════════════════════════ */

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

export const confidenceMeta: Record<
  Confidence,
  { label: string; variant: BadgeVariant }
> = {
  high: { label: "High confidence", variant: "warn" },
  medium: { label: "Possible match", variant: "accent" },
  low: { label: "Low confidence", variant: "neutral" },
};

export const takedownMeta: Record<
  TakedownStatus,
  { label: string; variant: BadgeVariant }
> = {
  drafted: { label: "Drafted", variant: "neutral" },
  submitted: { label: "Submitted", variant: "accent" },
  acknowledged: { label: "Acknowledged", variant: "warn" },
  removed: { label: "Removed", variant: "ok" },
  rejected: { label: "Rejected", variant: "crit" },
};

/** The path a request travels when it ends in removal. */
export const takedownPipeline: readonly TakedownStatus[] = [
  "drafted",
  "submitted",
  "acknowledged",
  "removed",
];

/** Requests still moving, and requests that have stopped. */
export const openStatuses: readonly TakedownStatus[] = [
  "drafted",
  "submitted",
  "acknowledged",
];
export const closedStatuses: readonly TakedownStatus[] = ["removed", "rejected"];

export const exposureMeta: Record<
  DemoProfile["exposure"],
  { label: string; variant: BadgeVariant }
> = {
  low: { label: copy.scanner.exposure.low, variant: "ok" },
  moderate: { label: copy.scanner.exposure.moderate, variant: "neutral" },
  elevated: { label: copy.scanner.exposure.elevated, variant: "warn" },
  high: { label: copy.scanner.exposure.high, variant: "crit" },
};

/** Meter reading per exposure band — one score per named level. */
export const exposureScore: Record<DemoProfile["exposure"], number> = {
  low: 22,
  moderate: 48,
  elevated: 68,
  high: 86,
};

const coverageLabels = new Map<SourceKind, string>(
  sourceCoverage.map((entry) => [entry.kind, entry.label] as const)
);

/** Category names read from the coverage dataset so they can't drift. */
export const sourceLabels: Record<SourceKind, string> = {
  website: coverageLabels.get("website") ?? "Public websites",
  forum: coverageLabels.get("forum") ?? "Forums",
  mirror: coverageLabels.get("mirror") ?? "Indexed mirrors",
  channel: coverageLabels.get("channel") ?? "Public channels",
  archive: coverageLabels.get("archive") ?? "Archived pages",
};

/* ── Schedule clock ────────────────────────────────────────────────
   Every timestamp in the demo is derived from the anchor, never from
   the machine clock: the workspace must render identically on the
   server and in the browser, today and next month. */

function shiftIso(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 3_600_000)
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");
}

/** The pass that produced the data on screen. */
export const LAST_SCAN_AT = shiftIso(DEMO_ANCHOR, -4);

/** The next scheduled pass — 04:00 UTC the following day. */
export const NEXT_SCAN_AT = shiftIso(DEMO_ANCHOR, 11.5);
