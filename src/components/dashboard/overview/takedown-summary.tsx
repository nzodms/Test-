import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Section } from "@/components/dashboard/page-intro";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/navigation";
import { DEMO_ANCHOR, demoTakedowns } from "@/lib/demo/scan-data";
import type { TakedownStatus } from "@/lib/demo/scan-data";
import { formatNumber, formatRelative } from "@/lib/utils";

import { takedownMeta, takedownOrder } from "./conventions";

const text = {
  title: "Takedown status",
  description: (total: number) =>
    `${formatNumber(total)} removal requests recorded for this profile.`,
  viewAll: "View takedowns",
  requests: "requests",
  lastUpdate: (relative: string) => `Last status change ${relative}`,
} as const;

const counts: Record<TakedownStatus, number> = {
  drafted: 0,
  submitted: 0,
  acknowledged: 0,
  removed: 0,
  rejected: 0,
};
for (const takedown of demoTakedowns) counts[takedown.status] += 1;

const lastUpdatedAt = demoTakedowns.reduce<string | null>(
  (latest, takedown) =>
    latest === null || takedown.updatedAt > latest ? takedown.updatedAt : latest,
  null
);

/**
 * A quiet well: every request the profile has, read by the stage it
 * reached. Counts stay honest — a stage with nothing in it still
 * shows, so the pipeline never looks shorter than it is.
 */
export function TakedownSummary() {
  return (
    <Section
      title={text.title}
      description={text.description(demoTakedowns.length)}
      actions={
        <Link
          href={routes.takedowns}
          className="group inline-flex min-h-[44px] items-center gap-1.5 rounded-xs text-[13px] text-ink-soft transition-colors hover:text-ink sm:min-h-0"
        >
          {text.viewAll}
          <ChevronRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      }
    >
      <div className="surface-mineral rounded-md px-4 py-3 sm:px-5 sm:py-4">
        <ul>
          {takedownOrder.map((status) => {
            const meta = takedownMeta[status];
            const count = counts[status];
            return (
              <li
                key={status}
                className="flex items-center justify-between gap-3 border-b border-edge-faint py-2.5 last:border-b-0"
              >
                <Badge variant={meta.variant} className="shrink-0">
                  {meta.label}
                </Badge>
                <span className="tabular shrink-0 text-sm text-ink">
                  {formatNumber(count)}
                </span>
              </li>
            );
          })}
        </ul>

        {lastUpdatedAt ? (
          <p className="mt-3 border-t border-edge pt-3 text-2xs text-ink-soft">
            {text.lastUpdate(formatRelative(lastUpdatedAt, DEMO_ANCHOR))}
          </p>
        ) : null}
      </div>
    </Section>
  );
}
