"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { VerificationSeal } from "@/components/file/file-parts";
import { Button } from "@/components/ui/button";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { pad2 } from "./chrome";
import {
  accountLabel,
  alertsLabel,
  coverageLabel,
  frequencyLabel,
  local,
  profileLine,
  reachLabel,
  type OnboardingState,
} from "./state";

/** Five lines, ~2.6s, and then the workspace is there to be opened. */
const LINE_MS = 520;

function detailFor(index: number, state: OnboardingState): string {
  switch (index) {
    case 0:
      return accountLabel(state.accountType) ?? local.workspace.pending;
    case 1:
      return profileLine(state) ?? local.profilesNone;
    case 2:
      return `${coverageLabel(state.coverage)} · ${frequencyLabel(state.frequency)}`;
    case 3:
      return `${alertsLabel(state)} · ${reachLabel(state)}`;
    default:
      return "";
  }
}

/**
 * The workspace being assembled.
 *
 * Each line is written into the record with the value it was given,
 * so the last thing the person sees is their own setup read back to
 * them. Opening the workspace is then their move, not a timer's:
 * a redirect fired at the end of an animation gives nobody time to
 * read it, breaks the back button, and — where the dashboard is
 * gated — drops an unauthenticated person on the sign-in page with
 * no explanation of why.
 */
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
  const lines = local.workspace.lines;
  const total = lines.length;
  const [completed, setCompleted] = React.useState(0);

  React.useEffect(() => {
    if (reduced) {
      // No staged assembly: the finished state is legible at once.
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
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[14.5px] text-ink-soft">{local.workspace.assembly}</p>
        <p className="font-mono text-[12.5px] tabular text-ink-soft">
          {completed} / {total}
        </p>
      </div>

      {/* Progress, drawn as a rule filling — not a bar in a track. */}
      <div aria-hidden className="relative mt-3 h-px w-full bg-edge">
        <motion.span
          className="absolute inset-y-0 left-0 w-full origin-left bg-graphite"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: completed / total }}
          transition={{
            duration: reduced
              ? motionTokens.duration.instant
              : motionTokens.duration.slow,
            ease: motionTokens.ease.standard,
          }}
        />
      </div>

      <ol className="mt-5">
        {lines.map((line, index) => {
          const isComplete = index < completed;
          const isActive = index === completed && !done;
          const detail = detailFor(index, state);
          return (
            <li
              key={line}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3 border-t border-edge py-3.5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-x-4"
            >
              <span className="font-mono text-[12.5px] tabular text-ink-soft">
                {pad2(index + 1)}
              </span>
              <span
                className={cn(
                  "min-w-0 text-[15.5px] transition-colors duration-500",
                  isComplete || isActive ? "text-ink" : "text-ink-soft"
                )}
              >
                {line}
              </span>
              {detail ? (
                <motion.span
                  initial={false}
                  animate={{ opacity: isComplete ? 1 : 0 }}
                  transition={{ duration: motionTokens.duration.fast }}
                  className="col-start-2 mt-0.5 min-w-0 truncate text-[14px] text-ink-soft sm:col-start-3 sm:mt-0 sm:text-right"
                >
                  {isComplete ? detail : null}
                </motion.span>
              ) : null}
            </li>
          );
        })}
      </ol>

      {done ? (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced
              ? motionTokens.duration.instant
              : motionTokens.duration.reveal,
            ease: motionTokens.ease.enter,
          }}
          className="mt-8 border-t border-edge pt-7"
        >
          {/* The heading of this entry has already changed to
              "Workspace ready" — this states what that means rather
              than saying it a second time in a larger size. */}
          <p
            role="status"
            className="max-w-[54ch] text-[15px] leading-relaxed text-ink-soft"
          >
            <span className="sr-only">{local.workspace.ready}. </span>
            {local.workspace.readyNote}
          </p>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row-reverse sm:items-center sm:justify-between">
            <Button
              type="button"
              size="lg"
              onClick={onFinish}
              className="h-12 w-full text-[15.5px] sm:h-11 sm:w-auto sm:px-7"
            >
              {local.workspace.open}
            </Button>
            <VerificationSeal state="required" className="text-[14px]" />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
