"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-edge-strong",
      "bg-void/60 shadow-[inset_0_1px_2px_rgb(0_0_0/0.4)] transition-colors duration-200",
      "data-[state=checked]:border-halo-500/50 data-[state=checked]:bg-halo-600/60",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-halo-500",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block size-3.5 translate-x-0.5 rounded-full bg-ink-secondary",
        "shadow-sm transition-transform duration-200",
        "data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-halo-100"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
