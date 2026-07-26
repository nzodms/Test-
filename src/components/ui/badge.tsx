import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "border-edge bg-mineral text-ink-soft",
        accent: "border-accent/25 bg-accent-tint text-accent-deep",
        ok: "border-ok/25 bg-ok/[0.08] text-ok",
        warn: "border-warn/25 bg-warn/[0.08] text-warn",
        crit: "border-crit/25 bg-crit/[0.07] text-crit",
        outline: "border-edge-strong bg-transparent text-ink-soft",
        /* dark scanner context */
        scan: "border-scan-edge-strong bg-scan-high text-scan-soft",
        "scan-accent":
          "border-accent-bright/30 bg-accent-bright/10 text-accent-bright",
        "scan-warn": "border-warn-bright/30 bg-warn-bright/10 text-warn-bright",
        "scan-crit": "border-crit-bright/30 bg-crit-bright/10 text-crit-bright",
        "scan-ok": "border-ok-bright/30 bg-ok-bright/10 text-ok-bright",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot ? (
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-current opacity-80"
        />
      ) : null}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
