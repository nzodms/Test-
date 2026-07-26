"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 select-none items-center justify-center gap-2",
    "whitespace-nowrap font-medium transition-all duration-150",
    "disabled:pointer-events-none disabled:opacity-45",
    "active:translate-y-px",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /* Ink on porcelain — the default strong action. */
        primary: [
          "bg-ink text-paper",
          "shadow-[0_1px_2px_rgb(17_18_16/0.2),inset_0_1px_0_rgb(255_255_255/0.08)]",
          "hover:bg-[#26281f]",
        ],
        /* The rare cold accent — reserved for the one action that
           matters most on a given view. */
        accent: [
          "bg-accent text-[#f4fbfb]",
          "shadow-[0_1px_2px_rgb(11_76_83/0.35),inset_0_1px_0_rgb(255_255_255/0.14)]",
          "hover:bg-accent-deep",
        ],
        secondary: [
          "bg-paper text-ink border border-edge-strong",
          "shadow-[0_1px_2px_rgb(17_18_16/0.05)]",
          "hover:bg-mineral",
        ],
        ghost: ["text-ink-soft hover:text-ink hover:bg-mineral"],
        outline: [
          "border border-edge-strong text-ink-soft bg-transparent",
          "hover:text-ink hover:border-ink/30",
        ],
        danger: [
          "bg-crit/[0.06] text-crit border border-crit/25",
          "hover:bg-crit/[0.12] hover:border-crit/40",
        ],
        /* For use inside the black-glass scanner. */
        scan: [
          "bg-scan-high text-scan-ink border border-scan-edge-strong",
          "hover:bg-[#232931]",
        ],
        "scan-ghost": ["text-scan-soft hover:text-scan-ink hover:bg-scan-high"],
      },
      size: {
        sm: "h-8 rounded-sm px-3 text-[13px] [&_svg]:size-3.5",
        md: "h-9 rounded-sm px-4 text-sm [&_svg]:size-4",
        lg: "h-11 rounded-md px-5 text-[15px] [&_svg]:size-4",
        icon: "size-9 rounded-sm [&_svg]:size-4",
        "icon-sm": "size-8 rounded-sm [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, children, disabled, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled ?? loading ?? undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
