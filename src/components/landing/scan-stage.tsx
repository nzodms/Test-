"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SearchField } from "@/components/scanner/search-field";
import { ScannerPanel } from "@/components/scanner/scanner-panel";
import { copy } from "@/config/product";
import { motionTokens } from "@/lib/motion";
import type { Platform } from "@/lib/validation";

export interface ScanSession {
  username: string;
  platform: Platform | null;
  raw: string;
}

/**
 * The first screen. It starts as a calm, near-empty workspace with
 * one instrument — the search field — and becomes the scanner in
 * place. The page does not navigate: it transforms.
 *
 * Controlled by the page so the closing sequence can start a scan
 * here too.
 */
export function ScanStage({
  session,
  onStart,
  onReset,
  stageRef,
}: {
  session: ScanSession | null;
  onStart: (username: string, platform: Platform | null, raw: string) => void;
  onReset: () => void;
  stageRef?: React.RefObject<HTMLElement | null>;
}) {
  const reduced = useReducedMotion();

  return (
    <section
      ref={stageRef}
      aria-label="Scan"
      className="mx-auto w-full max-w-[1560px] scroll-mt-20 px-4 sm:px-8"
    >
      <AnimatePresence mode="wait" initial={false}>
        {session === null ? (
          <motion.div
            key="idle"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: -16 }}
            transition={{
              duration: motionTokens.duration.base,
              ease: motionTokens.ease.enter,
            }}
            className="grid min-h-[min(70vh,600px)] items-center gap-14 py-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:gap-20"
          >
            {/* Composition sits left of the measure on large screens
                rather than floating in the middle of the viewport.
                min-w-0 is required: grid items default to
                min-width:auto, so the search input's intrinsic width
                would otherwise push the column past a 320px screen. */}
            <div className="min-w-0 max-w-[620px]">
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: motionTokens.duration.slow,
                  ease: motionTokens.ease.enter,
                }}
                className="text-display text-[26px] text-ink sm:text-[32px]"
              >
                {copy.landing.purpose}
              </motion.p>

              <motion.div
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: motionTokens.duration.slow,
                  delay: reduced ? 0 : 0.08,
                  ease: motionTokens.ease.enter,
                }}
                className="mt-7"
              >
                <SearchField onScan={onStart} autoFocus />
              </motion.div>

              <motion.ul
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: motionTokens.duration.slow,
                  delay: reduced ? 0 : 0.2,
                }}
                className="mt-10 flex flex-wrap gap-x-6 gap-y-2"
              >
                {copy.legal.positioning.map((line) => (
                  <li
                    key={line}
                    className="flex items-center gap-2 text-2xs text-ink-soft"
                  >
                    <span aria-hidden className="h-px w-3 bg-edge-strong" />
                    {line}
                  </li>
                ))}
              </motion.ul>
            </div>

            {/* The right side earns its space: it states exactly what
                a scan opens, and prefigures the scanner's own source
                column. Informative, not decorative. */}
            <motion.aside
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: motionTokens.duration.slow,
                delay: reduced ? 0 : 0.28,
                ease: motionTokens.ease.enter,
              }}
              className="hidden lg:block"
              aria-label="Scan coverage"
            >
              <h2 className="text-label">{copy.landing.coverageTitle}</h2>
              <ul className="mt-4 space-y-3">
                {copy.landing.coverage.map((item) => (
                  <li
                    key={item.name}
                    className="border-t border-edge pt-3 first:border-t-0 first:pt-0"
                  >
                    <p className="text-[13px] font-medium text-ink">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-edge-strong pt-4 text-2xs leading-relaxed text-ink-soft">
                {copy.landing.coverageNote}
              </p>
            </motion.aside>
          </motion.div>
        ) : (
          <motion.div
            key="scanning"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: motionTokens.duration.fast }}
            className="py-6 sm:py-10"
          >
            <ScannerPanel
              key={`${session.username}-${session.raw}`}
              username={session.username}
              platform={session.platform}
              onEdit={onReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
