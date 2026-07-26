import type { BadgeProps } from "@/components/ui/badge";
import { copy } from "@/config/product";
import type { DemoProfile, TakedownStatus } from "@/lib/demo/scan-data";
import type { Confidence } from "@/lib/scan/types";

/* ════════════════════════════════════════════════════════════════
   Shared reading conventions for the Overview blocks.

   Confidence, takedown status and exposure always resolve to the
   same label and the same tone, whichever block renders them — so
   a colour means one thing across the whole workspace.
   ════════════════════════════════════════════════════════════════ */

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

export const confidenceMeta: Record<
  Confidence,
  { label: string; variant: BadgeVariant; fill: string }
> = {
  high: { label: "High confidence", variant: "warn", fill: "bg-warn" },
  medium: { label: "Possible match", variant: "accent", fill: "bg-accent" },
  low: { label: "Low confidence", variant: "neutral", fill: "bg-ink-faint" },
};

/** Ordered high → low, the order the queue is worked in. */
export const confidenceOrder: readonly Confidence[] = ["high", "medium", "low"];

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

/** Lifecycle order: drafted through to a resolved outcome. */
export const takedownOrder: readonly TakedownStatus[] = [
  "drafted",
  "submitted",
  "acknowledged",
  "removed",
  "rejected",
];

export const exposureMeta: Record<
  DemoProfile["exposure"],
  { label: string; variant: BadgeVariant }
> = {
  low: { label: copy.scanner.exposure.low, variant: "ok" },
  moderate: { label: copy.scanner.exposure.moderate, variant: "neutral" },
  elevated: { label: copy.scanner.exposure.elevated, variant: "warn" },
  high: { label: copy.scanner.exposure.high, variant: "crit" },
};
