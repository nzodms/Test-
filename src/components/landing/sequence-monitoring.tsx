"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ActivityChart } from "@/components/scanner/activity-chart";
import { Reveal } from "@/components/motion/reveal";
import { copy } from "@/config/product";
import { activitySeries, scanTotals } from "@/lib/demo/scan-data";

/**
 * Sequence 3 — continuous monitoring.
 *
 * Wide chart, readings beneath, alert conditions last. Every number
 * is derived from the same series the scanner drew, so the story
 * stays consistent across the page.
 */
export function SequenceMonitoring() {
  const reduced = useReducedMotion();
  const [drawn, setDrawn] = React.useState(false);

  const last = activitySeries[activitySeries.length - 1]!;
  const prev = activitySeries[activitySeries.length - 2]!;
  const delta = last.detections - prev.detections;
  const deltaPct = Math.round((delta / prev.detections) * 100);

  const readings = [
    {
      label: "New detections last week",
      value: String(last.detections),
      note: `${delta >= 0 ? "+" : ""}${deltaPct}% versus the week before`,
    },
    {
      label: "Recurrences tracked",
      value: String(scanTotals.recurrences),
      note: "Content that reappeared after a removal",
    },
    {
      label: "Sources under watch",
      value: String(scanTotals.sources),
      note: "Re-checked on your monitoring schedule",
    },
  ];

  const conditions = [
    {
      name: "High-confidence match",
      body: "A new result scores above your alert threshold.",
    },
    {
      name: "New source category",
      body: "Your content appears on a type of source it hasn't before.",
    },
    {
      name: "Recurrence after removal",
      body: "Something removed earlier is detected again.",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-[1560px] px-4 py-24 sm:px-8 sm:py-32">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <Reveal className="max-w-xl">
          <p className="text-label text-accent">
            {copy.sequences.monitoring.label}
          </p>
          <h2 className="text-display mt-4 text-[26px] text-ink sm:text-[32px]">
            {copy.sequences.monitoring.title}
          </h2>
        </Reveal>
        <Reveal delay={0.06} className="max-w-md">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            {copy.sequences.monitoring.body}
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-12">
        <motion.div
          onViewportEnter={() => setDrawn(true)}
          viewport={{ once: true, margin: "-15%" }}
          whileInView={{}}
          className="overflow-hidden rounded-lg border border-edge bg-paper"
        >
          <div className="px-5 pt-5 sm:px-8 sm:pt-7">
            <div className="flex items-baseline justify-between">
              <h3 className="text-label">Detection activity</h3>
              <span className="text-data text-ink-soft">
                8 weeks · monitored profile
              </span>
            </div>
            <div className="mt-4 h-[150px] sm:h-[190px]">
              <ActivityChart
                data={activitySeries}
                draw={drawn || Boolean(reduced)}
                tone="light"
                height={190}
              />
            </div>
          </div>

          <dl className="mt-2 grid divide-y divide-edge border-t border-edge sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {readings.map((r) => (
              <div key={r.label} className="px-5 py-5 sm:px-8">
                <dt className="text-2xs text-ink-soft">{r.label}</dt>
                <dd className="tabular mt-1.5 text-2xl font-medium tracking-tight text-ink">
                  {r.value}
                </dd>
                <dd className="mt-1 text-[13px] text-ink-soft">{r.note}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </Reveal>

      <Reveal delay={0.14} className="mt-10">
        <h3 className="text-label">When you hear from us</h3>
        <ul className="mt-4 grid gap-x-10 gap-y-5 sm:grid-cols-3">
          {conditions.map((c) => (
            <li key={c.name} className="border-t border-edge-strong pt-3.5">
              <p className="text-[14px] font-medium text-ink">{c.name}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
