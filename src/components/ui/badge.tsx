import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   Badge — one shape, one chrome, a state read from a mark.

   A row of differently-coloured pills is how an interface stops
   meaning anything: every state shouts equally, so none of them
   register. Here the badge itself is always the same restrained
   marker; the state lives in a 5px square set before the label, and
   colour appears only where it carries meaning (exposure, refusal,
   confirmation). Neutral states get no mark at all.
   ════════════════════════════════════════════════════════════════ */

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-xs border",
    "px-1.5 py-[3px] text-[13.5px] font-medium leading-[1.25]",
  ],
  {
    variants: {
      variant: {
        neutral: "border-edge bg-mineral text-ink",
        outline: "border-edge-strong bg-transparent text-ink-soft",
        accent: "border-edge bg-mineral text-ink",
        ok: "border-edge bg-mineral text-ink",
        warn: "border-warn/30 bg-warn/[0.07] text-ink",
        crit: "border-crit/30 bg-crit/[0.06] text-ink",
        /* dark scanner context */
        scan: "border-scan-edge-strong bg-scan-high text-scan-ink",
        "scan-accent": "border-scan-edge-strong bg-scan-high text-scan-ink",
        "scan-ok": "border-scan-edge-strong bg-scan-high text-scan-ink",
        "scan-warn": "border-warn-bright/30 bg-warn-bright/[0.08] text-scan-ink",
        "scan-crit": "border-crit-bright/30 bg-crit-bright/[0.08] text-scan-ink",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

/** Which variants carry a state worth marking, and in what colour. */
const MARK: Partial<Record<NonNullable<BadgeVariant>, string>> = {
  accent: "bg-accent",
  ok: "bg-ok",
  warn: "bg-warn",
  crit: "bg-crit",
  "scan-accent": "bg-accent-bright",
  "scan-ok": "bg-ok-bright",
  "scan-warn": "bg-warn-bright",
  "scan-crit": "bg-crit-bright",
};

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Force the state mark off even on a toned variant. */
  mark?: boolean;
}

function Badge({ className, variant, mark = true, children, ...props }: BadgeProps) {
  const markColor = variant ? MARK[variant] : undefined;
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {mark && markColor ? (
        <span aria-hidden className={cn("size-[5px] rounded-[1px]", markColor)} />
      ) : null}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
