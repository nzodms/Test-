"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ReportPage, VerificationSeal } from "@/components/file/file-parts";
import { exposureLabels, type FileRecord } from "@/lib/demo/files";
import { DEMO_ANCHOR } from "@/lib/demo/scan-data";
import { motionTokens } from "@/lib/motion";
import { formatRelative } from "@/lib/utils";
import { LibraryReturn } from "./chrome";
import { FileIndex, type IndexTab } from "./file-index";
import { FILE_SECTIONS, type SectionId } from "./parts";
import { ProfilePanel } from "./panels/profile";
import { StatusPanel } from "./panels/status";
import { FindingsPanel } from "./panels/findings";
import { SourcesPanel } from "./panels/sources";
import { TimelinePanel } from "./panels/timeline";
import { ActionsPanel } from "./panels/actions";

/**
 * One profile file, open.
 *
 * The whole internal product is this object: a record with an index
 * along its top and pages underneath, parts of it sealed until the
 * profile's owner is verified. Each page answers a different kind of
 * question — what is this, how bad is it, what needs deciding, where
 * is it, what has happened, what is being done — so no two pages are
 * built the same way.
 */
export function ProfileFile({ file }: { file: FileRecord }) {
  const reduced = useReducedMotion();
  const [section, setSection] = React.useState<SectionId>("profile");

  const tabs: IndexTab[] = FILE_SECTIONS.map((s) => ({
    id: s.id,
    label: s.label,
    locked: s.sealable && !file.verified,
  }));

  /* Defence in depth: a sealed section is never resolved to a panel,
     so its contents are never built into the document even if the
     open section were forced to it. */
  const openable = tabs.find((t) => t.id === section && !t.locked)
    ? section
    : "profile";

  /* Which way through the index the reader is moving. Recorded at the
     moment of the move, so the page can enter from the side it came
     from rather than fading in place. */
  const at = FILE_SECTIONS.findIndex((s) => s.id === openable);
  const [direction, setDirection] = React.useState(1);

  const open = React.useCallback(
    (id: SectionId) => {
      const next = FILE_SECTIONS.findIndex((s) => s.id === id);
      setDirection(next >= at ? 1 : -1);
      setSection(id);
    },
    [at]
  );

  const facts: string[] = file.verified
    ? [
        `${exposureLabels[file.exposure]} exposure`,
        `${file.findings} findings`,
        ...(file.awaitingReview > 0
          ? [`${file.awaitingReview} awaiting a decision`]
          : []),
        `compared ${formatRelative(file.lastScan, DEMO_ANCHOR)}`,
      ]
    : [
        "Sealed",
        `${file.findings} findings held`,
        `opened ${formatRelative(file.opened, DEMO_ANCHOR)}`,
      ];

  return (
    <div>
      <LibraryReturn />

      {/* ── The head of the file ──────────────────────────────────── */}
      <header className="mt-5 flex flex-wrap items-start justify-between gap-x-10 gap-y-5 sm:mt-7">
        <div className="min-w-0">
          <p className="font-mono text-[12.5px] tabular tracking-[0.04em] text-ink-soft">
            {file.ref}
          </p>
          <h1 className="text-display mt-2.5 text-[36px] text-ink sm:text-[50px]">
            @{file.username}
          </h1>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft sm:text-[15px]">
            {file.platform}
            {facts.map((f) => (
              <React.Fragment key={f}>
                <span className="px-2 text-ink-faint">·</span>
                <span className="tabular">{f}</span>
              </React.Fragment>
            ))}
          </p>
        </div>
        <VerificationSeal
          state={file.verified ? "verified" : "required"}
          className="shrink-0"
        />
      </header>

      <FileIndex
        tabs={tabs}
        active={openable}
        onSelect={open}
        className="mt-8 sm:mt-10"
      />

      <ReportPage className="mt-3 min-h-[460px] px-5 py-8 sm:-mt-px sm:min-h-[560px] sm:px-10 sm:py-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={openable}
            id={`file-panel-${openable}`}
            role="tabpanel"
            aria-labelledby={`file-tab-${openable}`}
            tabIndex={0}
            initial={reduced ? false : { opacity: 0, x: direction * 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: direction * -8 }}
            transition={{
              duration: motionTokens.duration.base,
              ease: motionTokens.ease.enter,
            }}
            className="outline-offset-8"
          >
            {openable === "profile" ? (
              <ProfilePanel file={file} onOpenSection={open} />
            ) : openable === "status" ? (
              <StatusPanel file={file} onOpenSection={open} />
            ) : openable === "findings" ? (
              <FindingsPanel file={file} />
            ) : openable === "sources" ? (
              <SourcesPanel file={file} />
            ) : openable === "timeline" ? (
              <TimelinePanel file={file} />
            ) : (
              <ActionsPanel file={file} onOpenSection={open} />
            )}
          </motion.div>
        </AnimatePresence>
      </ReportPage>
    </div>
  );
}
