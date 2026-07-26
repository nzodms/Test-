"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 select-none items-center justify-center gap-2",
    "whitespace-nowrap font-medium transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-45",
    "active:translate-y-px",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-halo-500 text-[#04222b] shadow-[0_1px_2px_rgb(3_5_9/0.5),inset_0_1px_0_rgb(255_255_255/0.25)]",
          "hover:bg-halo-400 hover:shadow-[0_0_0_1px_rgb(94_207_227/0.4),0_4px_16px_-4px_rgb(94_207_227/0.35)]",
        ],
        secondary: [
          "bg-raised text-ink border border-edge-strong",
          "shadow-[inset_0_1px_0_rgb(233_237_245/0.04)]",
          "hover:bg-lifted hover:border-edge-strong",
        ],
        ghost: ["text-ink-secondary hover:text-ink hover:bg-raised"],
        outline: [
          "border border-edge-strong text-ink-secondary bg-transparent",
          "hover:text-ink hover:border-halo-edge hover:bg-halo-500/5",
        ],
        danger: [
          "bg-critical/12 text-critical border border-critical/25",
          "hover:bg-critical/20 hover:border-critical/40",
        ],
        ember: [
          "bg-ember-400 text-[#2b1a04] shadow-[inset_0_1px_0_rgb(255_255_255/0.3)]",
          "hover:bg-ember-300 hover:shadow-[0_4px_16px_-4px_rgb(238_188_111/0.4)]",
        ],
      },
      size: {
        sm: "h-8 rounded-sm px-3 text-[13px] [&_svg]:size-3.5",
        md: "h-9 rounded-md px-4 text-sm [&_svg]:size-4",
        lg: "h-11 rounded-md px-5 text-[15px] [&_svg]:size-4",
        icon: "size-9 rounded-md [&_svg]:size-4",
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
