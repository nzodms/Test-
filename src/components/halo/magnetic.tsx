"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Magnetic Focus — the signature motion language.
 *
 * Interactive surfaces react to the pointer: the border light
 * follows the cursor (via the `magnetic-edge` utility reading
 * --mx/--my) and primary cards lift by a few pixels. Everything
 * is transform/opacity only, disabled under prefers-reduced-motion.
 */
export function useMagnetic<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const reduced = useReducedMotion();

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<T>) => {
      if (reduced) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    },
    [reduced]
  );

  return { ref, onPointerMove };
}

export function MagneticCard({
  children,
  className,
  lift = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  lift?: boolean;
}) {
  const { ref, onPointerMove } = useMagnetic<HTMLDivElement>();
  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn(
        "surface-card magnetic-edge rounded-lg",
        lift &&
          "motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-float",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
