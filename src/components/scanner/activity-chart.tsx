"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ActivityPoint } from "@/lib/scan/types";

/**
 * Bespoke activity chart — hand-drawn SVG, no chart library, so it
 * belongs to the design system. A primary detections line that
 * draws itself, plus a quieter recurrence signal. `draw` gates the
 * reveal so it animates in sync with the scan assembling.
 */
export function ActivityChart({
  data,
  draw,
  tone = "scan",
  height = 132,
}: {
  data: ActivityPoint[];
  draw: boolean;
  tone?: "scan" | "light";
  height?: number;
}) {
  const reduced = useReducedMotion();
  const w = 320;
  const h = height;
  const padX = 6;
  const padY = 14;
  const max = Math.max(...data.map((d) => d.detections)) * 1.15;

  const x = (i: number) => padX + (i / (data.length - 1)) * (w - padX * 2);
  const y = (v: number) => h - padY - (v / max) * (h - padY * 2);

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.detections).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${x(data.length - 1)} ${h - padY} L ${x(0)} ${h - padY} Z`;
  const recurPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.recurrences).toFixed(1)}`)
    .join(" ");

  const dark = tone === "scan";
  const primary = dark ? "#45b3bd" : "#10666e";
  const secondary = dark ? "#8f9699" : "#6e706b";
  const grid = dark ? "rgb(244 245 242 / 0.06)" : "rgb(17 18 16 / 0.06)";

  const drawn = draw || reduced;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-full w-full"
      role="img"
      aria-label={`Detection activity over ${data.length} weeks, trending upward`}
      preserveAspectRatio="none"
    >
      {/* horizontal gridlines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={padX}
          x2={w - padX}
          y1={padY + f * (h - padY * 2)}
          y2={padY + f * (h - padY * 2)}
          stroke={grid}
          strokeWidth="1"
        />
      ))}

      {/* area fill */}
      <defs>
        <linearGradient id={`act-fill-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={primary} stopOpacity={dark ? 0.22 : 0.14} />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath}
        fill={`url(#act-fill-${tone})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: drawn ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />

      {/* recurrence signal (dashed, quiet) */}
      <motion.path
        d={recurPath}
        fill="none"
        stroke={secondary}
        strokeWidth="1"
        strokeDasharray="2 3"
        initial={{ opacity: 0 }}
        animate={{ opacity: drawn ? 0.7 : 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />

      {/* primary detections line — draws itself */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={primary}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: drawn ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* end marker */}
      <motion.circle
        cx={x(data.length - 1)}
        cy={y(data[data.length - 1]!.detections)}
        r="2.5"
        fill={primary}
        initial={{ scale: 0 }}
        animate={{ scale: drawn ? 1 : 0 }}
        transition={{ duration: 0.3, delay: reduced ? 0 : 0.9 }}
      />
    </svg>
  );
}
