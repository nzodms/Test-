"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

/**
 * A binary control, sized as an instrument but hit like a phone
 * control: the visible track stays 20px tall while an invisible
 * pseudo-element extends the target past 44px in both axes.
 * Off is a mineral track with a visible edge — never a pale ghost
 * that reads as disabled.
 */
const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "group relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
      "border border-edge-strong bg-mineral-deep",
      "transition-colors duration-150",
      "before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']",
      "hover:border-ink/35",
      "data-[state=checked]:border-accent data-[state=checked]:bg-accent",
      "data-[state=checked]:hover:bg-accent-deep",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-edge-strong",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block size-3.5 translate-x-0.5 rounded-full bg-page",
        "border border-edge-faint transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "data-[state=checked]:translate-x-[18px] data-[state=checked]:border-transparent"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
