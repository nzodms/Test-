"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid, List, Search } from "lucide-react";
import { toast } from "sonner";

import { PageIntro } from "@/components/dashboard/page-intro";
import { Metric, SourceBadge } from "@/components/primitives";
import { AbstractThumb } from "@/components/scanner/abstract-thumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox, Separator } from "@/components/ui/misc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/states";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsSegment,
  TabsSegmentTrigger,
} from "@/components/ui/tabs";
import { routes } from "@/config/navigation";
import { copy } from "@/config/product";
import { DEMO_ANCHOR, demoMatches, scanTotals } from "@/lib/demo/scan-data";
import type { Confidence, DemoMatch, MatchState, SourceKind } from "@/lib/scan/types";
import { cn, formatDateTimeUTC, formatNumber, formatRelative } from "@/lib/utils";

import {
  SOURCE_KINDS,
  buildSegments,
  confidenceMeta,
  sourceLabels,
  sourceSingular,
  stateMeta,
  ProportionBar,
  segmentsSummary,
} from "./shared";

/* Strings this surface needs that the shared copy file doesn't carry. */
const text = {
  description: (queue: number, detected: number) =>
    `${queue} matches in your review queue · ${formatNumber(detected)} detected in total. Review each finding, set its state, then prepare a removal request.`,
  openTakedowns: "Open takedowns",

  queueLabel: "Review queue",
  awaitingDecision: "awaiting a decision",
  highConfidence: "High confidence",
  highConfidenceHint: "in the review queue",
  detectedTotal: "Detected in total",
  detectedTotalHint: (sources: number) => `across ${sources} indexed sources`,
  composition: (summary: string) => `Review queue composition: ${summary}.`,

  searchLabel: "Search findings",
  searchPlaceholder: "Domain, match type or ID",
  confidenceLabel: "Filter by confidence",
  sourceLabel: "Filter by source type",
  stateLabel: "Filter by review state",
  allConfidence: "All confidence",
  allSources: "All source types",
  allStates: "All states",
  clear: "Clear",
  showing: "Showing",
  of: "of",

  viewLabel: "Result view",
  viewList: "List",
  viewGrid: "Grid",

  selectAll: "Select all findings on this page",
  selectOne: (domain: string) => `Select finding on ${domain}`,
  openOne: (domain: string) => `Open finding on ${domain}`,
  selected: "selected",
  markInReview: "Mark in review",
  prepareMany: "Prepare takedowns",
  clearSelection: "Clear",

  colMatch: "Match",
  colSource: "Source",
  colConfidence: "Confidence",
  colState: "State",
  colDetected: "Detected",

  emptyTitle: "No findings match these filters",
  emptyBody:
    "Nothing in the review queue fits the current combination. Clear the filters to see the rest of the queue.",
  emptyAction: "Clear filters",

  pageOf: "Page",
  pageSeparator: "of",
  prev: "Previous",
  next: "Next",

  drawerEyebrow: "Finding",
  drawerSource: "Source",
  drawerConfidence: "Confidence",
  drawerState: "State",
  drawerDetected: "Detected",
  drawerEvidence: "Evidence",
  drawerStateField: "Review state",
  drawerStateAria: "Set review state for this finding",
  prepare: "Prepare takedown",
  prepared: "Request drafted",
  viewRequests: "View in takedowns",
  dismiss: "Dismiss",
  score: (value: number) => `${value} / 100`,

  evidence: (match: DemoMatch) =>
    `${match.matchType} found on ${match.domainFull}, a ${sourceSingular[match.sourceKind]} already indexed publicly. The comparison scored ${match.confidenceScore} out of 100 against the reference material for this profile.`,
  evidenceNote:
    "Argus reads only what is publicly indexed. Nothing private or paid is accessed.",

  toastState: (label: string) => `Marked as ${label.toLowerCase()}`,
  toastStateBody: (domain: string) => `${domain} updated in the review queue.`,
  toastBulkState: (count: number) =>
    `${count} findings marked as in review`,
  toastPrepared: "Removal request drafted",
  toastPreparedBody: (domain: string) =>
    `Evidence for ${domain} attached. Demo workspace — nothing is sent.`,
  toastPreparedMany: (count: number) => `${count} removal requests drafted`,
  toastPreparedManyBody:
    "Evidence attached to each request. Demo workspace — nothing is sent.",
  toastDismissed: "Finding dismissed",
  toastDismissedBody: (domain: string) =>
    `${domain} removed from the review queue.`,
  undo: "Undo",
  toastRestored: "Finding restored",
} as const;

