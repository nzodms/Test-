"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LogoMark } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/states";
import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { local, TOTAL_STEPS } from "./state";

/* ════════════════════════════════════════════════════════════════
   The frame the setup runs inside.

   Nothing here is remounted between steps: the header, the rail and
   the page are one continuous surface, and only the answers change.
   ════════════════════════════════════════════════════════════════ */

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/* ── Header ────────────────────────────────────────────────────── */

export function FlowHeader({
  reference,
  resolved,
  demoMode,
}: {
  reference: string;
  resolved: boolean;
  demoMode: boolean;
}) {
  const reduced = useReducedMotion() ?? false;

  return (
    <header className="sticky top-0 z-30 border-b border-edge bg-canvas/92 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1100px] items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-8">
        <Link
          href={routes.home}
          className="flex h-11 shrink-0 items-center gap-2.5 rounded-xs"
          aria-label={`${brand.name} — home`}
        >
          <LogoMark size={19} />
          <span className="text-[16.5px] font-medium tracking-tight text-ink">
            {brand.name}
          </span>
        </Link>

        <span aria-hidden className="hidden h-5 w-px bg-edge-strong sm:block" />

        <p className="hidden min-w-0 truncate text-[14.5px] text-ink-soft sm:block">
          {local.headerLine}
        </p>

        <div className="ml-auto flex shrink-0 items-center gap-4 sm:gap-6">
          {/* The reference resolves in place once a profile is named —
              the only thing in the header that ever changes. */}
          <motion.p
            key={resolved ? "resolved" : "pending"}
            initial={reduced ? false : { opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: motionTokens.duration.base,
              ease: motionTokens.ease.enter,
            }}
            className={cn(
              "hidden font-mono text-[12.5px] tracking-[0.04em] md:block",
              resolved ? "text-ink" : "text-ink-soft"
            )}
          >
            {reference}
          </motion.p>

          <Link
            href={routes.home}
            className="inline-flex h-11 items-center rounded-xs px-1 text-[14.5px] text-ink-soft transition-colors hover:text-ink"
          >
            {local.exit}
          </Link>
        </div>
      </div>

      {demoMode ? (
        <div className="border-t border-edge-faint bg-mineral/60">
          <div className="mx-auto flex w-full max-w-[1100px] items-baseline gap-2.5 px-4 py-2 sm:px-8">
            <span className="shrink-0 font-mono text-[12.5px] tracking-[0.06em] text-ink-soft">
              {local.demoMarker}
            </span>
            <p className="text-[14px] leading-snug text-ink-soft">
              {local.demoNote}
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}

/* ── Setup rail — the persistent index, desktop margin device ──── */

export type RailItem = {
  label: string;
  state: "pending" | "active" | "done";
  reachable: boolean;
};

export function SetupRail({
  items,
  onSelect,
}: {
  items: RailItem[];
  onSelect: (step: number) => void;
}) {
  return (
    <nav aria-label={local.railLabel} className="relative">
      <span
        aria-hidden
        className="absolute left-0 top-1 h-[calc(100%-0.75rem)] w-px bg-edge"
      />

      <ol>
        {items.map((item, i) => {
          const step = i + 1;
          const inner = (
            <>
              {/* The mark grows along the rule rather than animating
                  its own width — transform only, no reflow. */}
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-[1.4rem] h-px w-3.5 origin-left",
                  "transition-[transform,background-color] duration-200",
                  item.state === "active"
                    ? "scale-x-100 bg-accent"
                    : item.state === "done"
                      ? "scale-x-[0.7] bg-graphite"
                      : "scale-x-[0.4] bg-edge-strong"
                )}
              />
              <span className="block font-mono text-[12.5px] tabular text-ink-soft">
                {pad2(step)}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-[14px] transition-colors duration-200",
                  item.state === "active"
                    ? "font-medium text-ink"
                    : "text-ink-soft"
                )}
              >
                {item.label}
              </span>
            </>
          );

          return (
            <li key={item.label} className="relative">
              {item.reachable ? (
                <button
                  type="button"
                  onClick={() => onSelect(step)}
                  aria-current={item.state === "active" ? "step" : undefined}
                  className="relative -ml-2 flex min-h-11 w-[calc(100%+0.5rem)] flex-col justify-center rounded-xs py-1.5 pl-6 pr-2 text-left transition-colors hover:bg-page/70"
                >
                  {inner}
                </button>
              ) : (
                <div
                  aria-current={item.state === "active" ? "step" : undefined}
                  className="relative flex min-h-11 flex-col justify-center py-1.5 pl-4"
                >
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── Resume note ───────────────────────────────────────────────── */

export function ResumeNote({ visible }: { visible: boolean }) {
  return (
    <div
      className={cn(
        "overflow-hidden transition-opacity duration-500",
        visible ? "mb-5 h-6 opacity-100" : "h-0 opacity-0"
      )}
      aria-hidden={!visible}
    >
      <p
        role="status"
        className="flex items-center gap-2.5 text-[14.5px] text-ink-soft"
      >
        {visible ? (
          <>
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full bg-accent"
            />
            {local.resume}
          </>
        ) : null}
      </p>
    </div>
  );
}

/* ── Pre-hydration placeholder ─────────────────────────────────── */

export function FlowSkeleton() {
  return (
    <div className="min-w-0">
      <span className="sr-only" role="status">
        {local.loading}
      </span>
      <div aria-hidden className="report-page rounded-[3px] px-4 py-2 sm:px-8">
        <div className="py-7">
          <Skeleton className="h-7 w-2/3 max-w-sm" />
          <Skeleton className="mt-4 h-4 w-full max-w-md" />
          <Skeleton className="mt-8 h-14 w-full" />
          <Skeleton className="mt-px h-14 w-full" />
        </div>
        {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
          <div key={i} className="border-t border-edge py-5">
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
