"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { scanTotals } from "@/lib/demo/scan-data";
import { routes } from "@/config/navigation";
import { motionTokens } from "@/lib/motion";

/**
 * Phones only. Once the report exists, the next step stays within
 * thumb reach instead of living at the bottom of a long scroll.
 * Quiet by design: one line of fact, one action, a hairline above.
 */
export function MobileReportBar({ visible }: { visible: boolean }) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={reduced ? false : { y: 72 }}
          animate={{ y: 0 }}
          exit={reduced ? undefined : { y: 72 }}
          transition={{
            duration: motionTokens.duration.slow,
            ease: motionTokens.ease.enter,
          }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-edge bg-canvas/95 backdrop-blur-md sm:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center gap-4 px-4 py-3">
            <p className="min-w-0 flex-1 text-[15px] text-ink">
              <span className="tabular font-medium">{scanTotals.matches}</span>{" "}
              matches found
            </p>
            <Link
              href={routes.onboardingDemo}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-sm bg-accent px-4 text-[15px] font-medium text-[#f4fbfb] transition-colors active:bg-accent-deep"
            >
              View full report
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
