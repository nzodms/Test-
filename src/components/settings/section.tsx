"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card wrapper for a settings group: header (title + optional
 * description), content area, and an optional footer with a
 * right-aligned action slot (pass `mr-auto` on a child to pin
 * a note to the left).
 */
export function SettingsSection({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card rounded-lg", className)}>
      <div className="border-b border-edge px-5 py-4">
        <h2 className="text-title text-[15px] text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-[13px] text-ink-secondary">{description}</p>
        ) : null}
      </div>
      <div className="px-5 py-4">{children}</div>
      {footer ? (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-edge px-5 py-3.5">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

/**
 * A single horizontal setting: label + optional description on the
 * left, the control on the right. Stack rows inside a `divide-y
 * divide-edge-faint` container for hairline separators.
 */
export function SettingRow({
  label,
  description,
  control,
  className,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        className
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {description ? (
          <p className="mt-0.5 max-w-md text-[13px] text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

/**
 * Simulated-persistence helper: returns a pending flag and a runner
 * that waits ~600ms before invoking the callback (localStorage write
 * + toast). Cleans up on unmount.
 */
export function useSimulatedSave(
  delayMs = 600
): [boolean, (commit: () => void) => void] {
  const [pending, setPending] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const run = React.useCallback(
    (commit: () => void) => {
      setPending(true);
      timer.current = setTimeout(() => {
        setPending(false);
        commit();
      }, delayMs);
    },
    [delayMs]
  );

  return [pending, run];
}
