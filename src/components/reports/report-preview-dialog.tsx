"use client";

import { Download } from "lucide-react";
import { AnimatedNumber } from "@/components/halo/animated-number";
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
import { Separator } from "@/components/ui/misc";
import { SeverityBadge } from "@/components/signals/signal-badges";
import { getMetrics, getPrioritySignals } from "@/lib/data";
import type { Report } from "@/lib/data";

const metrics = getMetrics();
const topSignals = getPrioritySignals().slice(0, 3);

const KEY_METRICS: {
  label: string;
  value: number;
  format: (v: number) => string;
}[] = [
  {
    label: "Active signals",
    value: metrics.activeSignals,
    format: (v) => Math.round(v).toString(),
  },
  {
    label: "Median response",
    value: metrics.medianResponseHours,
    format: (v) => `${v.toFixed(1)}h`,
  },
  {
    label: "Automation success",
    value: metrics.automationSuccessRate,
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    label: "Resolved this week",
    value: metrics.resolvedThisWeek,
    format: (v) => Math.round(v).toString(),
  },
];

/**
 * Editorial mini-preview of a compiled report. Every number is read
 * from the live data layer — the same figures the exported document
 * would carry.
 */
export function ReportPreviewDialog({
  report,
  open,
  onOpenChange,
  onExport,
}: {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (title: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {report ? (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2.5">
                <DialogTitle>{report.title}</DialogTitle>
                <Badge variant="outline" className="font-mono uppercase">
                  {report.format}
                </Badge>
              </div>
              <DialogDescription>
                {report.period} · compiled from live workspace data
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* ── Key metrics ─────────────────────────────────── */}
              <section aria-label="Key metrics">
                <h3 className="text-label text-ink-muted">Key metrics</h3>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {KEY_METRICS.map((metric) => (
                    <div
                      key={metric.label}
                      className="surface-well rounded-md px-3 py-2.5"
                    >
                      <AnimatedNumber
                        value={metric.value}
                        format={metric.format}
                        className="tabular block text-lg font-semibold text-ink"
                      />
                      <span className="mt-0.5 block text-2xs text-ink-muted">
                        {metric.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <Separator />

              {/* ── Highlights ──────────────────────────────────── */}
              <section aria-label="Highlights">
                <h3 className="text-label text-ink-muted">Highlights</h3>
                {report.highlights.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {report.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-secondary"
                      >
                        <span
                          className="mt-[7px] size-1 shrink-0 rounded-full bg-halo-400"
                          aria-hidden
                        />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[13px] text-ink-muted">
                    Highlights are written in when compilation completes.
                  </p>
                )}
              </section>

              <Separator />

              {/* ── Priority signals ────────────────────────────── */}
              <section aria-label="Priority signals">
                <h3 className="text-label text-ink-muted">Priority signals</h3>
                <ul className="mt-3 space-y-2.5">
                  {topSignals.map((signal) => (
                    <li
                      key={signal.id}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
                    >
                      <span className="font-mono text-2xs text-ink-faint">
                        {signal.id}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-ink">
                        {signal.title}
                      </span>
                      <SeverityBadge severity={signal.severity} />
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Close</Button>
              </DialogClose>
              <Button onClick={() => onExport(report.title)}>
                <Download aria-hidden />
                Export PDF
              </Button>
            </DialogFooter>
          </>
        ) : (
          <DialogHeader>
            <DialogTitle>Report preview</DialogTitle>
            <DialogDescription>No report selected.</DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );
}
