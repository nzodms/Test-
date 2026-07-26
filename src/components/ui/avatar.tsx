"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn, initials } from "@/lib/utils";

/**
 * Demo avatars are deterministic: a person's name maps to a stable
 * hue so the same member looks identical on every page.
 */
function nameHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    name: string;
    size?: "xs" | "sm" | "md" | "lg";
  }
>(({ className, name, size = "md", ...props }, ref) => {
  const hue = nameHue(name);
  const sizeClasses = {
    xs: "size-5 text-[9px]",
    sm: "size-6 text-[10px]",
    md: "size-8 text-xs",
    lg: "size-12 text-base",
  }[size];
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-edge-strong font-medium",
        sizeClasses,
        className
      )}
      style={{
        backgroundColor: `oklch(0.32 0.045 ${hue})`,
        color: `oklch(0.85 0.06 ${hue})`,
      }}
      title={name}
      {...props}
    >
      <AvatarPrimitive.Fallback delayMs={0}>
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
});
Avatar.displayName = "Avatar";

export { Avatar };
