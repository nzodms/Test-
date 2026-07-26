"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  FileText,
  Radar,
  Settings,
  Sparkles,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { AnimatedNumber } from "@/components/halo/animated-number";
import { HaloField } from "@/components/halo/halo-field";
import { Reveal } from "@/components/halo/reveal";
import { KpiRow, type KpiKey } from "@/components/overview/kpi-row";
import { OverviewChart } from "@/components/overview/overview-chart";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import {
  dataNow,
  getActivity,
  getAnomalies,
  getCurrentUser,
  getMemberById,
  getMetrics,
  getPrioritySignals,
  getReports,
  getWorkspaces,
  type ActivityKind,
  type Severity,
} from "@/lib/data";
import {
  formatCompact,
  formatDelta,
  formatNumber,
  formatRelative,
} from "@/lib/utils";

/* ── Derived, deterministic page data ──────────────────────────── */

const user = getCurrentUser();
const metrics = getMetrics();
const anomalies = getAnomalies();
const prioritySignals = getPrioritySignals();
const workspace = getWorkspaces()[0];
const generatingReport = getReports().find((r) => r.status === "generating");
const recentActivity = [...getActivity()]
  .sort((a, b) => (a.at < b.at ? 1 : -1))
  .slice(0, 8);

const firstName = user.name.split(" ")[0] ?? user.name;
const anchor = new Date(dataNow);
const hourUtc = anchor.getUTCHours();
const daypart =
  hourUtc < 12 ? "morning" : hourUtc < 17 ? "afternoon" : "evening";
const weekday = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: "UTC",
}).format(anchor);

const contextNote = [
  `${weekday} ${daypart} at ${workspace?.name ?? "your workspace"}:`,
  `${metrics.criticalOpen} critical signals are open`,
  generatingReport
    ? `and the ${generatingReport.title} is generating now.`
    : `across ${metrics.activeSignals} active signals.`,
].join(" ");

const topAnomaly = anomalies[0];
const responseFasterPct = Math.abs(
  Math.round(
    ((metrics.medianResponseHoursPrev - metrics.medianResponseHours) /
      metrics.medianResponseHoursPrev) *
      100
  )
);
const opportunityDelta = formatDelta(
  (metrics.opportunityValue - metrics.opportunityValuePrev) /
    metrics.opportunityValuePrev
);

const summarySentences = [
  `${workspace?.name ?? "The workspace"} is tracking ${metrics.activeSignals} active signals — up from ${metrics.activeSignalsPrev} last week — with ${metrics.criticalOpen} rated critical.`,
  topAnomaly
    ? `The sharpest deviation is ${topAnomaly.title} (${topAnomaly.deviation})${topAnomaly.relatedSignalId ? `, tracked as ${topAnomaly.relatedSignalId}` : ""}.`
    : null,
  `Median response improved ${responseFasterPct}% week-over-week to ${metrics.medianResponseHours}h, automations completed ${formatNumber(metrics.automationRunsThisWeek)} runs at ${metrics.automationSuccessRate}% success, and tracked opportunity value rose ${opportunityDelta} to $${formatCompact(metrics.opportunityValue)}.`,
].filter((s): s is string => s !== null);

const severityVariant: Record<
  Severity,
  "critical" | "caution" | "halo" | "neutral"
> = {
  critical: "critical",
  high: "caution",
  medium: "halo",
  low: "neutral",
};

const activityIcon: Record<ActivityKind, LucideIcon> = {
  signal: Radar,
  automation: Workflow,
  member: Users,
  report: FileText,
  settings: Settings,
  alert: AlertTriangle,
};

/* ── Page ──────────────────────────────────────────────────────── */

export default function OverviewPage() {
  const [kpi, setKpi] = React.useState<KpiKey>("signals");

  return (
    <PageContainer className="pb-14">
      <Reveal>
        <PageHeader
          title={`Good ${daypart}, ${firstName}`}
          description={contextNote}
          actions={
            <>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/automations?new=1">New automation</Link>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <Link href="/team?invite=1">Invite teammate</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signals">Review signals</Link>
              </Button>
            </>
          }
        />
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <ExecutiveSummary />
      </Reveal>

      <Reveal delay={0.1} className="mt-6">
        <KpiRow selected={kpi} onSelect={setKpi} />
      </Reveal>

      <Reveal delay={0.15} className="mt-4">
        <OverviewChart kpi={kpi} />
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-8">
          <Reveal>
            <NeedsAttention />
          </Reveal>
          <Reveal delay={0.05}>
            <RecommendedActions />
          </Reveal>
        </div>
        <div className="min-w-0 space-y-8">
          <Reveal delay={0.05}>
            <LiveActivity />
          </Reveal>
          <Reveal delay={0.1}>
            <AutomationHealth />
          </Reveal>
        </div>
      </div>
    </PageContainer>
  );
}

