"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { pad2 } from "./chrome";
import { local } from "./state";

/* ════════════════════════════════════════════════════════════════
   The setup ledger.

   Six ruled entries on one page. The step being answered is open;
   the ones already answered collapse to a single line that keeps
   its answer visible and can be reopened; the ones still ahead are
   named but quiet. Nothing cross-fades — the page stays put and the
   answers accumulate down it.
   ════════════════════════════════════════════════════════════════ */

/* ── An entry already answered, or still ahead ─────────────────── */

export function ClosedStep({
  index,
  name,
  value,
  done,
  first,
  onOpen,
}: {
  index: number;
  name: string;
  value: string | null;
  done: boolean;
  first: boolean;
  onOpen: () => void;
}) {
  const row = cn(
    "grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-x-3 border-t border-edge py-4 text-left",
    "sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-x-4",
    first && "border-t-0"
  );

  const body = (
    <>
      <span className="font-mono text-[12.5px] tabular text-ink-soft">
        {pad2(index)}
      </span>
      <span className="min-w-0 sm:flex sm:items-baseline sm:gap-6">
        <span className="block text-[14.5px] text-ink-soft sm:w-[9.5rem] sm:shrink-0">
          {name}
        </span>
        {done ? (
          <span className="mt-0.5 block min-w-0 truncate text-[15.5px] text-ink sm:mt-0">
            {value ?? local.notSet}
          </span>
        ) : null}
      </span>
      {done ? (
        <span className="shrink-0 text-[14.5px] text-ink-soft underline decoration-edge-strong underline-offset-4 transition-colors group-hover:text-ink sm:no-underline">
          {local.change}
        </span>
      ) : null}
    </>
  );

  /* Still ahead: named, so the shape of the whole setup is known
     from the first screen, but not yet openable. */
  if (!done) {
    return <div className={row}>{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={false}
      className={cn(row, "group min-h-14 transition-colors hover:bg-paper/70")}
    >
      {body}
    </button>
  );
}

/* ── The entry being answered ──────────────────────────────────── */

export function OpenStep({
  index,
  title,
  blurb,
  first,
  headingRef,
  rootRef,
  children,
  actions,
}: {
  index: number;
  title: string;
  blurb?: string;
  first: boolean;
  headingRef?: React.Ref<HTMLHeadingElement>;
  rootRef?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const reduced = useReducedMotion() ?? false;

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative scroll-mt-20 border-t border-edge py-7 sm:scroll-mt-28 sm:py-9",
        first && "border-t-0"
      )}
    >
      {/* Where you are, marked in the margin of the rule. */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 h-px w-10 bg-accent",
          first ? "top-0" : "-top-px"
        )}
      />

      <div className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-x-3 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-x-4">
        <span className="font-mono text-[12.5px] tabular text-ink-soft">
          {pad2(index)}
        </span>
        {/* The question opens a section of the record — the display
            register is kept for the one moment it is earned. */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-title text-[23px] text-ink outline-none sm:text-[28px]"
        >
          {title}
        </h1>

        <div className="col-span-2 sm:col-span-1 sm:col-start-2">
          {blurb ? (
            <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-ink-soft">
              {blurb}
            </p>
          ) : null}

          {/* Only the answering surface moves, and only once. */}
          <motion.div
            key={index}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduced
                ? motionTokens.duration.instant
                : motionTokens.duration.base,
              ease: motionTokens.ease.enter,
            }}
          >
            <div className="mt-7">{children}</div>
            {actions ? <div className="mt-9">{actions}</div> : null}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ── Actions, printed at the foot of the open entry ────────────── */

export function StepActions({
  primaryLabel,
  onPrimary,
  onBack,
  showBack,
  message,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  onBack: () => void;
  showBack: boolean;
  message: string | null;
}) {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-end sm:gap-4">
        <Button
          type="button"
          size="lg"
          onClick={onPrimary}
          className="h-12 w-full text-[15.5px] sm:h-11 sm:w-auto sm:px-7"
        >
          {primaryLabel}
        </Button>
        {showBack ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onBack}
            className="h-12 w-full text-[15px] sm:h-11 sm:w-auto"
          >
            {local.back}
          </Button>
        ) : null}
      </div>

      {message ? (
        <p role="alert" className="mt-4 text-[14.5px] text-crit">
          {message}
        </p>
      ) : null}
    </div>
  );
}
