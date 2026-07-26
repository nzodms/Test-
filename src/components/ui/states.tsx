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
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-edge-strong bg-paper/60 px-6 py-14 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-11 items-center justify-center rounded-md border border-edge bg-mineral">
        <Icon className="size-5 text-ink-soft" aria-hidden />
      </div>
      <h3 className="text-title text-sm text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-soft">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
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
        "flex flex-col items-center justify-center rounded-lg border border-crit/20 bg-crit/[0.03] px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-11 items-center justify-center rounded-md border border-crit/25 bg-crit/[0.07]">
        <AlertTriangle className="size-5 text-crit" aria-hidden />
      </div>
      <h3 className="text-title text-sm text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-soft">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
