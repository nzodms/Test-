"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * A labelled control inside the setup ledger.
 *
 * Local only because the ledger needs a 16px control on a phone —
 * anything under 16px makes iOS zoom the page mid-flow. The label
 * and error treatment is deliberately the shared one (14px medium
 * ink, 14px error) so a field here does not read as a different
 * product from a field anywhere else.
 */
export function SetupField({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  hint?: string | undefined;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <Label htmlFor={htmlFor} className="text-[14px] font-medium text-ink">
          {label}
        </Label>
        {hint ? <span className="text-[14px] text-ink-soft">{hint}</span> : null}
      </div>
      <div className="mt-2">{children}</div>
      {error ? (
        <p role="alert" className="mt-2 text-[14px] leading-snug text-crit">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Comfortable on a phone, compact on a desk. */
export const controlHeight = "h-12 text-[16px] sm:h-11 sm:text-[14.5px]";