const PAGE_SIZE = 15;

/** Lightness ramp: the further a finding travels, the darker its mark. */
const STATE_TONES: readonly string[] = ["bg-ink/22", "bg-ink/50", "bg-ink/82"];
const STATE_ORDER: readonly MatchState[] = ["possible", "review", "confirmed"];

type ConfidenceFilter = "all" | Confidence;
type KindFilter = "all" | SourceKind;
type StateFilter = "all" | MatchState;

/** Newest first — a queue reads from the top. */
const BASE_QUEUE: readonly DemoMatch[] = [...demoMatches].sort((a, b) =>
  a.detectedAt < b.detectedAt ? 1 : a.detectedAt > b.detectedAt ? -1 : 0
);

function isConfidenceFilter(value: string): value is ConfidenceFilter {
  return value === "all" || value === "high" || value === "medium" || value === "low";
}

function isKindFilter(value: string): value is KindFilter {
  return value === "all" || SOURCE_KINDS.includes(value as SourceKind);
}

function isStateFilter(value: string): value is StateFilter {
  return (
    value === "all" ||
    value === "possible" ||
    value === "review" ||
    value === "confirmed"
  );
}

export function FindingsWorkspace() {
  const [query, setQuery] = React.useState("");
  const [confidence, setConfidence] = React.useState<ConfidenceFilter>("all");
  const [kind, setKind] = React.useState<KindFilter>("all");
  const [reviewState, setReviewState] = React.useState<StateFilter>("all");
  const [view, setView] = React.useState<"list" | "grid">("list");
  const [page, setPage] = React.useState(1);

  const [selected, setSelected] = React.useState<ReadonlySet<string>>(
    () => new Set<string>()
  );
  const [overrides, setOverrides] = React.useState<Record<string, MatchState>>({});
  const [dismissed, setDismissed] = React.useState<ReadonlySet<string>>(
    () => new Set<string>()
  );
  const [prepared, setPrepared] = React.useState<ReadonlySet<string>>(
    () => new Set<string>()
  );
  const [activeId, setActiveId] = React.useState<string | null>(null);

  /* ── Derived data ─────────────────────────────────────────────── */

  const queue = React.useMemo(
    () =>
      BASE_QUEUE.filter((match) => !dismissed.has(match.id)).map((match) => {
        const override = overrides[match.id];
        return override ? { ...match, state: override } : match;
      }),
    [dismissed, overrides]
  );

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return queue.filter((match) => {
      if (confidence !== "all" && match.confidence !== confidence) return false;
      if (kind !== "all" && match.sourceKind !== kind) return false;
      if (reviewState !== "all" && match.state !== reviewState) return false;
      if (needle === "") return true;
      return (
        match.domainFull.toLowerCase().includes(needle) ||
        match.matchType.toLowerCase().includes(needle) ||
        match.id.toLowerCase().includes(needle)
      );
    });
  }, [queue, query, confidence, kind, reviewState]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  /* Clamped at render time so removing rows never strands the view on
     an empty page — no cascading effect required. */
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const queueIds = React.useMemo(
    () => new Set(queue.map((match) => match.id)),
    [queue]
  );
  const selectedIds = React.useMemo(
    () => [...selected].filter((id) => queueIds.has(id)),
    [selected, queueIds]
  );

  const stateSegments = React.useMemo(
    () =>
      buildSegments(
        STATE_ORDER.map((value) => ({
          key: value,
          label: stateMeta[value].label,
          count: queue.filter((match) => match.state === value).length,
        }))
      ).map((segment, index) => ({
        ...segment,
        tone: STATE_TONES[index] ?? segment.tone,
      })),
    [queue]
  );

  const highInQueue = React.useMemo(
    () => queue.filter((match) => match.confidence === "high").length,
    [queue]
  );

  const filtersActive =
    query.trim() !== "" ||
    confidence !== "all" ||
    kind !== "all" ||
    reviewState !== "all";

  const activeMatch = activeId
    ? (queue.find((match) => match.id === activeId) ?? null)
    : null;

  /* ── Handlers (each filter change resets the page) ────────────── */

  const resetPage = React.useCallback(() => setPage(1), []);

  function onQueryChange(value: string) {
    setQuery(value);
    resetPage();
  }

  function onConfidenceChange(value: string) {
    if (isConfidenceFilter(value)) setConfidence(value);
    resetPage();
  }

  function onKindChange(value: string) {
    if (isKindFilter(value)) setKind(value);
    resetPage();
  }

  function onStateFilterChange(value: string) {
    if (isStateFilter(value)) setReviewState(value);
    resetPage();
  }

  function clearFilters() {
    setQuery("");
    setConfidence("all");
    setKind("all");
    setReviewState("all");
    resetPage();
  }

  function toggleSelected(id: string, next: boolean) {
    setSelected((previous) => {
      const draft = new Set(previous);
      if (next) draft.add(id);
      else draft.delete(id);
      return draft;
    });
  }

  function togglePageSelection(next: boolean) {
    setSelected((previous) => {
      const draft = new Set(previous);
      for (const match of pageItems) {
        if (next) draft.add(match.id);
        else draft.delete(match.id);
      }
      return draft;
    });
  }

  function applyState(id: string, next: MatchState, domain: string) {
    setOverrides((previous) => ({ ...previous, [id]: next }));
    toast(text.toastState(stateMeta[next].label), {
      description: text.toastStateBody(domain),
    });
  }

  function prepareTakedown(match: DemoMatch) {
    setPrepared((previous) => new Set(previous).add(match.id));
    toast.success(text.toastPrepared, {
      description: text.toastPreparedBody(match.domainFull),
    });
  }

  function dismissMatch(match: DemoMatch) {
    setDismissed((previous) => new Set(previous).add(match.id));
    setSelected((previous) => {
      const draft = new Set(previous);
      draft.delete(match.id);
      return draft;
    });
    setActiveId(null);
    toast(text.toastDismissed, {
      description: text.toastDismissedBody(match.domainFull),
      action: {
        label: text.undo,
        onClick: () => {
          setDismissed((previous) => {
            const draft = new Set(previous);
            draft.delete(match.id);
            return draft;
          });
          toast(text.toastRestored);
        },
      },
    });
  }

  function bulkMarkInReview() {
    if (selectedIds.length === 0) return;
    setOverrides((previous) => {
      const draft = { ...previous };
      for (const id of selectedIds) draft[id] = "review";
      return draft;
    });
    toast(text.toastBulkState(selectedIds.length));
    setSelected(new Set<string>());
  }

  function bulkPrepare() {
    if (selectedIds.length === 0) return;
    setPrepared((previous) => {
      const draft = new Set(previous);
      for (const id of selectedIds) draft.add(id);
      return draft;
    });
    toast.success(text.toastPreparedMany(selectedIds.length), {
      description: text.toastPreparedManyBody,
    });
    setSelected(new Set<string>());
  }

  const pageIds = pageItems.map((match) => match.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));
  const headerChecked: boolean | "indeterminate" = allPageSelected
    ? true
    : somePageSelected
      ? "indeterminate"
      : false;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageIntro
        title={copy.dashboard.sections.findings}
        description={text.description(queue.length, scanTotals.matches)}
        actions={
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="h-11 px-3.5 sm:h-8 sm:px-3"
          >
            <Link href={routes.takedowns}>{text.openTakedowns}</Link>
          </Button>
        }
      />

      {/* ── Queue composition ─────────────────────────────────────── */}
      <div className="rounded-lg border border-edge bg-paper px-4 py-4 shadow-hairline sm:px-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-label">{text.queueLabel}</p>
              <p className="text-2xs text-ink-soft">
                <span className="tabular">{queue.length}</span>{" "}
                {text.awaitingDecision}
              </p>
            </div>

            <ProportionBar
              className="mt-3"
              segments={stateSegments}
              ariaLabel={text.composition(segmentsSummary(stateSegments))}
            />

            <ul className="mt-3.5 flex flex-wrap gap-x-5 gap-y-2">
              {stateSegments.map((segment) => (
                <li
                  key={segment.key}
                  className="flex min-w-0 items-center gap-2 text-[13px] text-ink-soft"
                >
                  <span
                    aria-hidden
                    className={cn("size-2.5 shrink-0 rounded-xs", segment.tone)}
                  />
                  <span className="truncate">{segment.label}</span>
                  <span className="tabular font-medium text-ink">
                    {segment.count}
                  </span>
                  <span className="tabular text-2xs text-ink-soft">
                    {segment.percent}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-8 border-t border-edge-faint pt-4 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <Metric
              tone="light"
              label={text.highConfidence}
              value={highInQueue}
              hint={text.highConfidenceHint}
            />
            <Metric
              tone="light"
              label={text.detectedTotal}
              value={formatNumber(scanTotals.matches)}
              hint={text.detectedTotalHint(scanTotals.sources)}
            />
          </div>
        </div>
      </div>

      <Tabs
        value={view}
        onValueChange={(value) => setView(value === "grid" ? "grid" : "list")}
        className="min-w-0"
      >
        {/* ── Filters ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2.5 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative w-full lg:w-64 lg:shrink-0">
            <Label htmlFor="findings-search" className="sr-only">
              {text.searchLabel}
            </Label>
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint"
            />
            <Input
              id="findings-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={text.searchPlaceholder}
              className="h-11 pl-9 sm:h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
            <Select value={confidence} onValueChange={onConfidenceChange}>
              <SelectTrigger
                aria-label={text.confidenceLabel}
                className="h-11 sm:h-9 lg:w-[10.5rem]"
              >
                <SelectValue placeholder={text.allConfidence} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{text.allConfidence}</SelectItem>
                <SelectItem value="high">{confidenceMeta.high.label}</SelectItem>
                <SelectItem value="medium">{confidenceMeta.medium.label}</SelectItem>
                <SelectItem value="low">{confidenceMeta.low.label}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={kind} onValueChange={onKindChange}>
              <SelectTrigger
                aria-label={text.sourceLabel}
                className="h-11 sm:h-9 lg:w-[10.5rem]"
              >
                <SelectValue placeholder={text.allSources} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{text.allSources}</SelectItem>
                {SOURCE_KINDS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {sourceLabels[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={reviewState} onValueChange={onStateFilterChange}>
              <SelectTrigger
                aria-label={text.stateLabel}
                className="col-span-2 h-11 sm:h-9 lg:col-span-1 lg:w-[9.5rem]"
              >
                <SelectValue placeholder={text.allStates} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{text.allStates}</SelectItem>
                {STATE_ORDER.map((value) => (
                  <SelectItem key={value} value={value}>
                    {stateMeta[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 lg:ml-auto">
            <div className="flex min-w-0 items-center gap-2">
              <p className="text-2xs text-ink-soft">
                {text.showing} <span className="tabular">{filtered.length}</span>{" "}
                {text.of} <span className="tabular">{queue.length}</span>
              </p>
              {filtersActive ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-11 px-2.5 sm:h-8"
                >
                  {text.clear}
                </Button>
              ) : null}
            </div>

            <TabsSegment aria-label={text.viewLabel} className="shrink-0">
              <TabsSegmentTrigger
                value="list"
                className="inline-flex h-10 items-center gap-1.5 px-3 sm:h-7"
              >
                <List className="size-3.5" aria-hidden />
                {text.viewList}
              </TabsSegmentTrigger>
              <TabsSegmentTrigger
                value="grid"
                className="inline-flex h-10 items-center gap-1.5 px-3 sm:h-7"
              >
                <LayoutGrid className="size-3.5" aria-hidden />
                {text.viewGrid}
              </TabsSegmentTrigger>
            </TabsSegment>
          </div>
        </div>

        {/* ── Bulk actions ───────────────────────────────────────── */}
        {selectedIds.length > 0 ? (
          <div className="sticky top-14 z-20 mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-edge-strong bg-paper/95 px-3 py-2 shadow-lift backdrop-blur-sm animate-fade-in">
            <p className="text-[13px] text-ink">
              <span className="tabular font-medium">{selectedIds.length}</span>{" "}
              {text.selected}
            </p>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={bulkMarkInReview}
                className="h-10 sm:h-8"
              >
                {text.markInReview}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={bulkPrepare}
                className="h-10 sm:h-8"
              >
                {text.prepareMany}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(new Set<string>())}
                className="h-10 sm:h-8"
              >
                {text.clearSelection}
              </Button>
            </div>
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState
            className="mt-5"
            icon={Search}
            title={text.emptyTitle}
            description={text.emptyBody}
            action={
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                {text.emptyAction}
              </Button>
            }
          />
        ) : (
          <>
            <TabsContent value="list" className="mt-4">
              <div className="overflow-hidden rounded-md border border-edge bg-paper">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-11">
                        <Checkbox
                          checked={headerChecked}
                          onCheckedChange={(value) =>
                            togglePageSelection(value === true)
                          }
                          aria-label={text.selectAll}
                        />
                      </TableHead>
                      <TableHead>{text.colMatch}</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        {text.colSource}
                      </TableHead>
                      <TableHead>{text.colConfidence}</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        {text.colState}
                      </TableHead>
                      <TableHead className="hidden text-right md:table-cell">
                        {text.colDetected}
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {pageItems.map((match) => {
                      const isSelected = selected.has(match.id);
                      const conf = confidenceMeta[match.confidence];
                      const st = stateMeta[match.state];
                      return (
                        <TableRow
                          key={match.id}
                          data-state={isSelected ? "selected" : undefined}
                          className="cursor-pointer"
                          onClick={() => setActiveId(match.id)}
                        >
                          <TableCell
                            onClick={(event) => event.stopPropagation()}
                            className="w-11"
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(value) =>
                                toggleSelected(match.id, value === true)
                              }
                              aria-label={text.selectOne(match.domainFull)}
                            />
                          </TableCell>

                          <TableCell>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setActiveId(match.id);
                              }}
                              aria-label={text.openOne(match.domainFull)}
                              className="flex min-w-0 items-center gap-3 text-left"
                            >
                              <AbstractThumb
                                tone="light"
                                seed={match.thumbSeed}
                                className="size-8 shrink-0"
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-data text-ink">
                                  {match.domainFull}
                                </span>
                                <span className="mt-0.5 block truncate text-2xs text-ink-soft">
                                  {match.matchType}
                                </span>
                              </span>
                            </button>
                          </TableCell>

                          <TableCell className="hidden lg:table-cell">
                            <span className="inline-flex items-center gap-2">
                              <SourceBadge kind={match.sourceKind} tone="light" />
                              <span className="sr-only">
                                {sourceLabels[match.sourceKind]}
                              </span>
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <Badge variant={conf.variant}>{conf.label}</Badge>
                              <span className="tabular text-2xs text-ink-soft">
                                {match.confidenceScore}
                              </span>
                            </span>
                          </TableCell>

                          <TableCell className="hidden sm:table-cell">
                            <span className="flex flex-wrap items-center gap-1.5">
                              <Badge variant={st.variant}>{st.label}</Badge>
                              {prepared.has(match.id) ? (
                                <Badge variant="neutral">{text.prepared}</Badge>
                              ) : null}
                            </span>
                          </TableCell>

                          <TableCell className="hidden text-right md:table-cell">
                            <span className="text-data text-ink-soft">
                              {formatRelative(match.detectedAt, DEMO_ANCHOR)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="grid" className="mt-4">
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {pageItems.map((match) => {
                  const isSelected = selected.has(match.id);
                  const conf = confidenceMeta[match.confidence];
                  const st = stateMeta[match.state];
                  return (
                    <li
                      key={match.id}
                      className={cn(
                        "relative flex min-w-0 flex-col overflow-hidden rounded-md border bg-paper transition-colors",
                        isSelected
                          ? "border-accent/40 bg-accent-tint/40"
                          : "border-edge hover:border-edge-strong"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveId(match.id)}
                        aria-label={text.openOne(match.domainFull)}
                        className="block w-full"
                      >
                        <AbstractThumb
                          tone="light"
                          seed={match.thumbSeed}
                          className="aspect-[16/10] w-full rounded-none"
                        />
                      </button>

                      <span className="absolute left-1 top-1 flex size-11 items-center justify-center sm:left-1.5 sm:top-1.5 sm:size-9">
                        <span className="flex size-6 items-center justify-center rounded-xs border border-edge-strong bg-paper/95 shadow-hairline">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(value) =>
                              toggleSelected(match.id, value === true)
                            }
                            aria-label={text.selectOne(match.domainFull)}
                          />
                        </span>
                      </span>

                      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3">
                        <button
                          type="button"
                          onClick={() => setActiveId(match.id)}
                          aria-label={text.openOne(match.domainFull)}
                          className="min-w-0 text-left"
                        >
                          <span className="block truncate text-data text-ink">
                            {match.domainFull}
                          </span>
                          <span className="mt-1 block truncate text-2xs text-ink-soft">
                            {match.matchType}
                          </span>
                        </button>

                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
                          <Badge variant={conf.variant}>{conf.label}</Badge>
                          <span className="tabular text-2xs text-ink-soft">
                            {match.confidenceScore}
                          </span>
                          <SourceBadge kind={match.sourceKind} tone="light" />
                          <span className="sr-only">
                            {sourceLabels[match.sourceKind]}
                          </span>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-edge-faint pt-2.5">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <Badge variant={st.variant}>{st.label}</Badge>
                            {prepared.has(match.id) ? (
                              <Badge variant="neutral">{text.prepared}</Badge>
                            ) : null}
                          </span>
                          <span className="text-data text-ink-soft">
                            {formatRelative(match.detectedAt, DEMO_ANCHOR)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </TabsContent>

            {/* ── Pagination ───────────────────────────────────────── */}
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-edge-faint pt-3">
              <p className="text-2xs text-ink-soft">
                {text.pageOf} <span className="tabular">{currentPage}</span>{" "}
                {text.pageSeparator}{" "}
                <span className="tabular">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  className="h-10 sm:h-8"
                >
                  <ChevronLeft aria-hidden />
                  {text.prev}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  className="h-10 sm:h-8"
                >
                  {text.next}
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </div>
          </>
        )}
      </Tabs>

      <FindingDrawer
        match={activeMatch}
        prepared={activeMatch ? prepared.has(activeMatch.id) : false}
        onOpenChange={(open) => {
          if (!open) setActiveId(null);
        }}
        onStateChange={applyState}
        onPrepare={prepareTakedown}
        onDismiss={dismissMatch}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Detail drawer — the full record for one finding, and the three
   decisions that can be taken on it.
   ════════════════════════════════════════════════════════════════ */

function FindingDrawer({
  match,
  prepared,
  onOpenChange,
  onStateChange,
  onPrepare,
  onDismiss,
}: {
  match: DemoMatch | null;
  prepared: boolean;
  onOpenChange: (open: boolean) => void;
  onStateChange: (id: string, next: MatchState, domain: string) => void;
  onPrepare: (match: DemoMatch) => void;
  onDismiss: (match: DemoMatch) => void;
}) {
  const conf = match ? confidenceMeta[match.confidence] : null;
  const st = match ? stateMeta[match.state] : null;

  return (
    <Drawer open={match !== null} onOpenChange={onOpenChange}>
      <DrawerContent side="right" widthClassName="max-w-xl">
        {match && conf && st ? (
          <>
            <DrawerHeader>
              <p className="text-label">
                {text.drawerEyebrow} · <span className="tabular">{match.id}</span>
              </p>
              <DrawerTitle asChild>
                <h2 className="mt-2 break-all text-data text-ink">
                  {match.domainFull}
                </h2>
              </DrawerTitle>
              <p className="mt-1.5 text-title text-[15px] text-ink">
                {match.matchType}
              </p>
            </DrawerHeader>

            <DrawerBody className="space-y-6">
              <AbstractThumb
                tone="light"
                seed={match.thumbSeed}
                className="aspect-[16/9] w-full rounded-md"
              />

              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-[13px]">
                <dt className="text-ink-soft">{text.drawerSource}</dt>
                <dd className="flex min-w-0 flex-wrap items-center gap-2 text-ink">
                  <SourceBadge kind={match.sourceKind} tone="light" />
                  <span className="truncate">
                    {sourceLabels[match.sourceKind]}
                  </span>
                </dd>

                <dt className="text-ink-soft">{text.drawerConfidence}</dt>
                <dd className="flex min-w-0 flex-wrap items-center gap-2">
                  <Badge variant={conf.variant}>{conf.label}</Badge>
                  <span className="tabular text-ink-soft">
                    {text.score(match.confidenceScore)}
                  </span>
                </dd>

                <dt className="text-ink-soft">{text.drawerState}</dt>
                <dd className="flex min-w-0 flex-wrap items-center gap-2">
                  <Badge variant={st.variant}>{st.label}</Badge>
                  {prepared ? (
                    <Badge variant="neutral">{text.prepared}</Badge>
                  ) : null}
                </dd>

                <dt className="text-ink-soft">{text.drawerDetected}</dt>
                <dd className="min-w-0">
                  <span className="text-data text-ink">
                    {formatDateTimeUTC(match.detectedAt)}
                  </span>
                </dd>
              </dl>

              <Separator />

              <div>
                <p className="text-label">{text.drawerEvidence}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink">
                  {text.evidence(match)}
                </p>
                <p className="mt-2 text-2xs leading-relaxed text-ink-soft">
                  {text.evidenceNote}
                </p>
              </div>

              <div className="rounded-md border border-edge bg-mineral/60 p-3">
                <Label htmlFor="finding-state" className="text-[13px]">
                  {text.drawerStateField}
                </Label>
                <Select
                  value={match.state}
                  onValueChange={(value) => {
                    if (
                      value === "possible" ||
                      value === "review" ||
                      value === "confirmed"
                    ) {
                      onStateChange(match.id, value, match.domainFull);
                    }
                  }}
                >
                  <SelectTrigger
                    id="finding-state"
                    aria-label={text.drawerStateAria}
                    className="mt-2 h-11 sm:h-9"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATE_ORDER.map((value) => (
                      <SelectItem key={value} value={value}>
                        {stateMeta[value].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </DrawerBody>

            <DrawerFooter className="flex-wrap justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(match)}
                className="h-11 sm:h-9"
              >
                {text.dismiss}
              </Button>

              {prepared ? (
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="h-11 sm:h-9"
                >
                  <Link href={routes.takedowns}>{text.viewRequests}</Link>
                </Button>
              ) : (
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => onPrepare(match)}
                  className="h-11 sm:h-9"
                >
                  {text.prepare}
                </Button>
              )}
            </DrawerFooter>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
