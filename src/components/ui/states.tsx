import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Skeleton ──────────────────────────────────────────────────── */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

/* ── Empty state ───────────────────────────────────────────────── */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-edge-strong px-6 py-14 text-center",
        className
      )}
    >
      <div
        className="halo-field opacity-60"
        style={
          { "--halo-x": "50%", "--halo-y": "20%", "--halo-strength": 0.08 } as React.CSSProperties
        }
      />
      <div className="relative mb-4 flex size-11 items-center justify-center rounded-md border border-edge-strong bg-raised shadow-card">
        <Icon className="size-5 text-ink-muted" aria-hidden />
      </div>
      <h3 className="text-title relative text-sm text-ink">{title}</h3>
      <p className="relative mt-1 max-w-sm text-[13px] leading-relaxed text-ink-muted">
        {description}
      </p>
      {action ? <div className="relative mt-5">{action}</div> : null}
    </div>
  );
}

/* ── Error state ───────────────────────────────────────────────── */

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: {
  title?: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-critical/20 bg-critical/[0.04] px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-11 items-center justify-center rounded-md border border-critical/25 bg-critical/10">
        <AlertTriangle className="size-5 text-critical" aria-hidden />
      </div>
      <h3 className="text-title text-sm text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-muted">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
