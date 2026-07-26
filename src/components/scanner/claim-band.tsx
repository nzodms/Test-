"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copy } from "@/config/product";
import { routes } from "@/config/navigation";
import { scanTotals } from "@/lib/demo/scan-data";
import { motionTokens } from "@/lib/motion";

/**
 * The conversion moment, integrated into the scanner composition —
 * not a modal, not an ad. It appears once details lock, stating
 * plainly what was found and what unlocks the rest.
 */
export function ClaimBand({
  visible,
  onNewSearch,
}: {
  visible: boolean;
  onNewSearch: () => void;
}) {
  const reduced = useReducedMotion();
  if (!visible) return null;

  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.enter,
      }}
      aria-labelledby="claim-title"
      className="border-t border-scan-edge-strong bg-scan-raised/60 px-4 py-5 sm:px-6 sm:py-6"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-label-scan">
            <ShieldCheck className="size-3.5 text-accent-bright" aria-hidden />
            {copy.lock.title}
          </p>
          <h2
            id="claim-title"
            className="text-title mt-2 max-w-xl text-lg leading-snug text-scan-ink sm:text-xl"
          >
            {copy.lock.summary(scanTotals.matches, scanTotals.sources)}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-scan-soft">
            {copy.lock.action}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row sm:items-center lg:flex-col lg:items-stretch xl:flex-row">
          <Button variant="accent" size="lg" asChild className="justify-center">
            <Link href={routes.onboarding}>
              {copy.lock.cta}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button
            variant="scan-ghost"
            size="lg"
            onClick={onNewSearch}
            className="justify-center"
          >
            {copy.lock.secondary}
          </Button>
        </div>
      </div>

      <p className="mt-5 border-t border-scan-edge pt-4 text-2xs text-scan-faint">
        {copy.lock.protection}
      </p>
    </motion.section>
  );
}
