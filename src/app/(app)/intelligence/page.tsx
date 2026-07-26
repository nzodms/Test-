"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Minus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { HaloField } from "@/components/halo/halo-field";
import { MagneticCard } from "@/components/halo/magnetic";
import { Reveal } from "@/components/halo/reveal";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsSegment, TabsSegmentTrigger } from "@/components/ui/tabs";
import {
  dataNow,
  getAnomalies,
  getDailySeries,
  getMetrics,
  getTrends,
  type DailyPoint,
  type Severity,
  type Trend,
} from "@/lib/data";
import { cn, formatDate, formatDelta, formatNumber, formatRelative } from "@/lib/utils";

/* ── Chart constants (shared with the rest of the app) ─────────── */

const HALO = "#5ECFE3";
const POSITIVE = "#63d39e";

const axisTick = { fill: "#626e85", fontSize: 10 };
const tooltipStyle = {
  background: "#1b2130",
  border: "1px solid rgb(154 170 207 / 0.2)",
  borderRadius: 8,
  fontSize: 12,
  color: "#e9edf5",
};
const gridStroke = "rgb(154 170 207 / 0.07)";
const chartMargin = { top: 8, right: 4, left: -10, bottom: 0 };

/* ── Derived, deterministic page data ──────────────────────────── */

const metrics = getMetrics();
const trends = getTrends();
const anomalies = getAnomalies();
const series = getDailySeries();

const sumBy = (
  points: DailyPoint[],
  key: "detected" | "resolved" | "automationRuns"
) => points.reduce((acc, p) => acc + p[key], 0);

const avgResponse = (points: DailyPoint[]) =>
  points.length === 0
    ? 0
    : Math.round(
        (points.reduce((acc, p) => acc + p.responseHours, 0) / points.length) *
          10
      ) / 10;

const thisWeek = series.slice(-7);
const lastWeek = series.slice(-14, -7);

const detectedDelta =
  metrics.detectedThisWeek / Math.max(1, metrics.detectedPrevWeek) - 1;
const responseDelta =
  metrics.medianResponseHours / Math.max(0.1, metrics.medianResponseHoursPrev) -
  1;
const responseFasterPct = Math.abs(Math.round(responseDelta * 100));
const resolutionRate = Math.round(
  (metrics.resolvedThisWeek / Math.max(1, metrics.detectedThisWeek)) * 100
);

/* Week-over-week comparison rows. `betterWhenLower` flips the delta
   coloring for metrics where a decrease is the improvement. */

interface ComparisonRow {
  label: string;
  current: number;
  previous: number;
  betterWhenLower: boolean;
  format: (v: number) => string;
}

const comparisonRows: ComparisonRow[] = [
  {
    label: "Detected",
    current: sumBy(thisWeek, "detected"),
    previous: sumBy(lastWeek, "detected"),
    betterWhenLower: false,
    format: formatNumber,
  },
  {
    label: "Resolved",
    current: sumBy(thisWeek, "resolved"),
    previous: sumBy(lastWeek, "resolved"),
    betterWhenLower: false,
    format: formatNumber,
  },
  {
    label: "Median response (h)",
    current: avgResponse(thisWeek),
    previous: avgResponse(lastWeek),
    betterWhenLower: true,
    format: (v) => v.toFixed(1),
  },
  {
    label: "Automation runs",
    current: sumBy(thisWeek, "automationRuns"),
    previous: sumBy(lastWeek, "automationRuns"),
    betterWhenLower: false,
    format: formatNumber,
  },
];

/* ── Presentation maps ─────────────────────────────────────────── */

const trendIcon: Record<Trend["direction"], LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

const trendToneClass: Record<Trend["tone"], string> = {
  positive: "text-positive",
  negative: "text-critical",
  neutral: "text-ink-muted",
};

const severityVariant: Record<
  Severity,
  "critical" | "caution" | "halo" | "neutral"
> = {
  critical: "critical",
  high: "caution",
  medium: "halo",
  low: "neutral",
};

const severityStripe: Record<Severity, string> = {
  critical: "border-l-critical",
  high: "border-l-caution",
  medium: "border-l-halo-400",
  low: "border-l-edge-strong",
};

const deviationClass: Record<Severity, string> = {
  critical: "text-critical",
  high: "text-caution",
  medium: "text-halo-300",
  low: "text-ink-secondary",
};

type Range = "4w" | "8w";

/* ── Page ──────────────────────────────────────────────────────── */

