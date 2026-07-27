"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion";
import type { ActivityPoint } from "@/lib/scan/types";

/* ════════════════════════════════════════════════════════════════
   Detection activity.

   Hand-built SVG, no chart library, so it belongs to the design
   system rather than importing someone else's.

   The line is DRAWN, not faded in: the stroke travels left to right
   at a constant rate, the baseline extends underneath it, the tick
   for each week appears as the line passes over it, and the end
   marker lands last. Reading order and drawing order are the same,
   which is what makes it read as a measurement being taken instead
   of a graphic being revealed.

   Under `prefers-reduced-motion` nothing animates at all: the final
   state renders on the first frame.
   ════════════════════════════════════════════════════════════════ */

type Tone = "scan" | "light";

/** Two environments, two palettes. Nothing else changes. */
const PALETTE: Record<
  Tone,
  { line: string; recurrence: string; grid: string; fill: string; fillTo: number }
> = {
  scan: {
    line: "#45b3bd",
    recurrence: "#8f9699",
    grid: "rgb(244 245 242 / 0.07)",
    fill: "#45b3bd",
    fillTo: 0.2,
  },
  light: {
    line: "#10666e",
    recurrence: "#92959c",
    grid: "rgb(22 23 26 / 0.07)",
    fill: "#10666e",
    fillTo: 0.12,
  },
};

export function ActivityChart({
  data,
  draw,
  tone = "scan",
  height = 132,
}: {
  data: ActivityPoint[];
  draw: boolean;
  tone?: Tone;
  height?: number;
}) {
  const reduced = useReducedMotion();
  const gradientId = React.useId();

  const w = 320;
  const h = height;
  const padX = 6;
  const padY = 14;

  const palette = PALETTE[tone];

  /* Guard the degenerate cases so a one-point or all-zero series
     renders a flat baseline instead of NaN paths. */
  const span = Math.max(1, data.length - 1);
  const peak = Math.max(
    1,
    ...data.map((d) => Math.max(d.detections, d.recurrences))
  );
  const max = peak * 1.15;

  const x = (i: number) => padX + (i / span) * (w - padX * 2);
  const y = (v: number) => h - padY - (v / max) * (h - padY * 2);

  const line = (key: "detections" | "recurrences") =>
    data
      .map(
        (d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`
      )
      .join(" ");

  const linePath = line("detections");
  const recurPath = line("recurrences");
  const areaPath = `${linePath} L ${x(span).toFixed(1)} ${h - padY} L ${x(0).toFixed(1)} ${h - padY} Z`;

  const last = data[data.length - 1];
  const first = data[0];

  /* One clock for the whole drawing, so every part is phrased
     against the same stroke rather than each picking its own delay. */
  const still = Boolean(reduced);
  const shown = draw || still;
  const strokeSeconds = still ? 0 : 1.05;
  const at = (fraction: number) => (still ? 0 : strokeSeconds * fraction);

  const trend =
    first && last
      ? last.detections > first.detections
        ? "rising"
        : last.detections < first.detections
          ? "falling"
          : "flat"
      : "flat";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-full w-full"
      role="img"
      aria-label={`Detection activity across ${data.length} weeks, ${trend}. Peak ${peak} detections in a week.`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.fill} stopOpacity={palette.fillTo} />
          <stop offset="100%" stopColor={palette.fill} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Reference lines. Static — they are the paper, not the mark. */}
      {[0.33, 0.66].map((f) => (
        <line
          key={f}
          x1={padX}
          x2={w - padX}
          y1={padY + f * (h - padY * 2)}
          y2={padY + f * (h - padY * 2)}
          stroke={palette.grid}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Baseline — extends under the stroke as it travels. */}
      <motion.line
        x1={padX}
        x2={w - padX}
        y1={h - padY}
        y2={h - padY}
        stroke={palette.grid}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: still ? 1 : 0 }}
        animate={{ pathLength: shown ? 1 : 0 }}
        transition={{ duration: strokeSeconds, ease: "linear" }}
      />

      {/* Recurrence signal — quieter, drawn a beat behind. */}
      <motion.path
        d={recurPath}
        fill="none"
        stroke={palette.recurrence}
        strokeWidth="1"
        strokeDasharray="2 3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ opacity: still ? 0.65 : 0 }}
        animate={{ opacity: shown ? 0.65 : 0 }}
        transition={{
          duration: still ? 0 : motionTokens.duration.slow,
          delay: at(0.45),
          ease: motionTokens.ease.standard,
        }}
      />

      {/* The measurement itself. */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={palette.line}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: still ? 1 : 0 }}
        animate={{ pathLength: shown ? 1 : 0 }}
        transition={{ duration: strokeSeconds, ease: "linear" }}
      />

      {/* Weekly ticks, each arriving as the stroke passes over it. */}
      {data.map((d, i) => (
        <motion.circle
          key={d.week}
          cx={x(i)}
          cy={y(d.detections)}
          r="1.4"
          fill={palette.line}
          initial={{ opacity: still ? 0.55 : 0 }}
          animate={{ opacity: shown ? 0.55 : 0 }}
          transition={{
            duration: still ? 0 : motionTokens.duration.instant,
            delay: at(i / span),
          }}
        />
      ))}

      {/* Area under the curve, filled in behind the finished line. */}
      <motion.path
        d={areaPath}
        fill={`url(#${gradientId})`}
        initial={{ opacity: still ? 1 : 0 }}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={{
          duration: still ? 0 : motionTokens.duration.slow,
          delay: at(0.6),
          ease: motionTokens.ease.enter,
        }}
      />

      {/* Where the reading currently stands. */}
      {last ? (
        <motion.circle
          cx={x(span)}
          cy={y(last.detections)}
          r="2.75"
          fill={palette.line}
          initial={{ opacity: still ? 1 : 0 }}
          animate={{ opacity: shown ? 1 : 0 }}
          transition={{
            duration: still ? 0 : motionTokens.duration.fast,
            delay: at(1),
          }}
        />
      ) : null}
    </svg>
  );
}
