"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { ScanStage, type ScanSession } from "@/components/landing/scan-stage";
import { SequenceFound } from "@/components/landing/sequence-found";
import { SequenceWorkflow } from "@/components/landing/sequence-workflow";
import { SequenceMonitoring } from "@/components/landing/sequence-monitoring";
import { SequenceAgency } from "@/components/landing/sequence-agency";
import { SequenceFinal } from "@/components/landing/sequence-final";
import type { Platform } from "@/lib/validation";

/**
 * The landing is the product. It opens on a quiet workspace with a
 * single instrument, becomes a running scan in place, then continues
 * into four editorial sequences that extend the same interface.
 */
export default function HomePage() {
  const reduced = useReducedMotion();
  const [session, setSession] = React.useState<ScanSession | null>(null);
  const stageRef = React.useRef<HTMLElement>(null);

  const start = React.useCallback(
    (username: string, platform: Platform | null, raw: string) => {
      setSession({ username, platform, raw });
    },
    []
  );

  /** Started from the closing sequence — bring the stage back into view. */
  const startFromFooter = React.useCallback(
    (username: string, platform: Platform | null, raw: string) => {
      setSession({ username, platform, raw });
      stageRef.current?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    },
    [reduced]
  );

  const reset = React.useCallback(() => {
    setSession(null);
    stageRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }, [reduced]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav compact={session !== null} />
      <main className="flex-1">
        <ScanStage
          session={session}
          onStart={start}
          onReset={reset}
          stageRef={stageRef}
        />
        <SequenceFound />
        <SequenceWorkflow />
        <SequenceMonitoring />
        <SequenceAgency />
        <SequenceFinal onScan={startFromFooter} />
      </main>
      <SiteFooter />
    </div>
  );
}
