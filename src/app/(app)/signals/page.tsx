"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Radar,
  Search,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox, Progress } from "@/components/ui/misc";
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
import { Tabs, TabsSegment, TabsSegmentTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/halo/reveal";
import {
  NewSignalDialog,
  type NewSignalInput,
} from "@/components/signals/new-signal-dialog";
import { SignalDrawer } from "@/components/signals/signal-drawer";
import {
  SEVERITY_ORDER,
  STATUS_ORDER,
  SeverityBadge,
  StatusBadge,
  severityLabel,
  statusLabel,
} from "@/components/signals/signal-badges";
import {
  dataNow,
  getCurrentUser,
  getMemberById,
  getMetrics,
  getSignals,
  severityRank,
} from "@/lib/data";
import type { Severity, Signal, SignalStatus } from "@/lib/data";
import { formatRelative } from "@/lib/utils";

const PAGE_SIZE = 12;
const metrics = getMetrics();

type SeverityFilter = Severity | "all";
type StatusFilter = SignalStatus | "all";
type SortMode = "severity" | "newest";

const IMPACT_BY_SEVERITY: Record<Severity, number> = {
  critical: 86,
  high: 68,
  medium: 50,
  low: 32,
};

function nextSignalId(list: Signal[]): string {
  let max = 1000;
  for (const s of list) {
    const n = Number(s.id.slice(4));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `SIG-${max + 1}`;
}

function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function SignalsWorkspace() {
  const [signals, setSignals] = React.useState<Signal[]>(() =>
    getSignals().map((s) => ({ ...s }))
  );
  const [query, setQuery] = React.useState("");
  const [severityFilter, setSeverityFilter] =
    React.useState<SeverityFilter>("all");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = React.useState("all");
  const [sortMode, setSortMode] = React.useState<SortMode>("severity");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set()
  );
  const [focusId, setFocusId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const openSignal = React.useCallback((id: string) => {
    setFocusId(id);
    setDrawerOpen(true);
  }, []);

  /* ── Deep link: /signals?focus=SIG-1043 opens the drawer ──────── */
  const searchParams = useSearchParams();
  const focusParam = searchParams.get("focus");
  const consumedFocus = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!focusParam || consumedFocus.current === focusParam) return;
    consumedFocus.current = focusParam;
    if (signals.some((s) => s.id === focusParam)) {
      // Synchronizing with an external system (the URL) is exactly
      // what effects are for; each param value is consumed once.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openSignal(focusParam);
    }
  }, [focusParam, signals, openSignal]);

  /* ── Derived rows ──────────────────────────────────────────────── */
  const sources = React.useMemo(
    () => Array.from(new Set(signals.map((s) => s.source))).sort(),
    [signals]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = signals.filter((s) => {
      if (severityFilter !== "all" && s.severity !== severityFilter)
        return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (sourceFilter !== "all" && s.source !== sourceFilter) return false;
      if (q.length > 0) {
        const haystack = `${s.id} ${s.title} ${s.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    return rows.sort((a, b) => {
      if (sortMode === "severity") {
        return (
          severityRank(a.severity) - severityRank(b.severity) ||
          b.impact - a.impact ||
          Date.parse(b.createdAt) - Date.parse(a.createdAt)
        );
      }
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
  }, [signals, query, severityFilter, statusFilter, sourceFilter, sortMode]);

  const hasFilters =
    query.trim() !== "" ||
    severityFilter !== "all" ||
    statusFilter !== "all" ||
    sourceFilter !== "all";

  // Filter/sort changes restart pagination — done in the event
  // handlers themselves rather than a cascading effect.
  const withPageReset = React.useCallback(
    <T,>(setter: (value: T) => void) =>
      (value: T) => {
        setter(value);
        setPage(1);
      },
    []
  );
  const applyQuery = withPageReset(setQuery);
  const applySeverityFilter = withPageReset(setSeverityFilter);
  const applyStatusFilter = withPageReset(setStatusFilter);
  const applySourceFilter = withPageReset(setSourceFilter);
  const applySortMode = withPageReset(setSortMode);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const rangeStart = (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = rangeStart + pageRows.length - 1;

  const activeCount = React.useMemo(
    () => signals.filter((s) => s.status !== "resolved").length,
    [signals]
  );

  /* ── Selection ─────────────────────────────────────────────────── */
  const pageIds = pageRows.map((s) => s.id);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someOnPageSelected = pageIds.some((id) => selected.has(id));
  const headerChecked: boolean | "indeterminate" = allOnPageSelected
    ? true
    : someOnPageSelected
      ? "indeterminate"
      : false;

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        for (const id of pageIds) next.delete(id);
      } else {
        for (const id of pageIds) next.add(id);
      }
      return next;
    });
  };

  const toggleRow = (id: string, checked: boolean | "indeterminate") => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked === true) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  /* ── Mutations (local state = honest demo persistence) ────────── */
  const clearFilters = () => {
    setQuery("");
    setSeverityFilter("all");
    setStatusFilter("all");
    setSourceFilter("all");
    setPage(1);
  };

  const handleCreate = (values: NewSignalInput) => {
    const id = nextSignalId(signals);
    const created: Signal = {
      id,
      title: values.title,
      description: values.description,
      severity: values.severity,
      status: "new",
      source: values.source,
      tags: ["manual"],
      assigneeId: null,
      impact: IMPACT_BY_SEVERITY[values.severity],
      createdAt: dataNow,
      updatedAt: dataNow,
    };
    setSignals((prev) => [created, ...prev]);
    toast.success("Signal created", {
      description: `${id} · ${values.title}`,
    });
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      toast.success("Export queued", {
        description: `A CSV of ${plural(filtered.length, "signal")} will arrive in your inbox shortly.`,
      });
    }, 900);
  };

  const changeStatus = (id: string, status: SignalStatus) => {
    setSignals((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status, updatedAt: dataNow } : s
      )
    );
    toast.success(`${id} moved to ${statusLabel(status).toLowerCase()}`);
  };

  const assignSignal = (id: string, memberId: string | null) => {
    setSignals((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, assigneeId: memberId, updatedAt: dataNow } : s
      )
    );
    const member = memberId ? getMemberById(memberId) : undefined;
    toast.success(
      member ? `${id} assigned to ${member.name}` : `${id} unassigned`
    );
  };

  const bulkAssignToMe = () => {
    const me = getCurrentUser();
    const ids = new Set(selected);
    setSignals((prev) =>
      prev.map((s) =>
        ids.has(s.id) ? { ...s, assigneeId: me.id, updatedAt: dataNow } : s
      )
    );
    toast.success(`${plural(ids.size, "signal")} assigned to you`);
    setSelected(new Set());
  };

  const bulkResolve = () => {
    const ids = new Set(selected);
    setSignals((prev) =>
      prev.map((s) =>
        ids.has(s.id)
          ? { ...s, status: "resolved" as const, updatedAt: dataNow }
          : s
      )
    );
    toast.success(`${plural(ids.size, "signal")} marked resolved`);
    setSelected(new Set());
  };

  const focusSignal = focusId
    ? (signals.find((s) => s.id === focusId) ?? null)
    : null;

  return (
    <PageContainer className="pb-12">
      <Reveal>
        <PageHeader
          title="Signals"
          description={`${activeCount} active · ${metrics.resolvedThisWeek} resolved this week. The full stream from every connected source, ranked by severity and impact.`}
          actions={
            <>
              <Button
                variant="secondary"
                loading={exporting}
                onClick={handleExport}
              >
                {exporting ? null : <Download aria-hidden />}
                Export CSV
              </Button>
              <NewSignalDialog onCreate={handleCreate} />
            </>
          }
        />
      </Reveal>

      {/* ── Filter bar ────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => applyQuery(e.target.value)}
            placeholder="Search id, title or tag"
            aria-label="Search signals"
            className="pl-8"
          />
        </div>

        <Select
          value={severityFilter}
          onValueChange={(v) => applySeverityFilter(v as SeverityFilter)}
        >
          <SelectTrigger
            aria-label="Filter by severity"
            className="w-[124px] sm:w-[136px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            {SEVERITY_ORDER.map((severity) => (
              <SelectItem key={severity} value={severity}>
                {severityLabel(severity)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => applyStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger
            aria-label="Filter by status"
            className="w-[132px] sm:w-[148px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_ORDER.map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={applySourceFilter}>
          <SelectTrigger
            aria-label="Filter by source"
            className="w-[128px] sm:w-[140px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {sources.map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X aria-hidden />
            Clear
          </Button>
        ) : null}

        <div className="ml-auto flex items-center gap-3">
          <span className="tabular whitespace-nowrap text-[13px] text-ink-muted">
            {filtered.length} of {signals.length} signals
          </span>
          <Tabs
            value={sortMode}
            onValueChange={(v) => applySortMode(v as SortMode)}
          >
            <TabsSegment aria-label="Sort order">
              <TabsSegmentTrigger value="severity">Severity</TabsSegmentTrigger>
              <TabsSegmentTrigger value="newest">Newest</TabsSegmentTrigger>
            </TabsSegment>
          </Tabs>
        </div>
      </div>

      {/* ── Bulk action bar ───────────────────────────────────────── */}
      {selected.size > 0 ? (
        <div className="sticky top-16 z-20 mt-4 flex flex-wrap items-center gap-2 rounded-md border border-halo-500/30 bg-overlay/95 px-3 py-2 shadow-float backdrop-blur-md">
          <span className="tabular text-[13px] font-medium text-halo-300">
            {selected.size} selected
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2 sm:ml-3">
            <Button variant="secondary" size="sm" onClick={bulkAssignToMe}>
              <UserCheck aria-hidden />
              Assign to me
            </Button>
            <Button variant="secondary" size="sm" onClick={bulkResolve}>
              <CheckCheck aria-hidden />
              Mark resolved
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      {/* ── Table / empty state ───────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Radar}
            title="No signals match"
            description="Nothing in the stream matches the current filters. Loosen the search or clear the filters to see the full backlog."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="surface-panel mt-4 overflow-hidden rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={headerChecked}
                    onCheckedChange={toggleAllOnPage}
                    aria-label="Select all signals on this page"
                  />
                </TableHead>
                <TableHead>Signal</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((s) => {
                const assignee = getMemberById(s.assigneeId);
                const isSelected = selected.has(s.id);
                const extraTags = s.tags.length - 2;
                return (
                  <TableRow
                    key={s.id}
                    data-state={isSelected ? "selected" : undefined}
                    onClick={() => openSignal(s.id)}
                    className="cursor-pointer"
                  >
                    <TableCell
                      className="w-12"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => toggleRow(s.id, checked)}
                        aria-label={`Select ${s.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[220px] max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-2xs text-ink-muted">
                            {s.id}
                          </span>
                          {s.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                          {extraTags > 0 ? (
                            <span className="text-2xs text-ink-faint">
                              +{extraTags}
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSignal(s.id);
                          }}
                          className="mt-1 block max-w-full truncate rounded-xs text-left text-sm font-medium text-ink transition-colors hover:text-halo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-halo-500"
                        >
                          {s.title}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={s.severity} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="text-[13px] text-ink-secondary">
                      {s.source}
                    </TableCell>
                    <TableCell>
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={assignee.name} size="xs" />
                          <span className="text-[13px] text-ink-secondary">
                            {firstName(assignee.name)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="tabular w-6 text-right text-[13px] text-ink">
                          {s.impact}
                        </span>
                        <Progress
                          value={s.impact}
                          className="w-12"
                          aria-label={`Impact ${s.impact} of 100`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[13px] text-ink-muted">
                      {formatRelative(s.createdAt, dataNow)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* ── Pagination ────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edge px-4 py-3">
            <p className="tabular text-[13px] text-ink-muted">
              Showing {rangeStart}–{rangeEnd} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft aria-hidden />
                Prev
              </Button>
              <span className="tabular whitespace-nowrap text-[13px] text-ink-secondary">
                Page {currentPage} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === pageCount}
              >
                Next
                <ChevronRight aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      )}

      <SignalDrawer
        signal={focusSignal}
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) setDrawerOpen(false);
        }}
        onChangeStatus={changeStatus}
        onAssign={assignSignal}
      />
    </PageContainer>
  );
}

export default function SignalsPage() {
  return (
    <React.Suspense fallback={null}>
      <SignalsWorkspace />
    </React.Suspense>
  );
}
