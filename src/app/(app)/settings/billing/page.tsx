"use client";

import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { Progress } from "@/components/ui/misc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsSegment, TabsSegmentTrigger } from "@/components/ui/tabs";
import { HaloField } from "@/components/halo/halo-field";
import {
  SettingsSection,
  useSimulatedSave,
} from "@/components/settings/section";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { getIntegrations, getMembers, getMetrics, getSignals } from "@/lib/data";
import { plans, type Plan } from "@/lib/data/plans";
import { cn, formatNumber } from "@/lib/utils";

type BillingCycle = "monthly" | "annual";

const PLAN_LIMITS: Record<
  Plan["id"],
  { signals: number | null; automations: number | null; sources: number | null; seats: string }
> = {
  starter: { signals: 200, automations: 3, sources: 2, seats: "3 seats included" },
  pro: { signals: null, automations: 25, sources: 12, seats: "Unlimited seats" },
  scale: { signals: null, automations: null, sources: null, seats: "Unlimited seats" },
};

const INVOICES = [
  { id: "INV-2026-0107", date: "Jul 1, 2026", description: "Pro · 8 seats", amount: "$152.00" },
  { id: "INV-2026-0106", date: "Jun 1, 2026", description: "Pro · 8 seats", amount: "$152.00" },
  { id: "INV-2026-0105", date: "May 1, 2026", description: "Pro · 8 seats", amount: "$152.00" },
  { id: "INV-2026-0104", date: "Apr 1, 2026", description: "Pro · 8 seats", amount: "$152.00" },
  { id: "INV-2026-0103", date: "Mar 1, 2026", description: "Pro · 8 seats", amount: "$152.00" },
];

const stripeConfigured = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function UsageRow({
  label,
  used,
  cap,
  planName,
}: {
  label: string;
  used: number;
  cap: number | null;
  planName: string;
}) {
  const ratio = cap === null ? 0 : used / cap;
  return (
    <div className="py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="text-ink-secondary">{label}</span>
        <span className="tabular text-ink">
          {formatNumber(used)}{" "}
          <span className="text-ink-muted">
            / {cap === null ? "Unlimited" : formatNumber(cap)}
          </span>
        </span>
      </div>
      {cap === null ? (
        <p className="mt-1.5 text-xs text-ink-faint">
          No cap on the {planName} plan.
        </p>
      ) : (
        <Progress
          className="mt-2"
          value={Math.min(100, ratio * 100)}
          tone={ratio >= 0.85 ? "ember" : "halo"}
          aria-label={`${label}: ${used} of ${cap}`}
        />
      )}
    </div>
  );
}

