"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium text-ink",
      "peer-disabled:cursor-not-allowed peer-disabled:text-ink-faint",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

/**
 * Form field wrapper: label + control + message, wired for a11y.
 * The hint sits with the label; the error replaces nothing and
 * pushes nothing — it is announced and it stays readable at 14px.
 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint ? <span className="text-[13.5px] text-ink-soft">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="text-sm text-crit" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { Label };
