"use client";

import * as React from "react";
import { FilePlus2, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { HaloField } from "@/components/halo/halo-field";
import { Reveal } from "@/components/halo/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress, Spinner } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/states";
import { Tabs, TabsSegment, TabsSegmentTrigger } from "@/components/ui/tabs";
import {
  GenerateReportDialog,
  type GenerateReportInput,
  type ReportPeriodChoice,
  type ReportType,
} from "@/components/reports/generate-report-dialog";
import { ReportPreviewDialog } from "@/components/reports/report-preview-dialog";
import { dataNow, getMetrics, getReports } from "@/lib/data";
import type { Report, ReportStatus } from "@/lib/data";
import { formatNumber, formatRelative } from "@/lib/utils";

const metrics = getMetrics();

/* ── Deterministic content for simulated compilation ─────────────── */

const TYPE_TITLES: Record<ReportType, string> = {
  weekly: "Weekly Operations Review",
  risk: "Risk Assessment",
  roi: "Automation ROI",
};

/** Period tags and ranges anchored to the dataset "now" (Jul 24). */
const PERIOD_META: Record<ReportPeriodChoice, { tag: string; range: string }> =
  {
    "this-week": { tag: "W30", range: "Jul 20 – Jul 24" },
    "last-week": { tag: "W29", range: "Jul 13 – Jul 19" },
    "this-month": { tag: "July", range: "Jul 1 – Jul 24" },
  };

/** Highlights written in when a generated report finishes compiling. */
const READY_HIGHLIGHTS: Record<ReportType, string[]> = {
  weekly: [
    `${metrics.resolvedThisWeek} signals resolved against ${metrics.detectedThisWeek} detected this week`,
    `Median response time held at ${metrics.medianResponseHours}h across the period`,
  ],
  risk: [
    `${metrics.criticalOpen} critical signals open — largest exposure on the EU payment path`,
    "3 anomalies flagged for follow-up in the current window",
  ],
  roi: [
    `${formatNumber(metrics.automationRunsThisWeek)} automated runs this week at ${metrics.automationSuccessRate}% success`,
    `${metrics.automationsEnabled} of ${metrics.automationsTotal} automations currently enabled`,
  ],
};

/** Highlights for the seeded W30 review once it finishes compiling. */
const W30_HIGHLIGHTS: string[] = [
  `Median response time held at ${metrics.medianResponseHours}h across the week`,
  "Two of six EU gateway pods rolled back during the checkout investigation",
];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type PeriodFilter = "all" | "week" | "older";

function nextReportId(list: Report[]): string {
  let max = 0;
  for (const report of list) {
    const n = Number(report.id.replace(/^\D+/, ""));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `rep-${String(max + 1).padStart(2, "0")}`;
}

function createdThisWeek(report: Report): boolean {
  return Date.parse(dataNow) - Date.parse(report.createdAt) < WEEK_MS;
}

function ReportStatusBadge({ status }: { status: ReportStatus }) {
  if (status === "ready") {
    return (
      <Badge variant="positive" dot>
        Ready
      </Badge>
    );
  }
  if (status === "generating") {
    return (
      <Badge variant="caution">
        <Spinner className="size-3 text-caution" />
        Generating
      </Badge>
    );
  }
  return (
    <Badge variant="neutral" dot>
      Scheduled
    </Badge>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = React.useState<Report[]>(() =>
    getReports().map((r) => ({ ...r, highlights: [...r.highlights] }))
  );
  const [filter, setFilter] = React.useState<PeriodFilter>("all");
  const [generateOpen, setGenerateOpen] = React.useState(false);
  const [previewId, setPreviewId] = React.useState<string | null>(null);

  /* Pending compilation timers — cleared on unmount. */
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const t of pending) clearTimeout(t);
    };
  }, []);

  /* ── The seeded W30 review finishes compiling shortly after mount ──
     Guarded by a ref so the flip (and its toast) happens exactly once,
     with its own cleanup so Strict Mode's double-mount stays correct. */
  const w30Flipped = React.useRef(false);
  React.useEffect(() => {
    if (w30Flipped.current) return;
    const t = setTimeout(() => {
      w30Flipped.current = true;
      setReports((prev) =>
        prev.map((r) =>
          r.id === "rep-01" && r.status === "generating"
            ? { ...r, status: "ready" as const, highlights: W30_HIGHLIGHTS }
            : r
        )
      );
      toast.success("Weekly Operations Review — W30 is ready");
    }, 3200);
    return () => clearTimeout(t);
  }, []);

  /* ── Simulated generation lifecycle ────────────────────────────── */
  const handleGenerate = (input: GenerateReportInput) => {
    const period = PERIOD_META[input.period];
    const title = `${TYPE_TITLES[input.type]} — ${period.tag}`;
    const id = nextReportId(reports);
    const created: Report = {
      id,
      title,
      period: period.range,
      status: "generating",
      createdAt: dataNow,
      pages: 0,
      highlights: [],
      format: input.format,
    };
    setReports((prev) => [created, ...prev]);
    setGenerateOpen(false);
    toast.info("Compiling report…", {
      description: `${title} · ${period.range}`,
    });

    const pages = 10 + (title.length % 6);
    const highlights = READY_HIGHLIGHTS[input.type];
    const t = setTimeout(() => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: "ready" as const, pages, highlights }
            : r
        )
      );
      toast.success("Report ready", {
        description: `${title} · ${pages} pages`,
      });
    }, 2600);
    timers.current.push(t);
  };

  const handleExport = (title: string) => {
    toast.promise(
      new Promise<void>((resolve) => {
        setTimeout(resolve, 1400);
      }),
      {
        loading: `Preparing ${title}…`,
        success: "Export started — check your downloads",
        error: "Export failed — try again",
      }
    );
  };

  /* ── Derived rows ──────────────────────────────────────────────── */
  const filtered = reports.filter((r) => {
    if (filter === "week") return createdThisWeek(r);
    if (filter === "older") return !createdThisWeek(r);
    return true;
  });

  const readyCount = reports.filter((r) => r.status === "ready").length;
  const previewReport = previewId
    ? (reports.find((r) => r.id === previewId) ?? null)
    : null;

  return (
    <PageContainer className="pb-12">
      <Reveal>
        <PageHeader
          title="Reports"
          description="Reviews and exports, compiled from live workspace data."
          actions={
            <Button onClick={() => setGenerateOpen(true)}>
              <FilePlus2 aria-hidden />
              Generate report
            </Button>
          }
        />
      </Reveal>

      {/* ── Period filter ─────────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as PeriodFilter)}
        >
          <TabsSegment aria-label="Filter reports by period">
            <TabsSegmentTrigger value="all">All</TabsSegmentTrigger>
            <TabsSegmentTrigger value="week">This week</TabsSegmentTrigger>
            <TabsSegmentTrigger value="older">Older</TabsSegmentTrigger>
          </TabsSegment>
        </Tabs>
        <span className="tabular ml-auto whitespace-nowrap text-[13px] text-ink-muted">
          {filtered.length} of {reports.length} reports · {readyCount} ready
        </span>
      </div>

      {/* ── Report list ───────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={FileText}
            title="No reports in this range"
            description="Nothing was compiled in the selected period. Switch the filter or generate a fresh report from live workspace data."
            action={
              <Button variant="outline" onClick={() => setFilter("all")}>
                Show all reports
              </Button>
            }
          />
        </div>
      ) : (
        <Reveal delay={0.06}>
          <div className="surface-panel relative mt-4 overflow-hidden rounded-lg">
            <HaloField x={82} y={4} strength={0.07} />
            <ul className="relative divide-y divide-edge">
              {filtered.map((report) => {
                const isReady = report.status === "ready";
                const isGenerating = report.status === "generating";
                return (
                  <li
                    key={report.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                        <ReportStatusBadge status={report.status} />
                        <h2 className="text-[15px] font-medium text-ink">
                          {report.title}
                        </h2>
                      </div>

                      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-muted">
                        <span>{report.period}</span>
                        {isReady && report.pages > 0 ? (
                          <>
                            <span aria-hidden className="text-ink-faint">
                              ·
                            </span>
                            <span className="tabular">
                              {report.pages} pages
                            </span>
                          </>
                        ) : null}
                        <span aria-hidden className="text-ink-faint">
                          ·
                        </span>
                        <span className="font-mono text-2xs uppercase tracking-wider text-ink-faint">
                          {report.format}
                        </span>
                        <span aria-hidden className="text-ink-faint">
                          ·
                        </span>
                        <span>{formatRelative(report.createdAt, dataNow)}</span>
                      </p>

                      {isGenerating ? (
                        <div className="mt-3.5 max-w-xs">
                          <Progress
                            value={66}
                            className="animate-pulse-soft"
                            aria-label={`Compiling ${report.title}`}
                          />
                          <p className="mt-2 text-2xs text-ink-faint">
                            Compiling from live workspace data…
                          </p>
                        </div>
                      ) : report.highlights.length > 0 ? (
                        <ul className="mt-3 space-y-1.5">
                          {report.highlights.slice(0, 2).map((highlight) => (
                            <li
                              key={highlight}
                              className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-muted"
                            >
                              <span
                                className="mt-[7px] size-1 shrink-0 rounded-full bg-halo-400"
                                aria-hidden
                              />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPreviewId(report.id)}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!isReady}
                        onClick={() => handleExport(report.title)}
                      >
                        Export
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      )}

      <GenerateReportDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onGenerate={handleGenerate}
      />

      <ReportPreviewDialog
        report={previewReport}
        open={previewId !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewId(null);
        }}
        onExport={handleExport}
      />
    </PageContainer>
  );
}
