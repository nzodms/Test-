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
      "bg-mineral-deep shadow-[inset_0_1px_2px_rgb(17_18_16/0.08)] transition-colors duration-200",
      "data-[state=checked]:border-accent data-[state=checked]:bg-accent",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block size-3.5 translate-x-0.5 rounded-full bg-paper",
        "shadow-[0_1px_2px_rgb(17_18_16/0.25)] transition-transform duration-200",
        "data-[state=checked]:translate-x-[18px]"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
