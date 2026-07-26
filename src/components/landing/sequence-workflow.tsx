"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TimelineEntry } from "@/components/primitives";
import { copy } from "@/config/product";
import { motionTokens } from "@/lib/motion";

/**
 * Sequence 2 — detection to action.
 *
 * A sticky statement on the left, the process advancing on the
 * right as the reader scrolls. Steps mark themselves complete as
 * they pass, so the sequence is read as progress rather than a list.
 */
export function SequenceWorkflow() {
  const reduced = useReducedMotion();
  const [reached, setReached] = React.useState(0);
  const steps = copy.sequences.action.steps;

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-edge bg-paper/60"
    >
      <div className="mx-auto w-full max-w-[1560px] px-4 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-label text-accent">
              {copy.sequences.action.label}
            </p>
            <h2 className="text-display mt-4 text-[26px] text-ink sm:text-[32px]">
              {copy.sequences.action.title}
            </h2>

            {/* Progress read-out tied to the steps beside it */}
            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-edge">
                <motion.div
                  className="h-px bg-accent"
                  animate={{
                    scaleX: reduced ? 1 : reached / steps.length,
                  }}
                  style={{ originX: 0 }}
                  transition={{
                    duration: motionTokens.duration.slow,
                    ease: motionTokens.ease.standard,
                  }}
                />
              </div>
              <span className="text-data tabular text-ink-soft">
                {String(reduced ? steps.length : reached).padStart(2, "0")}/
                {String(steps.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <ol className="max-w-xl">
            {steps.map((step, i) => (
              <motion.div
                key={step.name}
                onViewportEnter={() =>
                  setReached((prev) => Math.max(prev, i + 1))
                }
                viewport={{ once: true, margin: "-45% 0px -45% 0px" }}
                whileInView={{ opacity: 1 }}
                initial={reduced ? false : { opacity: 0.45 }}
                transition={{ duration: motionTokens.duration.base }}
              >
                <TimelineEntry
                  index={i + 1}
                  name={step.name}
                  complete={reduced || reached > i}
                  active={!reduced && reached === i + 1}
                  last={i === steps.length - 1}
                >
                  {step.body}
                </TimelineEntry>
              </motion.div>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
