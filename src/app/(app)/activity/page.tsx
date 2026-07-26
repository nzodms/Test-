"use client";

import * as React from "react";
import {
  Activity,
  AlertTriangle,
  FileText,
  Radar,
  Search,
  Settings,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";
import { Tabs, TabsSegment, TabsSegmentTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/halo/reveal";
import { dataNow, getActivity } from "@/lib/data";
import type { ActivityEvent, ActivityKind } from "@/lib/data";
import { cn, formatDate, formatRelative } from "@/lib/utils";

const PAGE_SIZE = 10;

/* ── Filters ───────────────────────────────────────────────────── */

type TabValue = "all" | "signals" | "automations" | "team" | "reports" | "system";

const TABS: { value: TabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "signals", label: "Signals" },
  { value: "automations", label: "Automations" },
  { value: "team", label: "Team" },
  { value: "reports", label: "Reports" },
  { value: "system", label: "System" },
];

const TAB_KINDS: Record<Exclude<TabValue, "all">, ActivityKind[]> = {
  signals: ["signal"],
  automations: ["automation"],
  team: ["member"],
  reports: ["report"],
  system: ["settings", "alert"],
};

const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  signal: Radar,
  automation: Workflow,
  member: Users,
  report: FileText,
  settings: Settings,
  alert: AlertTriangle,
};

/* ── Day grouping (UTC calendar days, stable for SSR) ──────────── */

const weekdayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: "UTC",
});

/** "2026-07-24T…Z" → "Friday · Jul 24" */
function dayLabel(iso: string): string {
  return `${weekdayFormat.format(new Date(iso))} · ${formatDate(iso)}`;
}

interface DayGroup {
  key: string;
  label: string;
  items: ActivityEvent[];
}

/** Events must already be sorted newest-first. */
function groupByDay(events: ActivityEvent[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const event of events) {
    const key = event.at.slice(0, 10);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(event);
    } else {
      groups.push({ key, label: dayLabel(event.at), items: [event] });
    }
  }
  return groups;
}

/* ISO timestamps share one format, so lexicographic order = time order. */
const allActivity: ActivityEvent[] = [...getActivity()].sort((a, b) =>
  b.at.localeCompare(a.at)
);

/* ── Timeline pieces ───────────────────────────────────────────── */

function TimelineEvent({ event }: { event: ActivityEvent }) {
  const Icon = KIND_ICON[event.kind];
  const isAlert = event.kind === "alert";
  return (
    <li className="relative flex gap-4 pb-7 last:pb-1">
      <span
        className={cn(
          "relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border bg-raised",
          isAlert
            ? "border-ember-400/40 text-ember-300"
            : "border-edge-strong text-ink-muted"
        )}
        aria-hidden
      >
        <Icon className="size-3.5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <p className="min-w-0 text-sm leading-relaxed text-ink-muted">
            <span className="font-medium text-ink">{event.actor}</span>{" "}
            {event.actor === "Halo" ? (
              <>
                <Badge variant="halo" className="mr-1 align-middle">
                  system
                </Badge>{" "}
              </>
            ) : null}
            {event.action}{" "}
            <span className="text-ink-secondary">{event.target}</span>
          </p>
          <time
            dateTime={event.at}
            className="shrink-0 text-xs text-ink-faint tabular"
          >
            {formatRelative(event.at, dataNow)}
          </time>
        </div>
        {event.detail ? (
          <p className="surface-well mt-2 rounded-md px-3 py-2 text-[13px] leading-relaxed text-ink-muted">
            {event.detail}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function DaySection({ group }: { group: DayGroup }) {
  return (
    <section aria-label={group.label}>
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-label shrink-0 text-ink-muted">{group.label}</h2>
        <span className="h-px flex-1 self-center bg-edge-faint" aria-hidden />
        <span className="text-2xs text-ink-faint tabular">
          {group.items.length} {group.items.length === 1 ? "event" : "events"}
        </span>
      </div>
      <ol className="relative">
        {/* Vertical spine — centered under the 28px node column. */}
        <span
          className="absolute bottom-2 left-3.5 top-1 -ml-px border-l border-edge"
          aria-hidden
        />
        {group.items.map((event) => (
          <TimelineEvent key={event.id} event={event} />
        ))}
      </ol>
    </section>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function ActivityPage() {
  const [tab, setTab] = React.useState<TabValue>("all");
  const [query, setQuery] = React.useState("");
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  const filtered = React.useMemo(() => {
    const kinds = tab === "all" ? null : TAB_KINDS[tab];
    const q = query.trim().toLowerCase();
    return allActivity.filter((event) => {
      if (kinds && !kinds.includes(event.kind)) return false;
      if (q.length === 0) return true;
      return (
        event.actor.toLowerCase().includes(q) ||
        event.action.toLowerCase().includes(q) ||
        event.target.toLowerCase().includes(q)
      );
    });
  }, [tab, query]);

  const visible = filtered.slice(0, visibleCount);
  const groups = groupByDay(visible);
  const hasMore = filtered.length > visible.length;

  return (
    <PageContainer className="pb-16">
      <PageHeader
        title="Activity"
        description="Every change in the workspace, in order."
      />

      {/* ── Filter row ─────────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as TabValue);
            setVisibleCount(PAGE_SIZE);
          }}
        >
          <TabsSegment
            aria-label="Filter activity by type"
            className="max-w-full flex-wrap"
          >
            {TABS.map((t) => (
              <TabsSegmentTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsSegmentTrigger>
            ))}
          </TabsSegment>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Search actor, action or target"
            aria-label="Search activity"
            className="pl-8"
          />
        </div>
      </div>

      {/* ── Timeline ───────────────────────────────────────────── */}
      <Reveal delay={0.05}>
        <div className="mt-8">
          {groups.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No matching activity"
              description="Nothing in the feed matches these filters. Try a different type or clear the search."
              action={
                query.length > 0 || tab !== "all" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setTab("all");
                      setQuery("");
                      setVisibleCount(PAGE_SIZE);
                    }}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="space-y-8">
                {groups.map((group) => (
                  <DaySection key={group.key} group={group} />
                ))}
              </div>

              <div className="mt-4 flex flex-col items-center gap-2">
                {hasMore ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  >
                    Show earlier activity
                  </Button>
                ) : null}
                <p className="text-2xs text-ink-faint tabular">
                  {hasMore
                    ? `Showing ${visible.length} of ${filtered.length} events`
                    : `Showing all ${filtered.length} ${
                        filtered.length === 1 ? "event" : "events"
                      }`}
                </p>
              </div>
            </>
          )}
        </div>
      </Reveal>
    </PageContainer>
  );
}
