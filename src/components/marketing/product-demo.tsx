"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Radar, Brain, Workflow as WorkflowIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Reveal } from "@/components/halo/reveal";
import { HaloField } from "@/components/halo/halo-field";
import {
  getAnomalies,
  getAutomations,
  getSignals,
  getMemberById,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const severityVariant = {
  critical: "critical",
  high: "caution",
  medium: "halo",
  low: "neutral",
} as const;

const tabs = [
  {
    id: "signals",
    label: "Signals",
    icon: Radar,
    blurb: "Deviations from every connected system, deduplicated and routed to an owner.",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    icon: Brain,
    blurb: "Anomalies come with an explanation and a recommended next step — not just a red number.",
  },
  {
    id: "automations",
    label: "Automations",
    icon: WorkflowIcon,
    blurb: "The repetitive response work runs itself, with success rates you can audit.",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ProductDemo() {
  const [tab, setTab] = React.useState<TabId>("signals");
  const reduced = useReducedMotion();
  const active = tabs.find((t) => t.id === tab)!;

  return (
    <section id="product" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-label text-halo-300">Product</p>
          <h2 className="text-display mt-3 text-3xl text-ink sm:text-4xl">
            Watch a workday flow through Halo
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            The same live dataset powers everything below. Switch views the
            way your team would during a Tuesday morning review.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <div
            role="tablist"
            aria-label="Product areas"
            className="flex flex-wrap gap-2"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-sm transition-all duration-200",
                  tab === t.id
                    ? "border-halo-500/40 bg-halo-500/10 text-halo-200"
                    : "border-edge bg-raised/50 text-ink-secondary hover:border-edge-strong hover:text-ink"
                )}
              >
                <t.icon className="size-4" aria-hidden />
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-3 max-w-xl text-sm text-ink-muted">{active.blurb}</p>

          <div className="relative mt-6 overflow-hidden rounded-xl border border-edge-strong bg-surface shadow-float">
            <HaloField x={tab === "signals" ? 20 : tab === "intelligence" ? 55 : 85} y={10} strength={0.09} />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                className="relative p-4 sm:p-6"
              >
                {tab === "signals" && <SignalsPanel />}
                {tab === "intelligence" && <IntelligencePanel />}
                {tab === "automations" && <AutomationsPanel />}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SignalsPanel() {
  const signals = getSignals()
    .filter((s) => s.status !== "resolved")
    .slice(0, 5);
  return (
    <ul className="divide-y divide-edge-faint">
      {signals.map((s) => {
        const assignee = getMemberById(s.assigneeId);
        return (
          <li
            key={s.id}
            className="flex flex-col gap-2 py-3.5 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:gap-4"
          >
            <span className="font-mono text-2xs text-ink-muted">{s.id}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">{s.title}</p>
              <p className="mt-0.5 truncate text-xs text-ink-muted">
                {s.source} · {s.tags.join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <Badge variant={severityVariant[s.severity]} dot>
                {s.severity}
              </Badge>
              <Badge variant="outline">{s.status}</Badge>
              {assignee ? (
                <span className="hidden text-xs text-ink-muted md:inline">
                  {assignee.name.split(" ")[0]}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function IntelligencePanel() {
  const anomaly = getAnomalies()[0]!;
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-lg border border-critical/25 bg-critical/[0.05] p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="critical" dot>
            anomaly
          </Badge>
          <span className="font-mono text-2xs text-ink-muted">
            {anomaly.metric}
          </span>
          <span className="text-2xs text-critical">{anomaly.deviation}</span>
        </div>
        <h3 className="text-title mt-3 text-base text-ink">{anomaly.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {anomaly.explanation}
        </p>
      </div>
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-edge bg-raised/60 p-4 sm:p-5">
        <div>
          <p className="text-label">Recommended next step</p>
          <p className="mt-2.5 text-sm leading-relaxed text-ink-secondary">
            {anomaly.recommendation}
          </p>
        </div>
        <p className="text-xs text-ink-muted">
          Linked to{" "}
          <span className="font-mono text-halo-300">
            {anomaly.relatedSignalId}
          </span>{" "}
          · evidence bundle attached
        </p>
      </div>
    </div>
  );
}

function AutomationsPanel() {
  const automations = getAutomations().slice(0, 4);
  return (
    <ul className="divide-y divide-edge-faint">
      {automations.map((a) => (
        <li
          key={a.id}
          className="flex flex-col gap-2 py-3.5 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:gap-4"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink">{a.name}</p>
            <p className="mt-0.5 truncate text-xs text-ink-muted">{a.trigger}</p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className="tabular text-xs text-ink-secondary">
              {(a.successRate * 100).toFixed(1)}% success
            </span>
            <span className="tabular hidden text-xs text-ink-muted sm:inline">
              {a.runsThisWeek} runs this week
            </span>
            <Switch
              checked={a.enabled}
              aria-label={`${a.name} — ${a.enabled ? "enabled" : "disabled"} (demo)`}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
