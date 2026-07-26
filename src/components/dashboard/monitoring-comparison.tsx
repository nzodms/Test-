import { Metric } from "@/components/primitives";
import { ActivityChart } from "@/components/scanner/activity-chart";
import { activitySeries, scanTotals } from "@/lib/demo/scan-data";
import { formatNumber } from "@/lib/utils";

const latest = activitySeries[activitySeries.length - 1];
const previous = activitySeries[activitySeries.length - 2];
const first = activitySeries[0];

const latestDetections = latest?.detections ?? 0;
const previousDetections = previous?.detections ?? 0;
const latestRecurrences = latest?.recurrences ?? 0;

const change =
  previousDetections > 0
    ? Math.round(
        ((latestDetections - previousDetections) / previousDetections) * 100
      )
    : null;

const text = {
  weekAxis: (week: string | undefined) => week ?? "",
  latestWeek: "This week",
  events: "Events, latest week",
  eventsHint: (week: string | undefined) => `Week ${week ?? ""}`,
  change: (week: string | undefined) => `Change vs. ${week ?? "the week before"}`,
  changeHint: (count: number, week: string | undefined) =>
    `${formatNumber(count)} events in ${week ?? "the week before"}`,
  changeUnknown: "—",
  recurrences: "Recurrence signals",
  recurrencesHint: "Repeat sightings this week",
  note: (newMatches: number) =>
    `An event is a single sighting, including repeat sightings of content already in your queue. ${formatNumber(newMatches)} of this week's events were new matches.`,
} as const;

function changeLabel(): string {
  if (change === null) return text.changeUnknown;
  return change > 0 ? `+${change}%` : `${change}%`;
}

/**
 * The week that just closed, read against the seven before it. The
 * line carries the shape; the three figures underneath say what the
 * shape means, so neither has to do both jobs.
 */
export function MonitoringComparison() {
  return (
    <div className="rounded-lg border border-edge bg-paper p-4 shadow-hairline sm:p-5">
      <div className="h-[140px] w-full">
        <ActivityChart
          data={activitySeries}
          draw
          tone="light"
          height={140}
        />
      </div>

      <div className="mt-1 flex items-baseline justify-between gap-3">
        <span className="text-data text-ink-soft">
          {text.weekAxis(first?.week)}
        </span>
        <span className="text-data text-ink-soft">
          {text.weekAxis(latest?.week)} · {text.latestWeek}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 divide-y divide-edge-faint border-t border-edge sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Metric
          tone="light"
          label={text.events}
          value={formatNumber(latestDetections)}
          hint={text.eventsHint(latest?.week)}
          className="py-4 sm:pr-4"
        />
        <Metric
          tone="light"
          label={text.change(previous?.week)}
          value={changeLabel()}
          hint={text.changeHint(previousDetections, previous?.week)}
          className="py-4 sm:px-4"
        />
        <Metric
          tone="light"
          label={text.recurrences}
          value={formatNumber(latestRecurrences)}
          hint={text.recurrencesHint}
          className="py-4 sm:pl-4"
        />
      </div>

      <p className="mt-1 border-t border-edge pt-3 text-2xs leading-relaxed text-ink-soft">
        {text.note(scanTotals.newThisWeek)}
      </p>
    </div>
  );
}
