"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Separator ─────────────────────────────────────────────────── */

const Separator = React.forwardRef<
  React.ComponentRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-edge",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

/* ── Progress ──────────────────────────────────────────────────── */

/** A measurement, so it is square-ended and flat: no inner shadow,
 *  no rounded lozenge pretending to be a physical object. */
const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    tone?: "accent" | "warn" | "ok" | "ink";
  }
>(({ className, value, tone = "accent", ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    value={value}
    className={cn(
      "relative h-1 w-full overflow-hidden rounded-[1px] bg-mineral-deep",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        tone === "accent" && "bg-accent",
        tone === "warn" && "bg-warn",
        tone === "ok" && "bg-ok",
        tone === "ink" && "bg-ink"
      )}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = "Progress";

/* ── Checkbox ──────────────────────────────────────────────────── */

/** 16px box, 44px target: the pseudo-element carries the hit area so
 *  a dense list of checkboxes is still usable with a thumb. */
const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer relative size-4 shrink-0 rounded-xs border border-edge-strong bg-page",
      "transition-colors duration-150",
      "before:absolute before:-inset-3.5 before:content-['']",
      "hover:border-ink/40",
      "data-[state=checked]:border-accent data-[state=checked]:bg-accent",
      "data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      "disabled:cursor-not-allowed disabled:border-edge disabled:bg-mineral disabled:opacity-60",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-[#f6fbfb]">
      {props.checked === "indeterminate" ? (
        <Minus className="size-3" strokeWidth={3} aria-hidden />
      ) : (
        <Check className="size-3" strokeWidth={3} aria-hidden />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";

/* ── Popover ───────────────────────────────────────────────────── */

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 6, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border border-edge-strong bg-page p-4 outline-none",
        "shadow-[0_10px_30px_-18px_rgb(22_23_26/0.45)]",
        "data-[state=open]:animate-fade-in",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = "PopoverContent";

/* ── Spinner ───────────────────────────────────────────────────── */

/** Inherits colour from its context — a spinner that is always teal
 *  becomes an accent used everywhere, which is the opposite of rare. */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-4 animate-spin text-ink-soft", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
      role="status"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2.5"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export {
  Separator,
  Progress,
  Checkbox,
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverContent,
  Spinner,
};
