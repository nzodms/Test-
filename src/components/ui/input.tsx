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
          "surface-well h-9 w-full rounded-md px-3 text-sm text-ink",
          "placeholder:text-ink-muted",
          "transition-[border-color,box-shadow] duration-200",
          "focus:border-halo-edge focus:shadow-[0_0_0_3px_rgb(94_207_227/0.12),inset_0_1px_2px_rgb(0_0_0/0.35)] focus:outline-none",
          "aria-invalid:border-critical/50 aria-invalid:focus:shadow-[0_0_0_3px_rgb(239_131_149/0.12)]",
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
        "surface-well min-h-20 w-full rounded-md px-3 py-2 text-sm text-ink",
        "placeholder:text-ink-muted",
        "transition-[border-color,box-shadow] duration-200",
        "focus:border-halo-edge focus:shadow-[0_0_0_3px_rgb(94_207_227/0.12),inset_0_1px_2px_rgb(0_0_0/0.35)] focus:outline-none",
        "aria-invalid:border-critical/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Input, Textarea };
