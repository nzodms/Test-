"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   Text entry.

   A field is a crisp aperture, not an embossed slot: a flat well, a
   hairline, and a border that hardens the moment the caret is in it.
   No inner shadow, no glow — focus is stated by a 1px accent border
   plus a single 1px ring, which is legible at any zoom and reads as
   a control rather than a lit surface.
   ════════════════════════════════════════════════════════════════ */

const fieldBase = [
  "w-full rounded-sm border border-edge bg-page text-ink",
  "placeholder:text-ink-faint",
  "transition-[border-color,box-shadow,background-color] duration-150",
  "hover:border-edge-strong",
  "focus:border-accent focus:shadow-[0_0_0_1px_var(--color-accent)] focus:outline-none",
  "aria-invalid:border-crit aria-invalid:hover:border-crit",
  "aria-invalid:focus:shadow-[0_0_0_1px_var(--color-crit)]",
  "disabled:cursor-not-allowed disabled:border-edge-faint disabled:bg-mineral",
  "disabled:text-ink-faint disabled:placeholder:text-ink-faint",
  "read-only:bg-mineral read-only:text-ink-soft",
];

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          fieldBase,
          /* 44px on phones, instrument height from sm up. */
          "h-11 px-3 text-[15px] sm:h-9 sm:text-sm",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        fieldBase,
        "min-h-24 px-3 py-2.5 text-[15px] leading-relaxed sm:text-sm",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Input, Textarea };
