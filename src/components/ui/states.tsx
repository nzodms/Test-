import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   Absence and failure.

   Neither of these is a card. An empty region is stated by a rule
   and a sentence; a failure is stated by a rule that carries the
   critical tone and a sentence that says what to do next. The
   rounded-square-icon-above-centred-text pattern is gone: it made
   every empty region in the product look like the same illustration.
   ════════════════════════════════════════════════════════════════ */

/* ── Skeleton ──────────────────────────────────────────────────── */

/**
 * A placeholder for a value that is arriving. The sweep is the only
 * animation in the set and it means one thing: this is not the final
 * state. `prefers-reduced-motion` flattens it globally.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

/** A run of skeleton lines with a naturally ragged last line. */
const LINE_WIDTHS = ["100%", "96%", "88%", "98%", "72%"] as const;

export function SkeletonLines({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3"
          style={{ width: LINE_WIDTHS[i % LINE_WIDTHS.length] }}
        />
      ))}
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────────────── */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-t border-edge-strong px-1 py-10 sm:py-12",
        className
      )}
    >
      <div className="max-w-prose">
        <h3 className="text-title flex items-center gap-2 text-[15px] text-ink">
          {Icon ? (
            <Icon className="size-4 shrink-0 text-ink-faint" aria-hidden />
          ) : null}
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {description}
        </p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
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
      className={cn("border-l-2 border-crit py-1 pl-4 sm:pl-5", className)}
    >
      <div className="max-w-prose">
        <h3 className="text-title text-[15px] text-crit">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {description}
        </p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}
