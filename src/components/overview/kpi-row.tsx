"use client";

import { AnimatedNumber } from "@/components/halo/animated-number";
import { HaloField } from "@/components/halo/halo-field";
import { Badge } from "@/components/ui/badge";
import { getMetrics } from "@/lib/data";
import { cn, formatCompact, formatDelta, formatNumber } from "@/lib/utils";

/** Which metric drives the main overview chart. */
export type KpiKey = "signals" | "response" | "automation" | "opportunity";

const metrics = getMetrics();

interface KpiTile {
  key: KpiKey;
  label: string;
  value: number;
  format: (v: number) => string;
  /** Signed ratio vs last week; null when no week-over-week figure exists. */
  delta: number | null;
  /** A falling number is the good direction for this metric. */
  lowerIsBetter?: boolean;
  /** Shown instead of the delta badge when delta is null. */
  auxBadge?: string;
  caption: string;
}

const tiles: KpiTile[] = [
  {
    key: "signals",
    label: "Active signals",
    value: metrics.activeSignals,
    format: (v) => Math.round(v).toString(),
    delta:
      (metrics.activeSignals - metrics.activeSignalsPrev) /
      metrics.activeSignalsPrev,
    caption: "vs last week",
  },
  {
    key: "response",
    label: "Median response",
    value: metrics.medianResponseHours,
    format: (v) => `${v.toFixed(1)}h`,
    delta:
      (metrics.medianResponseHours - metrics.medianResponseHoursPrev) /
      metrics.medianResponseHoursPrev,
    lowerIsBetter: true,
    caption: "vs last week",
  },
  {
    key: "automation",
    label: "Automation success",
    value: metrics.automationSuccessRate,
    format: (v) => `${v.toFixed(1)}%`,
    delta: null,
    auxBadge: `${formatNumber(metrics.automationRunsThisWeek)} runs`,
    caption: "this week",
  },
  {
    key: "opportunity",
    label: "Opportunity value",
    value: metrics.opportunityValue,
    format: (v) => `$${formatCompact(Math.round(v))}`,
    delta:
      (metrics.opportunityValue - metrics.opportunityValuePrev) /
      metrics.opportunityValuePrev,
    caption: "vs last week",
  },
];

function deltaBadge(tile: KpiTile) {
  if (tile.delta === null) {
    return <Badge variant="halo">{tile.auxBadge}</Badge>;
  }
  const improving = tile.lowerIsBetter ? tile.delta < 0 : tile.delta > 0;
  return (
    <Badge variant={tile.delta === 0 ? "neutral" : improving ? "positive" : "critical"}>
      {formatDelta(tile.delta)}
    </Badge>
  );
}

/**
 * Interactive KPI tiles. Selecting a tile switches the series shown
 * by the main overview chart; the selected tile carries a quiet
 * halo bloom and a cyan edge.
 */
export function KpiRow({
  selected,
  onSelect,
}: {
  selected: KpiKey;
  onSelect: (key: KpiKey) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Key metrics — select one to change the chart below"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {tiles.map((tile) => {
        const active = tile.key === selected;
        return (
          <button
            key={tile.key}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(tile.key)}
            className={cn(
              "surface-card relative overflow-hidden rounded-lg p-4 text-left",
              "cursor-pointer transition-colors duration-200",
              active
                ? "border-halo-500/40 ring-1 ring-halo-500/25"
                : "hover:bg-lifted"
            )}
          >
            {active ? <HaloField x={72} y={16} strength={0.1} /> : null}
            <div className="relative">
              <span className="text-label block">{tile.label}</span>
              <AnimatedNumber
                value={tile.value}
                format={tile.format}
                className="tabular mt-2 block text-2xl font-semibold text-ink sm:text-[1.75rem]"
              />
              <span className="mt-2.5 flex items-center gap-1.5">
                {deltaBadge(tile)}
                <span className="text-2xs text-ink-faint">{tile.caption}</span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
