"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   Button — a software control, not a marketing object.

   Every state is visibly different without any decorative depth:
   rest is a flat fill, hover shifts the fill one step, pressed goes
   one step further and loses the hairline lift, focus-visible draws
   a real outline, disabled drops contrast and the pointer, loading
   keeps the label in place and swaps the leading glyph so the
   control never changes width mid-action.
   ════════════════════════════════════════════════════════════════ */

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 select-none items-center justify-center gap-2",
    "whitespace-nowrap font-medium",
    "transition-[background-color,border-color,color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /* Ink on the light environment — the default strong action. */
        primary: [
          "bg-ink text-page",
          "hover:bg-graphite active:bg-[#0b0c0e]",
          "focus-visible:outline-ink",
        ],
        /* The cold accent — reserved for the single action that
           matters most on a given view. */
        accent: [
          "bg-accent text-[#f4fbfb]",
          "hover:bg-accent-deep active:bg-[#083c42]",
          "focus-visible:outline-accent-deep",
        ],
        secondary: [
          "border border-edge-strong bg-page text-ink",
          "hover:bg-mineral active:bg-mineral-deep",
          "focus-visible:outline-accent",
        ],
        ghost: [
          "text-ink-soft",
          "hover:bg-mineral hover:text-ink active:bg-mineral-deep",
          "focus-visible:outline-accent",
        ],
        outline: [
          "border border-edge-strong bg-transparent text-ink-soft",
          "hover:border-edge-strong hover:bg-mineral hover:text-ink",
          "active:bg-mineral-deep",
          "focus-visible:outline-accent",
        ],
        danger: [
          "border border-crit/30 bg-transparent text-crit",
          "hover:bg-crit/[0.08] hover:border-crit/50",
          "active:bg-crit/[0.14]",
          "focus-visible:outline-crit",
        ],
        /* Inside the black-glass scanner. */
        scan: [
          "border border-scan-edge-strong bg-scan-high text-scan-ink",
          "hover:bg-[#252c33] active:bg-[#171c20]",
          "focus-visible:outline-accent-bright",
        ],
        "scan-ghost": [
          "text-scan-soft",
          "hover:bg-scan-high hover:text-scan-ink active:bg-scan-raised",
          "focus-visible:outline-accent-bright",
        ],
      },
      /* Controls stay at a 44px touch target on phones and tighten
         to instrument sizes from the small breakpoint up. */
      size: {
        sm: "h-11 rounded-xs px-3 text-[13.5px] sm:h-8 [&_svg]:size-3.5",
        md: "h-11 rounded-sm px-4 text-sm sm:h-9 [&_svg]:size-4",
        lg: "h-12 rounded-sm px-5 text-[15px] sm:h-11 [&_svg]:size-4",
        icon: "size-11 rounded-sm sm:size-9 [&_svg]:size-4",
        "icon-sm": "size-11 rounded-xs sm:size-8 [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

/** A quiet determinate-less spinner. Rotation is the only motion,
 *  and it exists to say the control is busy — nothing else. */
function ButtonSpinner() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="animate-spin">
      <circle
        cx="8"
        cy="8"
        r="6.25"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.75"
      />
      <path
        d="M14.25 8A6.25 6.25 0 0 0 8 1.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled ?? loading ?? undefined}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? <ButtonSpinner /> : null}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
