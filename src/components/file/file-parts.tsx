"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lock } from "lucide-react";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   The file's component language.

   Everything here is a document structure — a page, a tab, an index
   row, a margin reference, a seal. None of it is a card. Structure
   comes from rules, layering, margins and type, which is what keeps
   this from reading as a dashboard wearing a serif.
   ════════════════════════════════════════════════════════════════ */

/* ── Report page ───────────────────────────────────────────────── */

export function ReportPage({
  stacked = false,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { stacked?: boolean }) {
  return (
    <div
      className={cn(
        stacked ? "report-page-stacked" : "report-page",
        "rounded-[3px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── File tabs ─────────────────────────────────────────────────── */

export interface FileTab {
  id: string;
  label: string;
  /** Locked tabs are visible but not openable until verification. */
  locked?: boolean;
}

/**
 * Index tabs along the top of a file. The active tab is joined to
 * the page beneath it — that join is what makes it read as a tab
 * rather than a segmented control.
 */
export function FileTabs({
  tabs,
  active,
  onSelect,
  className,
}: {
  tabs: FileTab[];
  active: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label="File sections"
      className={cn(
        "relative flex items-end gap-0.5 overflow-x-auto scrollbar-quiet",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.locked || undefined}
            onClick={() => !tab.locked && onSelect(tab.id)}
            className={cn(
              "relative shrink-0 rounded-t-[4px] px-4 pb-2.5 pt-2 text-[14px] transition-colors",
              "border border-b-0",
              isActive
                ? "z-10 border-edge bg-page text-ink"
                : tab.locked
                  ? "border-transparent bg-transparent text-ink-faint"
                  : "border-transparent bg-mineral/60 text-ink-soft hover:bg-mineral hover:text-ink"
            )}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {tab.locked ? (
                <Lock className="size-3 shrink-0" aria-hidden />
              ) : null}
            </span>
            {/* Joins the active tab to the page below it */}
            {isActive ? (
              <motion.span
                layoutId={reduced ? undefined : "file-tab-join"}
                className="absolute inset-x-px -bottom-px h-px bg-page"
              />
            ) : null}
          </button>
        );
      })}
      <span className="h-px flex-1 self-end bg-edge" />
    </div>
  );
}

/* ── Index row — the register line ─────────────────────────────── */

/**
 * One entry in a register: a margin reference, a subject, and its
 * classifying facts. Separated by a rule, never boxed.
 */
export function IndexRow({
  reference,
  subject,
  detail,
  facts,
  emphasis = false,
  muted = false,
  className,
  children,
}: {
  reference: string;
  subject: React.ReactNode;
  detail?: React.ReactNode;
  facts?: React.ReactNode;
  emphasis?: boolean;
  muted?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "grid list-none grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 border-t border-edge py-5",
        "sm:grid-cols-[2.75rem_minmax(0,1fr)_auto] sm:gap-x-8",
        muted && "opacity-65",
        className
      )}
    >
      <span
        aria-hidden
        className="pt-0.5 font-mono text-[12.5px] tabular text-ink-faint"
      >
        {reference}
      </span>

      <div className="min-w-0">
        <p
          className={cn(
            emphasis
              ? "text-[17px] font-medium text-ink sm:text-[18px]"
              : "text-[16px] text-ink"
          )}
        >
          {subject}
        </p>
        {detail ? <div className="mt-1.5">{detail}</div> : null}
        {children}
      </div>

      {facts ? (
        <div className="col-span-2 mt-3 text-[14px] text-ink-soft sm:col-span-1 sm:mt-0 sm:text-right">
          {facts}
        </div>
      ) : null}
    </li>
  );
}

/* ── Field — a labelled fact inside a file ─────────────────────── */

export function FileField({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-edge py-3", className)}>
      <dt className="text-[13.5px] text-ink-soft">{label}</dt>
      <dd className="mt-1 text-[16px] text-ink">{value}</dd>
    </div>
  );
}

/* ── Verification seal ─────────────────────────────────────────── */

/**
 * A seal, drawn — not stamped. A precise concentric mark that reads
 * as a modern certification device rather than a rubber stamp.
 */
export function VerificationSeal({
  state = "required",
  className,
}: {
  state?: "required" | "verified";
  className?: string;
}) {
  const verified = state === "verified";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-[13.5px]",
        verified ? "text-ok" : "text-ink-soft",
        className
      )}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle
          cx="12"
          cy="12"
          r="10.25"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray={verified ? undefined : "2.5 2.5"}
          opacity={verified ? 0.55 : 0.75}
        />
        <circle cx="12" cy="12" r="6.75" stroke="currentColor" strokeWidth="1" />
        {verified ? (
          <path
            d="M9 12.1 11.1 14.2 15.2 10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <circle cx="12" cy="12" r="1.9" fill="currentColor" opacity="0.5" />
        )}
      </svg>
      {verified ? "Ownership verified" : "Ownership verification required"}
    </span>
  );
}

/* ── Timeline mark ─────────────────────────────────────────────── */

export function TimelineMark({
  stamp,
  title,
  detail,
  last = false,
}: {
  stamp: string;
  title: React.ReactNode;
  detail?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <li className="relative grid list-none grid-cols-[minmax(0,1fr)] gap-x-6 pb-7 last:pb-0 sm:grid-cols-[7rem_minmax(0,1fr)]">
      {!last ? (
        <span
          aria-hidden
          className="absolute left-0 top-2 hidden h-full w-px bg-edge sm:left-[7rem] sm:block"
        />
      ) : null}
      <span className="font-mono text-[12.5px] text-ink-faint sm:pt-px sm:text-right">
        {stamp}
      </span>
      <div className="relative mt-1.5 min-w-0 sm:mt-0 sm:pl-6">
        <span
          aria-hidden
          className="absolute left-0 top-[0.5em] hidden size-[5px] -translate-x-[2px] rounded-full bg-graphite sm:block"
        />
        <p className="text-[15.5px] text-ink">{title}</p>
        {detail ? (
          <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
            {detail}
          </p>
        ) : null}
      </div>
    </li>
  );
}

/* ── Section heading inside a file ─────────────────────────────── */

export function FileSection({
  index,
  title,
  note,
  actions,
  children,
  className,
}: {
  index?: string;
  title: string;
  note?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="flex items-baseline gap-3 text-[19px] text-ink">
          {index ? (
            <span className="font-mono text-[13px] tabular text-ink-faint">
              {index}
            </span>
          ) : null}
          {title}
        </h2>
        {actions}
      </div>
      {note ? (
        <p className="mt-1.5 max-w-xl text-[14.5px] leading-relaxed text-ink-soft">
          {note}
        </p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* ── Page assembly motion ──────────────────────────────────────── */

/**
 * A page settling into the file. Slightly different from a fade-up:
 * the page arrives from behind, so it reads as being laid down
 * rather than sliding in.
 */
export function PageAssemble({
  delay = 0,
  children,
  className,
}: {
  delay?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10, scale: 0.994 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: motionTokens.duration.reveal,
        delay,
        ease: motionTokens.ease.enter,
      }}
    >
      {children}
    </motion.div>
  );
}
