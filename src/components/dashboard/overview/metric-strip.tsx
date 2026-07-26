import { Reveal } from "@/components/motion/reveal";
import { Metric } from "@/components/primitives";
import { copy } from "@/config/product";
import { scanTotals } from "@/lib/demo/scan-data";
import { cn, formatNumber } from "@/lib/utils";

const text = {
  newThisWeek: "New this week",
  hints: {
    matches: "Across every indexed source",
    highConfidence: "Very likely your content",
    sources: "Distinct sources carrying a match",
    newThisWeek: "Detected in the last seven days",
  },
} as const;

const readings = [
  {
    label: copy.scanner.kpis.matches,
    value: scanTotals.matches,
    hint: text.hints.matches,
    emphasis: true,
  },
  {
    label: copy.scanner.kpis.highConfidence,
    value: scanTotals.highConfidence,
    hint: text.hints.highConfidence,
    emphasis: false,
  },
  {
    label: copy.scanner.kpis.sources,
    value: scanTotals.sources,
    hint: text.hints.sources,
    emphasis: false,
  },
  {
    label: text.newThisWeek,
    value: scanTotals.newThisWeek,
    hint: text.hints.newThisWeek,
    emphasis: false,
  },
];

/**
 * Hairline cells that share one rule — the totals read as a single
 * instrument strip rather than four floating cards. The leading
 * figure carries the weight; the rest stay at reading size.
 */
function cellClass(index: number): string {
  const startsMobileRow = index % 2 === 0;
  return cn(
    "min-w-0 py-5 pr-4 sm:pr-5",
    startsMobileRow ? "pl-0" : "border-l border-edge-faint pl-4",
    index === 0
      ? "sm:border-l-0 sm:pl-0"
      : "sm:border-l sm:border-edge-faint sm:pl-5",
    index >= 2 && "border-t border-edge-faint sm:border-t-0"
  );
}

export function MetricStrip() {
  return (
    <Reveal delay={0.06}>
      <div className="grid grid-cols-2 border-y border-edge sm:grid-cols-4">
        {readings.map((reading, index) => (
          <div key={reading.label} className={cellClass(index)}>
            <Metric
              tone="light"
              emphasis={reading.emphasis}
              label={reading.label}
              value={formatNumber(reading.value)}
              hint={reading.hint}
            />
          </div>
        ))}
      </div>
    </Reveal>
  );
}
