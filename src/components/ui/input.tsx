"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "h-9 w-full rounded-sm border border-edge bg-paper px-3 text-sm text-ink",
          "shadow-[inset_0_1px_2px_rgb(17_18_16/0.04)]",
          "placeholder:text-ink-faint",
          "transition-[border-color,box-shadow] duration-150",
          "focus:border-accent/50 focus:shadow-[0_0_0_3px_rgb(16_102_110/0.12)] focus:outline-none",
          "aria-invalid:border-crit/50 aria-invalid:focus:shadow-[0_0_0_3px_rgb(150_48_45/0.1)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
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
        "min-h-20 w-full rounded-sm border border-edge bg-paper px-3 py-2 text-sm text-ink",
        "shadow-[inset_0_1px_2px_rgb(17_18_16/0.04)]",
        "placeholder:text-ink-faint",
        "transition-[border-color,box-shadow] duration-150",
        "focus:border-accent/50 focus:shadow-[0_0_0_3px_rgb(16_102_110/0.12)] focus:outline-none",
        "aria-invalid:border-crit/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Input, Textarea };
