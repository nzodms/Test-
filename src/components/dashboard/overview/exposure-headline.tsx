import { Reveal } from "@/components/motion/reveal";
import { Surface } from "@/components/primitives/surface";
import { ActivityChart } from "@/components/scanner/activity-chart";
import { ExposureMeter } from "@/components/primitives/exposure-meter";
import { activitySeries, exposureLevel, scanTotals } from "@/lib/demo/scan-data";
import { formatNumber } from "@/lib/utils";

/* Strings this block needs that the shared copy file doesn't carry. */
const text = {
  reading: "Exposure reading",
  outOf: "out of 100",
  basis:
    "Weighted from match volume, how confident each detection is, and how many separate sources carry the content.",
  activity: "Detection activity",
  weeks: (count: number) => `${count} weeks`,
  headline: (matches: number, sources: number, fresh: number) =>
    `${formatNumber(matches)} potential matches across ${formatNumber(
      sources
    )} indexed sources. ${formatNumber(
      fresh
    )} of them were detected in the last seven days.`,
  trendFlat: (value: number) => `Detections held at ${value} last week.`,
  trend: (from: number, to: number) =>
    `Detections ${to > from ? "rose" : "fell"} from ${from} to ${to} last week.`,
  noTrend: "Not enough history yet to read a trend.",
} as const;

/**
 * The block the workspace opens with: one reading of where the
 * profile stands, and one reading of which way it is moving. Both
 * sentences are composed from the same series the scan produced —
 * nothing here is written by hand.
 */
export function ExposureHeadline() {
  const last = activitySeries[activitySeries.length - 1];
  const previous = activitySeries[activitySeries.length - 2];

  const trend =
    last && previous
      ? previous.detections === last.detections
        ? text.trendFlat(last.detections)
        : text.trend(previous.detections, last.detections)
      : text.noTrend;

  return (
    <Reveal>
      <Surface tone="paper" className="overflow-hidden rounded-lg">
        <div className="grid gap-px bg-edge-faint lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1fr)]">
          {/* Where things stand */}
          <div className="min-w-0 bg-paper p-5 sm:p-7">
            <h2 className="text-label">{text.reading}</h2>

            <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="tabular text-4xl font-medium leading-none tracking-tight text-ink">
                {exposureLevel.score}
              </span>
              <span className="text-sm text-ink-soft">{text.outOf}</span>
            </div>

            <div className="mt-6 max-w-sm">
              <ExposureMeter score={exposureLevel.score} />
            </div>

            <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-ink">
              {text.headline(
                scanTotals.matches,
                scanTotals.sources,
                scanTotals.newThisWeek
              )}
            </p>
            <p className="mt-2 max-w-[52ch] text-[13px] leading-relaxed text-ink-soft">
              {text.basis}
            </p>
          </div>

          {/* Which way it is moving */}
          <div className="min-w-0 bg-paper p-5 sm:p-7">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-label">{text.activity}</h2>
              <span className="shrink-0 text-data text-ink-soft">
                {text.weeks(activitySeries.length)}
              </span>
            </div>

            <div className="mt-5 h-[110px] w-full">
              <ActivityChart
                data={activitySeries}
                draw
                tone="light"
                height={110}
              />
            </div>

            <p className="mt-5 text-[13px] leading-relaxed text-ink-soft">
              {trend}
            </p>
          </div>
        </div>
      </Surface>
    </Reveal>
  );
}
