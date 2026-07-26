"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Workflow } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/states";
import { Tabs, TabsSegment, TabsSegmentTrigger } from "@/components/ui/tabs";
import { AnimatedNumber } from "@/components/halo/animated-number";
import { HaloField } from "@/components/halo/halo-field";
import { Reveal } from "@/components/halo/reveal";
import { AutomationRow } from "@/components/automations/automation-row";
import {
  CATEGORY_OPTIONS,
  NewAutomationDrawer,
  type NewAutomationInput,
} from "@/components/automations/new-automation-drawer";
import { getAutomations, getMetrics } from "@/lib/data";
import type { Automation, AutomationRun } from "@/lib/data";
import { cn, formatDateTime, formatNumber } from "@/lib/utils";

const metrics = getMetrics();

type CategoryFilter = Automation["category"] | "all";

const RUN_DOT: Record<AutomationRun["status"], string> = {
  success: "bg-positive",
  failure: "bg-critical",
  skipped: "bg-ink-faint",
};

function nextAutomationId(list: Automation[]): string {
  let max = 0;
  for (const a of list) {
    const n = Number(a.id.replace(/^auto-/, ""));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `auto-${String(max + 1).padStart(2, "0")}`;
}

function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function StatBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="relative px-5 py-4 sm:py-5">
      <p className="text-label text-ink-muted">{label}</p>
      <p className="tabular mt-2 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{sub}</p>
    </div>
  );
}