/* ── Modules ───────────────────────────────────────────────────── */

function ExecutiveSummary() {
  return (
    <section
      aria-labelledby="executive-summary-heading"
      className="surface-panel relative overflow-hidden rounded-lg p-5 sm:p-6"
    >
      <HaloField x={80} y={12} strength={0.08} tone="ember" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-ember-300" aria-hidden />
          <h2 id="executive-summary-heading" className="text-label">
            Executive summary{" "}
            <span className="normal-case tracking-normal text-ink-faint">
              · generated from this week&apos;s data
            </span>
          </h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
          {summarySentences.join(" ")}
        </p>
      </div>
    </section>
  );
}

function NeedsAttention() {
  return (
    <section
      aria-labelledby="needs-attention-heading"
      className="surface-panel rounded-lg"
    >
      <header className="flex items-center justify-between gap-3 px-5 pt-4">
        <h2 id="needs-attention-heading" className="text-label">
          Needs attention
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/signals">
            Open queue
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </header>
      <ul className="divide-y divide-edge px-5 pb-2">
        {prioritySignals.map((signal) => {
          const assignee = getMemberById(signal.assigneeId);
          return (
            <li key={signal.id} className="flex items-start gap-3 py-3.5">
              <Badge
                variant={severityVariant[signal.severity]}
                dot
                className="mt-0.5 capitalize"
              >
                {signal.severity}
              </Badge>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="tabular shrink-0 font-mono text-2xs text-ink-faint">
                    {signal.id}
                  </span>
                  <Link
                    href={`/signals?focus=${signal.id}`}
                    className="truncate text-sm font-medium text-ink transition-colors hover:text-halo-300"
                  >
                    {signal.title}
                  </Link>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-ink-muted">
                  <span>{signal.source}</span>
                  <span aria-hidden>·</span>
                  <span>{formatRelative(signal.createdAt, dataNow)}</span>
                  {assignee ? (
                    <>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1.5">
                        <Avatar name={assignee.name} size="xs" />
                        {assignee.name}
                      </span>
                    </>
                  ) : null}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function RecommendedActions() {
  return (
    <section aria-labelledby="recommended-actions-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="recommended-actions-heading" className="text-label">
          Recommended actions
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/intelligence">
            Intelligence
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {anomalies.map((anomaly) => (
          <Link
            key={anomaly.id}
            href="/intelligence"
            className="group flex items-start gap-3 rounded-md border border-edge bg-raised px-4 py-3 transition-colors hover:border-halo-500/30 hover:bg-lifted"
          >
            <ArrowUpRight
              className="mt-0.5 size-3.5 shrink-0 text-halo-300"
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink transition-colors group-hover:text-halo-300">
                {anomaly.title}
              </span>
              <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-ink-muted">
                {anomaly.recommendation}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LiveActivity() {
  return (
    <section aria-labelledby="live-activity-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="live-activity-heading" className="text-label">
          Live activity
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/activity">
            View all
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
      <ol className="mt-3">
        {recentActivity.map((event, index) => {
          const Icon = activityIcon[event.kind];
          return (
            <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
              {index < recentActivity.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute top-6 bottom-0 left-[11px] w-px bg-edge"
                />
              ) : null}
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-edge bg-raised">
                <Icon className="size-3 text-ink-muted" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="truncate text-xs text-ink-secondary">
                  <span className="font-medium text-ink">{event.actor}</span>{" "}
                  {event.action}{" "}
                  <span className="text-ink">{event.target}</span>
                </p>
                <p className="mt-0.5 text-2xs text-ink-faint">
                  {formatRelative(event.at, dataNow)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function AutomationHealth() {
  const coverage = Math.round(
    (metrics.automationsEnabled / metrics.automationsTotal) * 100
  );
  return (
    <section
      aria-labelledby="automation-health-heading"
      className="surface-card rounded-lg p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="automation-health-heading" className="text-label">
          Automation health
        </h2>
        <Badge variant="positive" dot>
          {metrics.automationSuccessRate}% success
        </Badge>
      </div>
      <p className="mt-3 text-sm text-ink-secondary">
        <AnimatedNumber
          value={metrics.automationsEnabled}
          className="tabular font-semibold text-ink"
        />{" "}
        of <span className="tabular">{metrics.automationsTotal}</span>{" "}
        automations active ·{" "}
        <span className="tabular">
          {formatNumber(metrics.automationRunsThisWeek)}
        </span>{" "}
        runs this week
      </p>
      <Progress
        value={coverage}
        tone="halo"
        className="mt-3"
        aria-label={`${metrics.automationsEnabled} of ${metrics.automationsTotal} automations active`}
      />
      <Button variant="ghost" size="sm" asChild className="-ml-2 mt-3">
        <Link href="/automations">
          Manage automations
          <ArrowRight aria-hidden />
        </Link>
      </Button>
    </section>
  );
}
