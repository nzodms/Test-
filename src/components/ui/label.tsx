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
      "text-[13px] font-medium text-ink-soft",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

/** Form field wrapper: label + control + error message, wired for a11y. */
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
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint ? <span className="text-xs text-ink-soft">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="text-[13px] text-crit" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { Label };
