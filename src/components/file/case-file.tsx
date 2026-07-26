"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ScanPhase } from "@/lib/scan/types";
import { useScanController } from "@/lib/scan/use-scan-controller";
import { sourceCoverage } from "@/lib/demo/scan-data";
import { caseReference, FILE_SECTIONS } from "@/lib/case-ref";
import { ReferenceRail, type RailMark } from "./reference-rail";
import { FileIntake } from "./intake";
import { ScanSession } from "./scan-session";
import { ReportCover } from "./report-cover";
import { MobileReport } from "./mobile-report";
import { motionTokens } from "@/lib/motion";
import type { Platform } from "@/lib/validation";

/* Choreography windows (ms) — mirrored from lib/scan/timeline.ts */
const SOURCES_START = 1720;
const SOURCES_STEP = 260;
const COUNT_START = 3000;
const COUNT_END = 7600;

/** Which file section each scan phase is writing. */
const PHASE_SECTION: Record<ScanPhase, number> = {
  idle: -1,
  initializing: 0,
  identity: 0,
  sources: 1,
  matching: 2,
  analysis: 3,
  assembling: 4,
  complete: 5,
  locked: 5,
};

export interface FileSession {
  username: string;
  platform: Platform | null;
  raw: string;
}

/**
 * The file.
 *
 * One record moving through three states — empty intake, scan being
 * written, completed report — with the reference rail running down
 * the margin the whole way. The rail is what makes them one document
 * rather than three screens: its index exists before the scan
 * starts, fills as the scan proceeds, and stands complete beside the
 * report.
 *
 * The layout itself transforms: the measure narrows as the file
 * gains content, so the page tightens around the record.
 */
export function CaseFile({
  session,
  onOpen,
  onClose,
}: {
  session: FileSession | null;
  onOpen: (username: string, platform: Platform | null, raw: string) => void;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const scan = useScanController(session?.username ?? null);
  const { elapsed, events, phase, isRunning, isLocked } = scan;

  const reference = caseReference(session?.username ?? null);
  const openedSources = Math.min(
    sourceCoverage.length,
    Math.max(0, Math.floor((elapsed - SOURCES_START) / SOURCES_STEP) + 1)
  );
  const countProgress = Math.max(
    0,
    Math.min(1, (elapsed - COUNT_START) / (COUNT_END - COUNT_START))
  );

  const reached = session ? PHASE_SECTION[phase] : -1;
  const marks: RailMark[] = FILE_SECTIONS.map((s, i) => ({
    id: s.id,
    label: s.label,
    state: i < reached ? "done" : i === reached ? "active" : "pending",
  }));

  const state = !session ? "intake" : isLocked ? "report" : "scan";

  return (
    <motion.div
      // The measure narrows as the file gains content.
      animate={
        reduced
          ? undefined
          : { maxWidth: state === "intake" ? 920 : state === "scan" ? 1080 : 1000 }
      }
      transition={{ duration: 0.8, ease: motionTokens.ease.enter }}
      style={reduced ? { maxWidth: 1000 } : undefined}
      className="mx-auto w-full px-5 sm:px-8"
    >
      <div className="grid gap-10 lg:grid-cols-[152px_minmax(0,1fr)] lg:gap-14">
        {/* Reference rail — a margin device, desktop only */}
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <ReferenceRail reference={reference} marks={marks} />
          </div>
        </div>

        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            {state === "intake" ? (
              <motion.div
                key="intake"
                exit={reduced ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: motionTokens.duration.base }}
                className="py-10 sm:py-20"
              >
                <FileIntake onOpen={onOpen} />
              </motion.div>
            ) : state === "scan" ? (
              <motion.div
                key="scan"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: motionTokens.duration.base }}
                className="py-10 sm:py-16"
              >
                <ScanSession
                  username={session!.username}
                  platform={session!.platform}
                  phase={phase}
                  events={events}
                  running={isRunning}
                  countProgress={countProgress}
                  openedSources={openedSources}
                  onSkip={scan.skip}
                />
              </motion.div>
            ) : (
              <motion.div
                key="report"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: motionTokens.duration.base }}
                className="py-8 sm:py-14"
              >
                {/* Desktop reads the cover with its pages beneath;
                    a phone reads the file as a sequence of pages. */}
                <div className="hidden sm:block">
                  <ReportCover
                    username={session!.username}
                    platform={session!.platform}
                    reference={reference}
                    onNewScan={onClose}
                  />
                </div>
                <div className="sm:hidden">
                  <MobileReport
                    username={session!.username}
                    platform={session!.platform}
                    reference={reference}
                    onNewScan={onClose}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
