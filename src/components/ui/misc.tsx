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
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
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
));
Separator.displayName = "Separator";

/* ── Progress ──────────────────────────────────────────────────── */

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    tone?: "accent" | "warn" | "ok";
  }
>(({ className, value, tone = "accent", ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-1.5 w-full overflow-hidden rounded-full bg-mineral-deep shadow-[inset_0_1px_1px_rgb(17_18_16/0.06)]",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        tone === "accent" && "bg-accent",
        tone === "warn" && "bg-warn",
        tone === "ok" && "bg-ok"
      )}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = "Progress";

/* ── Checkbox ──────────────────────────────────────────────────── */

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer size-4 shrink-0 rounded-xs border border-edge-strong bg-paper",
      "shadow-[inset_0_1px_1px_rgb(17_18_16/0.05)] transition-colors duration-150",
      "data-[state=checked]:border-accent data-[state=checked]:bg-accent",
      "data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-[#f6fbfb]">
      {props.checked === "indeterminate" ? (
        <Minus className="size-3" strokeWidth={3} />
      ) : (
        <Check className="size-3" strokeWidth={3} />
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
        "z-50 w-72 rounded-md border border-edge-strong bg-paper p-4 shadow-float animate-fade-in outline-none",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = "PopoverContent";

/* ── Spinner ───────────────────────────────────────────────────── */

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-4 animate-spin text-accent", className)}
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
        strokeOpacity="0.2"
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