export default function IntelligencePage() {
  const [range, setRange] = React.useState<Range>("8w");

  const chartData = React.useMemo(
    () => (range === "4w" ? series.slice(-28) : series),
    [range]
  );
  const rangeLabel = range === "4w" ? "last 4 weeks" : "last 8 weeks";

  return (
    <PageContainer className="pb-16">
      <Reveal>
        <PageHeader
          title="Intelligence"
          description="Trends, anomalies and the why behind them."
          actions={
            <Tabs
              value={range}
              onValueChange={(value) =>
                setRange(value === "4w" ? "4w" : "8w")
              }
            >
              <TabsSegment aria-label="Time range for all charts">
                <TabsSegmentTrigger value="4w">4w</TabsSegmentTrigger>
                <TabsSegmentTrigger value="8w">8w</TabsSegmentTrigger>
              </TabsSegment>
            </Tabs>
          }
        />
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <WeekInNumbers />
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <TrendsSection />
      </Reveal>

      <Reveal delay={0.05} className="mt-10">
        <ChartsSection data={chartData} rangeLabel={rangeLabel} />
      </Reveal>

      <Reveal delay={0.05} className="mt-10">
        <AnomaliesSection />
      </Reveal>

      <Reveal delay={0.05} className="mt-10">
        <ComparisonSection />
      </Reveal>
    </PageContainer>
  );
}

/* ── 1 · This week in numbers ──────────────────────────────────── */

function Num({ children }: { children: React.ReactNode }) {
  return <strong className="tabular font-semibold text-ink">{children}</strong>;
}

function WeekInNumbers() {
  return (
    <section
      aria-labelledby="week-in-numbers-heading"
      className="surface-panel relative overflow-hidden rounded-lg p-5 sm:p-6"
    >
      <HaloField x={62} y={38} strength={0.12} tone="halo" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-halo-300" aria-hidden />
          <h2 id="week-in-numbers-heading" className="text-label">
            This week in numbers
          </h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
          Halo detected <Num>{formatNumber(metrics.detectedThisWeek)}</Num>{" "}
          signals this week, up{" "}
          <Num>{formatDelta(detectedDelta)}</Num> from{" "}
          <span className="tabular">
            {formatNumber(metrics.detectedPrevWeek)}
          </span>{" "}
          the week before — most of the increase is operational drift from the
          newer connectors, not incidents. The team closed{" "}
          <Num>{formatNumber(metrics.resolvedThisWeek)}</Num> of them, a{" "}
          <Num>{resolutionRate}%</Num> resolution rate against intake. Median
          time to first response now sits at{" "}
          <Num>{metrics.medianResponseHours}h</Num>,{" "}
          <Num>{responseFasterPct}%</Num> faster than last week&apos;s{" "}
          <span className="tabular">{metrics.medianResponseHoursPrev}h</span>,
          largely because auto-assignment keeps payment and data signals out of
          the triage queue.
        </p>
      </div>
    </section>
  );
}

/* ── 2 · Trends ────────────────────────────────────────────────── */

function TrendsSection() {
  return (
    <section aria-labelledby="trends-heading">
      <h2 id="trends-heading" className="text-label">
        Four-week trends
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {trends.map((trend) => {
          const Icon = trendIcon[trend.direction];
          return (
            <MagneticCard key={trend.id} className="p-5" lift>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-medium text-ink">{trend.title}</h3>
                <Icon
                  className={cn("size-4 shrink-0", trendToneClass[trend.tone])}
                  aria-hidden
                />
              </div>
              <p
                className={cn(
                  "tabular mt-2 text-lg font-semibold tracking-tight",
                  trendToneClass[trend.tone]
                )}
              >
                {trend.change}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {trend.summary}
              </p>
            </MagneticCard>
          );
        })}
      </div>
    </section>
  );
}

/* ── 3 · Charts ────────────────────────────────────────────────── */

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-2xs text-ink-secondary">
      <span
        aria-hidden
        className="size-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function ChartsSection({
  data,
  rangeLabel,
}: {
  data: DailyPoint[];
  rangeLabel: string;
}) {
  return (
    <section aria-labelledby="charts-heading" className="space-y-4">
      <h2 id="charts-heading" className="text-label">
        Signal mechanics · {rangeLabel}
      </h2>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Detected vs resolved */}
        <div className="surface-card rounded-lg p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-sm font-medium text-ink">
              Detected vs resolved
            </h3>
            <div className="flex items-center gap-3">
              <LegendDot color={HALO} label="Detected" />
              <LegendDot color={POSITIVE} label="Resolved" />
            </div>
          </div>
          <p className="mt-1 text-2xs text-ink-faint">
            Daily counts — the gap between the lines is the open backlog
            forming or draining.
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={chartMargin}>
                <defs>
                  <linearGradient
                    id="intel-detected"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={HALO} stopOpacity={0.26} />
                    <stop offset="100%" stopColor={HALO} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="intel-resolved"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={POSITIVE} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={POSITIVE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatDate(String(v))}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={32}
                />
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={34}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(v) => formatDate(String(v))}
                  cursor={{ stroke: "rgb(154 170 207 / 0.25)" }}
                />
                <Area
                  type="monotone"
                  dataKey="detected"
                  name="Detected"
                  stroke={HALO}
                  strokeWidth={2}
                  fill="url(#intel-detected)"
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke={POSITIVE}
                  strokeWidth={2}
                  fill="url(#intel-resolved)"
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Median response time */}
        <div className="surface-card rounded-lg p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-sm font-medium text-ink">
              Median response time
            </h3>
            <LegendDot color={HALO} label="Hours to first response" />
          </div>
          <p className="mt-1 text-2xs text-ink-faint">
            Now{" "}
            <span className="tabular font-medium text-positive">
              {metrics.medianResponseHours}h
            </span>{" "}
            — {responseFasterPct}% faster than last week&apos;s{" "}
            <span className="tabular">{metrics.medianResponseHoursPrev}h</span>.
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={chartMargin}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatDate(String(v))}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={32}
                />
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={34}
                  tickFormatter={(v) => `${v}h`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(v) => formatDate(String(v))}
                  formatter={(value) => [`${value}h`, "Median response"]}
                  cursor={{ stroke: "rgb(154 170 207 / 0.25)" }}
                />
                <Line
                  type="monotone"
                  dataKey="responseHours"
                  name="Median response"
                  stroke={HALO}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Automation runs — full width */}
      <div className="surface-card rounded-lg p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-sm font-medium text-ink">Automation runs</h3>
          <LegendDot color={HALO} label="Runs per day" />
        </div>
        <p className="mt-1 text-2xs text-ink-faint">
          {formatNumber(metrics.automationRunsThisWeek)} runs this week at{" "}
          <span className="tabular">{metrics.automationSuccessRate}%</span>{" "}
          success across {metrics.automationsEnabled} active automations.
        </p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={chartMargin}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatDate(String(v))}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                minTickGap={32}
              />
              <YAxis
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                width={34}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(v) => formatDate(String(v))}
                cursor={{ fill: "rgb(154 170 207 / 0.06)" }}
              />
              <Bar
                dataKey="automationRuns"
                name="Runs"
                fill="rgba(94, 207, 227, 0.7)"
                radius={[3, 3, 0, 0]}
                maxBarSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

