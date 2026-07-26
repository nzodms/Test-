import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "border-edge bg-raised text-ink-secondary",
        halo: "border-halo-500/25 bg-halo-500/10 text-halo-300",
        positive: "border-positive/25 bg-positive/10 text-positive",
        caution: "border-caution/25 bg-caution/10 text-caution",
        critical: "border-critical/25 bg-critical/10 text-critical",
        ember: "border-ember-400/30 bg-ember-400/10 text-ember-300",
        outline: "border-edge-strong bg-transparent text-ink-muted",
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
