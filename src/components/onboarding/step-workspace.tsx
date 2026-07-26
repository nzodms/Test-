"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataRow } from "@/components/primitives";
import { Surface } from "@/components/primitives/surface";
import { copy } from "@/config/product";
import { motionTokens } from "@/lib/motion";
import {
  accountLabel,
  coverageLabel,
  frequencyLabel,
  local,
  profileCountLabel,
  type OnboardingState,
} from "./state";

/** 4 lines × 650ms = ~2.6s of assembly. */
const LINE_MS = 650;

function detailFor(index: number, state: OnboardingState): string {
  switch (index) {
    case 0:
      return accountLabel(state.accountType) ?? local.assemblyPending;
    case 1:
      return profileCountLabel(state.profiles.length);
    case 2:
      return `${frequencyLabel(state.frequency)} · ${coverageLabel(state.coverage)}`;
    default:
      if (state.highConfidenceAlerts) return local.alertsHigh;
      if (state.weeklySummary) return local.alertsWeekly;
      return local.alertsNone;
  }
}

export function StepWorkspace({
  state,
  onAssembled,
  onFinish,
}: {
  state: OnboardingState;
  onAssembled: () => void;
  onFinish: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const lines = copy.onboarding.steps.workspace.lines;
  const total = lines.length;
  const [completed, setCompleted] = React.useState(0);

  React.useEffect(() => {
    if (reduced) {
      // Reduced motion: no staged assembly, jump straight to the
      // finished state so the content is legible immediately.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCompleted(total);
      onAssembled();
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const run = (index: number) => {
      timer = setTimeout(() => {
        if (cancelled) return;
        setCompleted(index + 1);
        if (index + 1 < total) {
          run(index + 1);
        } else {
          onAssembled();
        }
      }, LINE_MS);
    };
    run(0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [reduced, total, onAssembled]);

  const done = completed >= total;

  return (
    <div>
      <Surface tone="scanner" reflection className="rounded-lg p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-label-scan">{local.assembly}</p>
          <span className="text-data tabular text-scan-faint">
            {completed} / {total}
          </span>
        </div>

        <div className="mt-4 divide-y divide-scan-edge border-t border-scan-edge">
          {lines.map((line, index) => {
            const isComplete = index < completed;
            const isActive = index === completed && !done;
            return (
              <DataRow
                key={line}
                status={
                  isComplete ? "complete" : isActive ? "active" : "pending"
                }
                label={
                  <span className={isComplete || isActive ? "" : "text-scan-faint"}>
                    {line}
                  </span>
                }
                meta={
                  isComplete || isActive ? detailFor(index, state) : undefined
                }
                className="py-3"
              />
            );
          })}
        </div>
      </Surface>

      {done ? (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced
              ? motionTokens.duration.instant
              : motionTokens.duration.base,
            ease: motionTokens.ease.enter,
          }}
          className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p role="status" className="text-title text-[15px] text-ink">
            {copy.onboarding.steps.workspace.ready}
          </p>
          <Button size="lg" onClick={onFinish} className="w-full sm:w-auto">
            {copy.onboarding.finish}
            <ArrowRight aria-hidden />
          </Button>
        </motion.div>
      ) : null}
    </div>
  );
}