function AutomationsWorkspace() {
  const [automations, setAutomations] = React.useState<Automation[]>(() =>
    getAutomations().map((a) => ({ ...a }))
  );
  const [category, setCategory] = React.useState<CategoryFilter>("all");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [historyId, setHistoryId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  /* ── Deep link: /automations?new=1 opens the create drawer ────── */
  const searchParams = useSearchParams();
  const newParam = searchParams.get("new");
  const consumedNew = React.useRef(false);
  React.useEffect(() => {
    if (newParam === "1" && !consumedNew.current) {
      consumedNew.current = true;
      setDrawerOpen(true);
    }
  }, [newParam]);

  const enabledCount = automations.filter((a) => a.enabled).length;
  const estimatedHoursSaved = Math.round(
    metrics.automationRunsThisWeek * 0.11
  );

  const filtered =
    category === "all"
      ? automations
      : automations.filter((a) => a.category === category);

  const historyAutomation =
    historyId === null
      ? null
      : automations.find((a) => a.id === historyId) ?? null;
  const deleteAutomation =
    deleteId === null
      ? null
      : automations.find((a) => a.id === deleteId) ?? null;

  /* ── Mutations (local state; honest demo persistence) ─────────── */

  const toggleAutomation = (id: string, enabled: boolean) => {
    const target = automations.find((a) => a.id === id);
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled } : a))
    );
    if (target) {
      if (enabled) toast.success(`Resumed ${target.name}`);
      else toast(`Paused ${target.name}`);
    }
  };

  const duplicateAutomation = (id: string) => {
    const target = automations.find((a) => a.id === id);
    if (!target) return;
    setAutomations((prev) => {
      const copy: Automation = {
        ...target,
        id: nextAutomationId(prev),
        name: `${target.name} (copy)`,
        enabled: false,
        lastRunAt: null,
        runsThisWeek: 0,
        history: [],
      };
      const idx = prev.findIndex((a) => a.id === id);
      const next = [...prev];
      next.splice(idx === -1 ? next.length : idx + 1, 0, copy);
      return next;
    });
    toast.success("Automation duplicated", {
      description: `${target.name} (copy) starts paused — review it, then resume.`,
    });
  };

  const confirmDelete = () => {
    if (!deleteAutomation) {
      setDeleteId(null);
      return;
    }
    const name = deleteAutomation.name;
    setAutomations((prev) => prev.filter((a) => a.id !== deleteAutomation.id));
    setDeleteId(null);
    toast.success("Automation deleted", {
      description: `${name} will not run again.`,
    });
  };

  const createAutomation = (values: NewAutomationInput) => {
    setAutomations((prev) => {
      const trimmed = values.description?.trim();
      const summary =
        trimmed && trimmed.length > 0
          ? trimmed
          : `When "${values.trigger}" fires, Halo runs "${values.action}".`;
      const created: Automation = {
        id: nextAutomationId(prev),
        name: values.name.trim(),
        description: values.requireApproval
          ? `${summary} External actions wait for approval.`
          : summary,
        trigger: values.trigger,
        action: values.action,
        enabled: true,
        lastRunAt: null,
        successRate: 1,
        runsThisWeek: 0,
        category: values.category,
        history: [],
      };
      return [created, ...prev];
    });
    setCategory("all");
    toast.success("Automation created", {
      description: "It will arm on the next matching event.",
    });
  };

  return (
    <PageContainer className="pb-16">
      <PageHeader
        title="Automations"
        description={`Hands-off responses to recurring operational events. ${enabledCount} of ${automations.length} active · ${metrics.automationSuccessRate.toFixed(1)}% success this week.`}
        actions={
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus aria-hidden />
            New automation
          </Button>
        }
      />

      {/* Summary strip */}
      <Reveal>
        <section
          aria-label="Automation performance this week"
          className="surface-card relative mt-6 overflow-hidden"
        >
          <HaloField x={14} y={30} strength={0.12} tone="halo" />
          <div className="relative grid grid-cols-1 divide-y divide-edge sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <StatBlock
              label="Runs this week"
              value={
                <AnimatedNumber
                  value={metrics.automationRunsThisWeek}
                  format={(v) => formatNumber(Math.round(v))}
                />
              }
              sub={`across ${automations.length} automations`}
            />
            <StatBlock
              label="Success rate"
              value={
                <AnimatedNumber
                  value={metrics.automationSuccessRate}
                  format={(v) => `${v.toFixed(1)}%`}
                />
              }
              sub="rolling 7-day window"
            />
            <StatBlock
              label="Est. hours saved"
              value={
                <AnimatedNumber
                  value={estimatedHoursSaved}
                  format={(v) => formatNumber(Math.round(v))}
                />
              }
              sub="estimated · vs. handling each run by hand"
            />
          </div>
        </section>
      </Reveal>

      {/* Filter + list */}
      <Reveal delay={0.08}>
        <section aria-label="Automation list" className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              value={category}
              onValueChange={(v) => setCategory(v as CategoryFilter)}
            >
              <div className="-mx-4 overflow-x-auto px-4 scrollbar-quiet sm:mx-0 sm:px-0">
                <TabsSegment aria-label="Filter by category">
                  <TabsSegmentTrigger value="all">All</TabsSegmentTrigger>
                  {CATEGORY_OPTIONS.map((c) => (
                    <TabsSegmentTrigger
                      key={c}
                      value={c}
                      className="capitalize"
                    >
                      {c}
                    </TabsSegmentTrigger>
                  ))}
                </TabsSegment>
              </div>
            </Tabs>
            <p className="tabular text-xs text-ink-muted">
              {filtered.length}{" "}
              {filtered.length === 1 ? "automation" : "automations"}
            </p>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={Workflow}
              title={
                category === "all"
                  ? "No automations yet"
                  : `No ${category} automations`
              }
              description="Hand this class of work to Halo — pair a trigger with an action and it runs the moment the pattern appears."
              action={
                <Button onClick={() => setDrawerOpen(true)}>
                  <Plus aria-hidden />
                  New automation
                </Button>
              }
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {filtered.map((a) => (
                <AutomationRow
                  key={a.id}
                  automation={a}
                  onToggle={toggleAutomation}
                  onViewHistory={setHistoryId}
                  onDuplicate={duplicateAutomation}
                  onDelete={setDeleteId}
                />
              ))}
            </ul>
          )}
        </section>
      </Reveal>

      {/* Run history */}
      <Dialog
        open={historyAutomation !== null}
        onOpenChange={(open) => {
          if (!open) setHistoryId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run history</DialogTitle>
            <DialogDescription>
              {historyAutomation
                ? `${historyAutomation.name} · last ${historyAutomation.history.length} runs`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {historyAutomation && historyAutomation.history.length === 0 ? (
            <p className="text-sm text-ink-muted">
              No runs recorded yet. History appears after the first matching
              event.
            </p>
          ) : (
            <ul className="space-y-1">
              {historyAutomation?.history.map((run) => (
                <li
                  key={run.id}
                  className="flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-lifted/50"
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      RUN_DOT[run.status]
                    )}
                  />
                  <span className="sr-only">{run.status}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-ink">
                        {formatDateTime(run.startedAt)}
                      </span>
                      <span className="tabular text-xs text-ink-secondary">
                        {formatDuration(run.durationMs)}
                      </span>
                    </div>
                    <p className="text-[13px] text-ink-muted">{run.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={deleteAutomation !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete automation</DialogTitle>
            <DialogDescription>
              {deleteAutomation
                ? `This removes "${deleteAutomation.name}" and stops all future runs. Signals it already created are unaffected.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button variant="danger" onClick={confirmDelete}>
              Delete automation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewAutomationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCreate={createAutomation}
      />
    </PageContainer>
  );
}

export default function AutomationsPage() {
  return (
    <React.Suspense fallback={null}>
      <AutomationsWorkspace />
    </React.Suspense>
  );
}
