import { Badge } from "@/components/ui/badge";
import { demoProfiles, scanTotals } from "@/lib/demo/scan-data";
import { formatDateTimeUTC, formatNumber } from "@/lib/utils";

import { LAST_SCAN_AT, NEXT_SCAN_AT } from "./workspace-meta";

const text = {
  label: "Monitoring status",
  active: "Active",
  title: "Watching continues after the first scan",
  body: "Every monitored profile is re-scanned on the schedule below. Each result is compared against your detection history and graded before it reaches you.",
  scope: (profiles: number, sources: number) =>
    `${formatNumber(profiles)} profiles watched · ${formatNumber(sources)} indexed sources in scope`,
  lastPass: "Last pass",
  nextScan: "Next scan",
  utc: "UTC",
} as const;

/**
 * The first thing the page states: monitoring is running, when it
 * last ran, when it runs next. Both timestamps derive from the demo
 * anchor, so the workspace reads the same on the server and in the
 * browser.
 */
export function MonitoringStatus() {
  return (
    <div className="overflow-hidden rounded-lg border border-edge bg-paper shadow-hairline">
      <div className="grid gap-px bg-edge-faint sm:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="bg-paper p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-label">{text.label}</p>
            <Badge variant="ok" dot>
              {text.active}
            </Badge>
          </div>

          <h2 className="text-title mt-3 text-base text-ink sm:text-lg">
            {text.title}
          </h2>
          <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-ink-soft">
            {text.body}
          </p>
          <p className="mt-4 text-2xs text-ink-soft">
            {text.scope(demoProfiles.length, scanTotals.sources)}
          </p>
        </div>

        <dl className="bg-paper p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3 border-b border-edge-faint pb-3">
            <dt className="text-2xs text-ink-soft">{text.lastPass}</dt>
            <dd className="text-data text-ink-soft">
              {formatDateTimeUTC(LAST_SCAN_AT)} {text.utc}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 pt-3">
            <dt className="text-2xs text-ink-soft">{text.nextScan}</dt>
            <dd className="text-data text-ink">
              {formatDateTimeUTC(NEXT_SCAN_AT)} {text.utc}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
