import { Section } from "@/components/dashboard/page-intro";
import { demoMatches } from "@/lib/demo/scan-data";
import type { Confidence } from "@/lib/scan/types";
import { cn, formatNumber } from "@/lib/utils";

import { confidenceMeta, confidenceOrder } from "./conventions";

const text = {
  title: "Matches by confidence",
  /* The review queue is a slice of the total detections — say so. */
  description: (queued: number) =>
    `${formatNumber(queued)} matches are in the review queue right now, graded before you see them.`,
  chartLabel: (parts: string) => `Review queue by confidence: ${parts}`,
} as const;

const counts: Record<Confidence, number> = { high: 0, medium: 0, low: 0 };
for (const match of demoMatches) counts[match.confidence] += 1;

const total = demoMatches.length;

const segments = confidenceOrder.map((confidence) => {
  const count = counts[confidence];
  return {
    confidence,
    count,
    share: total > 0 ? (count / total) * 100 : 0,
    meta: confidenceMeta[confidence],
  };
});

/**
 * One segmented proportion bar plus an exact legend. The bar is the
 * shape of the queue; the legend carries the numbers, so colour is
 * never the only thing communicating.
 */
export function ConfidenceSplit() {
  const summary = segments
    .map((segment) => `${segment.meta.label} ${segment.count}`)
    .join(", ");

  return (
    <Section title={text.title} description={text.description(total)}>
      <div className="border-t border-edge-strong pt-5">
        <div
          role="img"
          aria-label={text.chartLabel(summary)}
          className="flex h-2.5 w-full overflow-hidden rounded-full bg-mineral"
        >
          {segments.map((segment) => (
            <span
              key={segment.confidence}
              className={cn("h-full", segment.meta.fill)}
              style={{ width: `${segment.share}%` }}
            />
          ))}
        </div>

        <ul className="mt-4">
          {segments.map((segment) => (
            <li
              key={segment.confidence}
              className="flex items-center gap-3 border-b border-edge-faint py-2.5 last:border-b-0"
            >
              <span
                aria-hidden
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  segment.meta.fill
                )}
              />
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                {segment.meta.label}
              </span>
              <span className="tabular shrink-0 text-sm text-ink">
                {formatNumber(segment.count)}
              </span>
              <span className="tabular w-11 shrink-0 text-right text-data text-ink-soft">
                {Math.round(segment.share)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
