"use client";

import * as React from "react";
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
import { Tabs, TabsSegment, TabsSegmentTrigger } from "@/components/ui/tabs";
import { getDailySeries, type DailyPoint } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import type { KpiKey } from "@/components/overview/kpi-row";

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

interface ChartMeta {
  title: string;
  legend: Array<{ label: string; color: string }>;
  note?: string;
}

const chartMeta: Record<KpiKey, ChartMeta> = {
  signals: {
    title: "Signal flow",
    legend: [
      { label: "Detected", color: HALO },
      { label: "Resolved", color: POSITIVE },
    ],
  },
  response: {
    title: "Median response time",
    legend: [{ label: "Hours to first response", color: HALO }],
  },
  automation: {
    title: "Automation runs",
    legend: [{ label: "Runs per day", color: HALO }],
  },
  opportunity: {
    title: "Signal flow",
    legend: [
      { label: "Detected", color: HALO },
      { label: "Resolved", color: POSITIVE },
    ],
    note: "Opportunity value is appraised weekly — daily signal flow is shown for context.",
  },
};

/* Plain render functions (not components): ResponsiveContainer
   injects width/height into its direct child via cloneElement, so
   the chart element itself must be that child. */

function renderSignalFlow(data: DailyPoint[]) {
  return (
    <AreaChart data={data} margin={chartMargin}>
      <defs>
        <linearGradient id="overview-detected" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={HALO} stopOpacity={0.26} />
          <stop offset="100%" stopColor={HALO} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="overview-resolved" x1="0" y1="0" x2="0" y2="1">
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
        fill="url(#overview-detected)"
        activeDot={{ r: 3, strokeWidth: 0 }}
      />
      <Area
        type="monotone"
        dataKey="resolved"
        name="Resolved"
        stroke={POSITIVE}
        strokeWidth={2}
        fill="url(#overview-resolved)"
        activeDot={{ r: 3, strokeWidth: 0 }}
      />
    </AreaChart>
  );
}

function renderResponse(data: DailyPoint[]) {
  return (
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
  );
}

function renderAutomation(data: DailyPoint[]) {
  return (
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
        fill={HALO}
        fillOpacity={0.75}
        radius={[3, 3, 0, 0]}
        maxBarSize={16}
      />
    </BarChart>
  );
}

/**
 * The main overview chart. The series follows the KPI tile selected
 * above it; the segmented control narrows the window to the last
 * 7 or 28 days of the daily series.
 */
export function OverviewChart({ kpi }: { kpi: KpiKey }) {
  const [range, setRange] = React.useState<"7d" | "28d">("28d");

  const data = React.useMemo(() => {
    const all = getDailySeries();
    return range === "7d" ? all.slice(-7) : all.slice(-28);
  }, [range]);

  const meta = chartMeta[kpi];
  const chart =
    kpi === "response"
      ? renderResponse(data)
      : kpi === "automation"
        ? renderAutomation(data)
        : renderSignalFlow(data);

  return (
    <section
      aria-label={`${meta.title}, last ${range === "7d" ? 7 : 28} days`}
      className="surface-panel rounded-lg p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="text-label">{meta.title}</h2>
          <div className="flex items-center gap-3">
            {meta.legend.map((entry) => (
              <span
                key={entry.label}
                className="flex items-center gap-1.5 text-2xs text-ink-secondary"
              >
                <span
                  aria-hidden
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.label}
              </span>
            ))}
          </div>
        </div>
        <Tabs
          value={range}
          onValueChange={(value) => setRange(value === "7d" ? "7d" : "28d")}
        >
          <TabsSegment aria-label="Chart time range">
            <TabsSegmentTrigger value="7d">7d</TabsSegmentTrigger>
            <TabsSegmentTrigger value="28d">28d</TabsSegmentTrigger>
          </TabsSegment>
        </Tabs>
      </div>
      {meta.note ? (
        <p className="mt-2 text-2xs text-ink-faint">{meta.note}</p>
      ) : null}
      <div className="mt-4 h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      </div>
    </section>
  );
}
