"use client";

import * as React from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

/**
 * Counts a KPI up from zero the first time it enters the viewport.
 * Renders the final value immediately under reduced motion and
 * during SSR so the page never flashes zeros.
 */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format?: (v: number) => string;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const mv = useMotionValue(value);
  const [display, setDisplay] = React.useState(value);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (!inView || reduced || started.current) return;
    started.current = true;
    mv.set(value * 0.4);
    const controls = animate(mv, value, {
      duration: 0.9,
      ease: [0.32, 0.72, 0, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, reduced, value, mv]);

  const fmt = format ?? ((v: number) => Math.round(v).toString());
  return (
    <span ref={ref} className={className}>
      {fmt(display)}
    </span>
  );
}