export default function BillingSettingsPage() {
  const metrics = getMetrics();
  const connectedSources = getIntegrations().filter((i) => i.connected).length;
  const resolvedSignals = getSignals().filter(
    (s) => s.status === "resolved"
  ).length;
  const signalsThisMonth = metrics.activeSignals + resolvedSignals;
  const activeSeats = getMembers().filter((m) => m.status === "active").length;

  const [planId, setPlanId] = usePersistentState<Plan["id"]>(
    "settings:billing-plan",
    "pro"
  );
  const [cycle, setCycle] = usePersistentState<BillingCycle>(
    "settings:billing-cycle",
    "annual"
  );

  const [pendingPlan, setPendingPlan] = React.useState<Plan | null>(null);
  const [switching, runSwitch] = useSimulatedSave();

  const currentPlan = plans.find((p) => p.id === planId);
  if (!currentPlan) return null; // plans always contains every id

  const limits = PLAN_LIMITS[currentPlan.id];
  const pricePerSeat = cycle === "annual" ? currentPlan.annual : currentPlan.monthly;

  const confirmSwitch = () => {
    if (!pendingPlan) return;
    const nextId = pendingPlan.id;
    runSwitch(() => {
      setPlanId(nextId);
      setPendingPlan(null);
      toast.success("Plan updated (simulated)");
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Current plan ─────────────────────────────────────────── */}
      <section className="surface-card relative overflow-hidden rounded-lg p-5 sm:p-6">
        <HaloField x={82} y={8} strength={0.1} />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-label">Current plan</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <h2 className="text-title text-xl text-ink">
                  {currentPlan.name}
                </h2>
                <Badge variant="halo">Current</Badge>
                {!stripeConfigured ? (
                  <Badge variant="outline">Simulated billing</Badge>
                ) : null}
              </div>
              <p className="mt-1 max-w-md text-[13px] text-ink-secondary">
                {currentPlan.tagline}
              </p>
            </div>

            <Tabs
              value={cycle}
              onValueChange={(v) => setCycle(v as BillingCycle)}
            >
              <TabsSegment aria-label="Billing cycle">
                <TabsSegmentTrigger value="monthly">Monthly</TabsSegmentTrigger>
                <TabsSegmentTrigger value="annual">Annual</TabsSegmentTrigger>
              </TabsSegment>
            </Tabs>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-edge-faint pt-4">
            <div>
              <p className="tabular text-2xl font-semibold text-ink">
                ${pricePerSeat}
                <span className="text-sm font-normal text-ink-muted">
                  {" "}
                  per seat / month
                  {cycle === "annual" ? ", billed annually" : ""}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-ink-muted">
              <span>
                Renews <span className="text-ink-secondary">Aug 14, 2026</span>
              </span>
              <span>
                <span className="tabular text-ink-secondary">{activeSeats}</span>{" "}
                seats · {limits.seats}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Usage ────────────────────────────────────────────────── */}
      <SettingsSection
        title="Usage this period"
        description="Counts reset with each billing period on the 1st."
      >
        <div className="divide-y divide-edge-faint">
          <UsageRow
            label="Signals tracked this month"
            used={signalsThisMonth}
            cap={limits.signals}
            planName={currentPlan.name}
          />
          <UsageRow
            label="Active automations"
            used={metrics.automationsEnabled}
            cap={limits.automations}
            planName={currentPlan.name}
          />
          <UsageRow
            label="Data sources connected"
            used={connectedSources}
            cap={limits.sources}
            planName={currentPlan.name}
          />
        </div>
      </SettingsSection>

      {/* ── Plans ────────────────────────────────────────────────── */}
      <SettingsSection
        title="Plans"
        description="Every plan includes the signal engine, triage queue and activity history."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan.id;
            const price = cycle === "annual" ? plan.annual : plan.monthly;
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-md border p-4",
                  isCurrent
                    ? "border-halo-500/40 bg-halo-500/[0.05]"
                    : "border-edge bg-void/20"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{plan.name}</p>
                  {isCurrent ? (
                    <Badge variant="halo" dot>
                      Current
                    </Badge>
                  ) : null}
                </div>
                <p className="tabular mt-2 text-lg font-semibold text-ink">
                  ${price}
                  <span className="text-xs font-normal text-ink-muted">
                    {" "}
                    / seat / mo
                  </span>
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-ink-muted">
                  {plan.tagline}
                </p>
                <div className="mt-4 flex-1" />
                {isCurrent ? (
                  <p className="text-xs text-ink-faint">Your team is on this plan.</p>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Switch to the ${plan.name} plan`}
                    onClick={() => setPendingPlan(plan)}
                  >
                    Switch
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SettingsSection>

      <Dialog
        open={pendingPlan !== null}
        onOpenChange={(open) => {
          if (!open) setPendingPlan(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Switch to {pendingPlan?.name ?? "this plan"}?
            </DialogTitle>
            <DialogDescription>
              Plan changes are simulated in this demo — Stripe wiring is
              prepared.
            </DialogDescription>
          </DialogHeader>
          {pendingPlan ? (
            <p className="text-sm text-ink-secondary">
              {pendingPlan.name} is{" "}
              <span className="tabular text-ink">
                ${cycle === "annual" ? pendingPlan.annual : pendingPlan.monthly}
              </span>{" "}
              per seat / month
              {cycle === "annual" ? ", billed annually" : ""}. The change would
              apply at the next renewal on Aug 14, 2026.
            </p>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button size="sm" loading={switching} onClick={confirmSwitch}>
              Confirm switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Invoices ─────────────────────────────────────────────── */}
      <SettingsSection
        title="Invoices"
        description="Receipts for the last five billing periods."
      >
        <div className="-mx-5 -my-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Download</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVOICES.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-ink-secondary">
                    {invoice.id}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-secondary">
                    {invoice.date}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-secondary">
                    {invoice.description}
                  </TableCell>
                  <TableCell className="tabular whitespace-nowrap text-right text-ink">
                    {invoice.amount}
                  </TableCell>
                  <TableCell>
                    <Badge variant="positive" dot>
                      Paid
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Download ${invoice.id} as PDF`}
                      onClick={() =>
                        toast.info("Invoice PDF is simulated in this demo")
                      }
                    >
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SettingsSection>
    </div>
  );
}
