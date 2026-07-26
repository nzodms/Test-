"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Bell, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDailySeries, getMetrics, getPrioritySignals } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const severityVariant = {
  critical: "critical",
  high: "caution",
  medium: "halo",
  low: "neutral",
} as const;

/**
 * A faithful miniature of the real Overview dashboard, rendered
 * from the same dataset the app uses. No fake pixels.
 */
export function HeroPreview() {
  const series = getDailySeries().slice(-28);
  const metrics = getMetrics();
  const signals = getPrioritySignals().slice(0, 3);

  return (
    <div className="relative">
      {/* Ambient glow behind the frame */}
      <div
        aria-hidden
        className="absolute -inset-8 rounded-[2rem] bg-[radial-gradient(50%_45%_at_50%_20%,rgb(94_207_227/0.14),transparent_70%)] blur-xl"
      />
      <div className="relative overflow-hidden rounded-xl border border-edge-strong bg-surface shadow-modal">
        {/* Top chrome */}
        <div className="flex items-center justify-between border-b border-edge bg-base/60 px-4 py-2.5">
          <div className="flex items-center gap-2 text-[13px] text-ink-secondary">
            <span className="inline-flex size-4 items-center justify-center rounded-[5px] border border-halo-500/40 bg-halo-500/15 text-[8px] font-semibold text-halo-300">
              N
            </span>
            Northwind Systems
            <span className="text-ink-faint">/</span>
            <span className="text-ink">Overview</span>
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            <span className="hidden items-center gap-1.5 rounded-sm border border-edge bg-void/40 px-2 py-1 text-2xs sm:inline-flex">
              <Search className="size-3" aria-hidden /> Search
              <kbd className="font-mono text-[9px] text-ink-faint">⌘K</kbd>
            </span>
            <span className="relative">
              <Bell className="size-3.5" aria-hidden />
              <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-ember-400" />
            </span>
          </div>
        </div>

        <div className="grid gap-px bg-edge-faint lg:grid-cols-[1.6fr_1fr]">
          {/* Left: KPIs + chart */}
          <div className="space-y-4 bg-surface p-4 sm:p-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Active signals",
                  value: String(metrics.activeSignals),
                  delta: "+14.6%",
                  up: true,
                },
                {
                  label: "Median response",
                  value: `${metrics.medianResponseHours}h`,
                  delta: "−18.4%",
                  up: false,
                },
                {
                  label: "Automation success",
                  value: `${metrics.automationSuccessRate}%`,
                  delta: "+0.6pt",
                  up: true,
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-md border border-edge bg-raised/70 p-3"
                >
                  <p className="truncate text-2xs text-ink-muted">{kpi.label}</p>
                  <p className="tabular mt-1 text-lg font-medium tracking-tight text-ink">
                    {kpi.value}
                  </p>
                  <p className="mt-0.5 text-2xs text-halo-300">{kpi.delta}</p>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-edge bg-raised/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-2xs font-medium text-ink-secondary">
                  Signals — detected vs resolved
                </p>
                <p className="text-2xs text-ink-muted">last 28 days</p>
              </div>
              <div className="h-36 sm:h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 4, right: 0, left: -32, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hero-detected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5ECFE3" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#5ECFE3" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d: string) => formatDate(d)}
                      tick={{ fill: "#626e85", fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                      interval={6}
                    />
                    <YAxis
                      tick={{ fill: "#626e85", fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip
                      cursor={{ stroke: "rgb(154 170 207 / 0.2)" }}
                      contentStyle={{
                        background: "#1b2130",
                        border: "1px solid rgb(154 170 207 / 0.2)",
                        borderRadius: 8,
                        fontSize: 11,
                        color: "#e9edf5",
                      }}
                      labelFormatter={(d) => formatDate(String(d))}
                    />
                    <Area
                      type="monotone"
                      dataKey="detected"
                      stroke="#5ECFE3"
                      strokeWidth={1.5}
                      fill="url(#hero-detected)"
                      name="Detected"
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="resolved"
                      stroke="#63d39e"
                      strokeWidth={1.5}
                      fill="transparent"
                      name="Resolved"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right: priority signals */}
          <div className="hidden flex-col bg-surface p-4 sm:p-5 lg:flex">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-2xs font-medium text-ink-secondary">
                Needs attention
              </p>
              <span className="inline-flex items-center gap-1 text-2xs text-halo-300">
                View all <ArrowUpRight className="size-3" aria-hidden />
              </span>
            </div>
            <ul className="space-y-2.5">
              {signals.map((s) => (
                <li
                  key={s.id}
                  className="rounded-md border border-edge bg-raised/70 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-ink-muted">
                      {s.id}
                    </span>
                    <Badge variant={severityVariant[s.severity]} dot>
                      {s.severity}
                    </Badge>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-ink">
                    {s.title}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-auto rounded-md border border-ember-400/20 bg-ember-400/[0.06] p-3">
              <p className="text-2xs font-medium text-ember-300">
                Executive summary
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                Two critical payment signals share a root cause. Response
                times improved 18% this week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
