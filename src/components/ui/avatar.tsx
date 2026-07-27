"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn, initials } from "@/lib/utils";

/**
 * Initials on a mineral disc.
 *
 * The previous version mapped each name to its own hue, which turned
 * any roster into confetti and put colour — the product's scarcest
 * signal — on the one thing that carries no state. Everyone now gets
 * the same quiet treatment; identity is carried by the initials and
 * the name beside them.
 */
const SIZES = {
  xs: "size-7 text-[12.5px]",
  sm: "size-8 text-[13px]",
  md: "size-9 text-[13.5px]",
  lg: "size-12 text-[16px]",
} as const;

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    name: string;
    size?: keyof typeof SIZES;
  }
>(({ className, name, size = "md", ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex shrink-0 select-none items-center justify-center overflow-hidden",
      "rounded-full border border-edge bg-mineral font-medium text-ink-soft",
      SIZES[size],
      className
    )}
    title={name}
    {...props}
  >
    <AvatarPrimitive.Fallback delayMs={0} className="tabular">
      {initials(name)}
    </AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>
));
Avatar.displayName = "Avatar";

export { Avatar };
