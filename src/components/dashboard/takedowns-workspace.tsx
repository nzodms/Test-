"use client";

import * as React from "react";
import { FileText, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { PageIntro, Section } from "@/components/dashboard/page-intro";
import { SourceBadge } from "@/components/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/states";
import {
  Tabs,
  TabsContent,
  TabsSegment,
  TabsSegmentTrigger,
} from "@/components/ui/tabs";
import { copy } from "@/config/product";
import { DEMO_ANCHOR, demoTakedowns } from "@/lib/demo/scan-data";
import type { DemoTakedown, TakedownStatus } from "@/lib/demo/scan-data";
import { formatNumber, formatRelative } from "@/lib/utils";

import { TakedownRequestDialog } from "./takedowns-request-dialog";
import { TakedownsPipeline } from "./takedowns-pipeline";
import {
  closedStatuses,
  openStatuses,
  sourceLabels,
  takedownMeta,
} from "./workspace-meta";

type Filter = "all" | "open" | "closed";

const FILTERS: readonly { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

const text = {
  intro: (total: number, open: number, removed: number, rejected: number) =>
    `${formatNumber(total)} removal requests recorded: ${formatNumber(open)} open, ${formatNumber(removed)} confirmed removed, ${formatNumber(rejected)} rejected.`,
  pipeline: "Request pipeline",
  pipelineBody:
    "Where each request stands. A removal is only counted once the source is checked again and the content is gone.",
  requests: "Requests",
  requestsBody:
    "Outbound requests reference the target domain in masked form, exactly as they leave the workspace.",
  showing: (shown: number, total: number) =>
    `Showing ${formatNumber(shown)} of ${formatNumber(total)}`,
  filterLabel: "Filter requests by state",
  submitted: "Submitted",
  updated: "Updated",
  none: "—",
  actions: (id: string) => `Actions for request ${id}`,
  view: "View request",
  markRemoved: "Mark as removed",
  submit: "Submit request",
  resend: "Resend request",
  demoNote: "Simulated in the demo workspace.",
  markedRemoved: (id: string) => `${id} marked as removed`,
  submittedToast: (id: string) => `${id} submitted`,
  resentToast: (id: string) => `${id} re-sent`,
  emptyOpenTitle: "No open requests",
  emptyOpenBody:
    "Every request has reached an outcome. New ones appear here as detections are confirmed.",
  emptyClosedTitle: "No closed requests",
  emptyClosedBody:
    "Nothing has been resolved yet. Requests move here once a source removes the content or rejects the request.",
  emptyAllTitle: "No requests yet",
  emptyAllBody:
    "Removal requests appear here once a confirmed detection is escalated.",
  showAll: "Show all requests",
} as const;

function emptyCopy(filter: Filter): { title: string; body: string } {
  if (filter === "open")
    return { title: text.emptyOpenTitle, body: text.emptyOpenBody };
  if (filter === "closed")
    return { title: text.emptyClosedTitle, body: text.emptyClosedBody };
  return { title: text.emptyAllTitle, body: text.emptyAllBody };
}

const EMPTY_COUNTS: Record<TakedownStatus, number> = {
  drafted: 0,
  submitted: 0,
  acknowledged: 0,
  removed: 0,
  rejected: 0,
};

/**
 * Takedowns — detection to removal.
 *
 * State lives here so the pipeline, the counts in the heading and
 * the list can never disagree: one array, read three ways.
 */
export function TakedownsWorkspace() {
  const [rows, setRows] = React.useState<DemoTakedown[]>(() =>
    demoTakedowns.map((row) => ({ ...row }))
  );
  const [filter, setFilter] = React.useState<Filter>("all");
  const [viewId, setViewId] = React.useState<string | null>(null);

  const counts = React.useMemo(() => {
    const next: Record<TakedownStatus, number> = { ...EMPTY_COUNTS };
    for (const row of rows) next[row.status] += 1;
    return next;
  }, [rows]);

  const openCount = openStatuses.reduce(
    (total, status) => total + counts[status],
    0
  );

  const visible = React.useMemo(() => {
    if (filter === "open")
      return rows.filter((row) => openStatuses.includes(row.status));
    if (filter === "closed")
      return rows.filter((row) => closedStatuses.includes(row.status));
    return rows;
  }, [rows, filter]);

  const viewing = rows.find((row) => row.id === viewId) ?? null;

  const markRemoved = React.useCallback((id: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, status: "removed", updatedAt: DEMO_ANCHOR }
          : row
      )
    );
    toast.success(text.markedRemoved(id), { description: text.demoNote });
  }, []);

  const resend = React.useCallback((row: DemoTakedown) => {
    const wasDraft = row.status === "drafted";
    setRows((prev) =>
      prev.map((entry) =>
        entry.id === row.id
          ? {
              ...entry,
              status: wasDraft ? "submitted" : entry.status,
              submittedAt: entry.submittedAt ?? DEMO_ANCHOR,
              updatedAt: DEMO_ANCHOR,
            }
          : entry
      )
    );
    toast.success(
      wasDraft ? text.submittedToast(row.id) : text.resentToast(row.id),
      { description: text.demoNote }
    );
  }, []);

  const empty = emptyCopy(filter);

  const body =
    visible.length === 0 ? (
      <EmptyState
        icon={FileText}
        title={empty.title}
        description={empty.body}
        action={
          filter === "all" ? undefined : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFilter("all")}
            >
              {text.showAll}
            </Button>
          )
        }
      />
    ) : (
      <ul className="divide-y divide-edge-faint border-y border-edge">
        {visible.map((row) => {
          const meta = takedownMeta[row.status];
          return (
            <li key={row.id} className="flex items-start gap-3 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  <span className="text-data text-ink-soft">{row.id}</span>
                  <span className="text-data max-w-full truncate text-ink">
                    {row.domainMasked}
                  </span>
                  <SourceBadge kind={row.sourceKind} tone="light" />
                </div>
                <p className="mt-1.5 text-2xs leading-relaxed text-ink-soft">
                  {sourceLabels[row.sourceKind]} · {text.submitted}{" "}
                  {row.submittedAt
                    ? formatRelative(row.submittedAt, DEMO_ANCHOR)
                    : text.none}{" "}
                  · {text.updated} {formatRelative(row.updatedAt, DEMO_ANCHOR)}
                </p>
              </div>

              <Badge
                variant={meta.variant}
                className="mt-0.5 shrink-0 sm:w-[7.5rem] sm:justify-center"
              >
                {meta.label}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={text.actions(row.id)}
                    className="-mt-1 size-11 shrink-0 sm:size-9"
                  >
                    <MoreHorizontal aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setViewId(row.id)}>
                    {text.view}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={row.status === "removed"}
                    onSelect={() => markRemoved(row.id)}
                  >
                    {text.markRemoved}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => resend(row)}>
                    {row.status === "drafted" ? text.submit : text.resend}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          );
        })}
      </ul>
    );

  return (
    <div className="flex min-w-0 flex-col">
      <PageIntro
        title={copy.dashboard.sections.takedowns}
        description={text.intro(
          rows.length,
          openCount,
          counts.removed,
          counts.rejected
        )}
      />

      <Section
        label={text.pipeline}
        description={text.pipelineBody}
        className="mt-6 sm:mt-8"
      >
        <TakedownsPipeline counts={counts} />
      </Section>

      <Section
        title={text.requests}
        description={text.requestsBody}
        className="mt-10 sm:mt-14"
      >
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <TabsSegment aria-label={text.filterLabel}>
              {FILTERS.map((option) => (
                <TabsSegmentTrigger
                  key={option.value}
                  value={option.value}
                  className="h-11 px-3 sm:h-8 sm:px-2.5"
                >
                  {option.label}
                </TabsSegmentTrigger>
              ))}
            </TabsSegment>
            <p className="text-2xs text-ink-soft" aria-live="polite">
              {text.showing(visible.length, rows.length)}
            </p>
          </div>

          {FILTERS.map((option) => (
            <TabsContent key={option.value} value={option.value} className="mt-4">
              {body}
            </TabsContent>
          ))}
        </Tabs>
      </Section>


      <TakedownRequestDialog
        takedown={viewing}
        onOpenChange={(open) => {
          if (!open) setViewId(null);
        }}
      />
    </div>
  );
}
