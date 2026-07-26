"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * A labelled control inside the setup ledger.
 *
 * Local rather than shared: this flow needs a 14px label and a 14px
 * error — the shared field runs smaller than is comfortable on a
 * phone, and errors here have to be readable at arm's length.
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
        <Label htmlFor={htmlFor} className="text-[14px] text-ink-soft">
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