/* ── 4 · Anomalies ─────────────────────────────────────────────── */

function AnomaliesSection() {
  return (
    <section aria-labelledby="anomalies-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="anomalies-heading" className="text-label">
          Open anomalies
        </h2>
        <p className="text-2xs text-ink-faint">
          Detected by baseline watchers · explanations generated from correlated
          events
        </p>
      </div>
      <div className="mt-3 space-y-3">
        {anomalies.map((anomaly) => (
          <article
            key={anomaly.id}
            aria-label={anomaly.title}
            className={cn(
              "surface-panel rounded-lg border-l-2 p-5",
              severityStripe[anomaly.severity]
            )}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 className="text-sm font-medium text-ink">{anomaly.title}</h3>
              <Badge
                variant={severityVariant[anomaly.severity]}
                dot
                className="capitalize"
              >
                {anomaly.severity}
              </Badge>
              <span className="font-mono text-2xs text-ink-faint">
                {anomaly.metric}
              </span>
              <span
                className={cn(
                  "tabular text-2xs font-medium",
                  deviationClass[anomaly.severity]
                )}
              >
                {anomaly.deviation}
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-secondary">
              {anomaly.explanation}
            </p>
            <div className="surface-well mt-3 rounded-md px-4 py-3">
              <p className="text-sm text-ink-secondary">
                <span className="font-medium text-halo-300">Recommended:</span>{" "}
                {anomaly.recommendation}
              </p>
            </div>
            <footer className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              {anomaly.relatedSignalId ? (
                <Link
                  href={`/signals?focus=${anomaly.relatedSignalId}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-halo-300 transition-colors hover:text-halo-200"
                >
                  Open {anomaly.relatedSignalId}
                  <ArrowUpRight className="size-3" aria-hidden />
                </Link>
              ) : (
                <span className="text-xs text-ink-faint">
                  No linked signal yet
                </span>
              )}
              <span className="text-2xs text-ink-faint">
                Detected {formatRelative(anomaly.detectedAt, dataNow)}
              </span>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── 5 · Week-over-week comparison ─────────────────────────────── */

function ComparisonSection() {
  return (
    <section aria-labelledby="comparison-heading">
      <h2 id="comparison-heading" className="text-label">
        Week over week
      </h2>
      <div className="surface-panel mt-3 rounded-lg py-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">This week</TableHead>
              <TableHead className="text-right">Last week</TableHead>
              <TableHead className="text-right">
                <abbr title="Change vs last week" className="no-underline">
                  Δ
                </abbr>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisonRows.map((row) => {
              const delta = row.current / Math.max(0.1, row.previous) - 1;
              const improved = row.betterWhenLower ? delta < 0 : delta > 0;
              const flat = Math.abs(delta) < 0.001;
              return (
                <TableRow key={row.label}>
                  <TableCell className="font-medium text-ink">
                    {row.label}
                    {row.betterWhenLower ? (
                      <span className="ml-2 text-2xs font-normal text-ink-faint">
                        lower is better
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="tabular text-right text-ink">
                    {row.format(row.current)}
                  </TableCell>
                  <TableCell className="tabular text-right text-ink-secondary">
                    {row.format(row.previous)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "tabular text-right font-medium",
                      flat
                        ? "text-ink-muted"
                        : improved
                          ? "text-positive"
                          : "text-critical"
                    )}
                  >
                    {formatDelta(delta)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="mt-2 text-2xs text-ink-faint">
        Computed from the daily series: current 7 days vs the 7 days prior.
      </p>
    </section>
  );
}
