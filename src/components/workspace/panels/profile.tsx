"use client";

import * as React from "react";
import type { FileRecord } from "@/lib/demo/files";
import { DEMO_ANCHOR } from "@/lib/demo/scan-data";
import { formatLongDateUTC, formatRelative } from "@/lib/utils";
import { Field, Footnote, Jump, PanelHead, type OpenSection } from "../parts";
import { SealNotice } from "./seal";

const cadence: Record<FileRecord["monitoring"], string> = {
  daily: "Daily comparison",
  weekly: "Weekly comparison",
  paused: "Paused until verification",
};

/**
 * 01 — the record itself.
 *
 * The standing of the file is read first, because it is the one
 * sentence that says what to do next. Everything under it is the
 * identity of the record: who it belongs to, what it covers, how
 * often it is compared.
 */
export function ProfilePanel({
  file,
  onOpenSection,
}: {
  file: FileRecord;
  onOpenSection: OpenSection;
}) {
  return (
    <div>
      <PanelHead
        index="01"
        title="Profile file"
        note="What this file covers, who it belongs to, and the terms it is monitored under."
      />

      <p className="max-w-[52ch] text-[17px] leading-[1.5] text-ink sm:text-[19px]">
        {file.standing}
      </p>

      {file.verified ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-1">
          <Jump onClick={() => onOpenSection("findings")}>Review findings</Jump>
          <Jump onClick={() => onOpenSection("actions")}>
            Removal actions
          </Jump>
        </div>
      ) : null}

      <dl className="mt-9 grid gap-x-12 sm:grid-cols-2">
        <Field label="Public profile" value={`@${file.username}`} />
        <Field label="Platform" value={file.platform} />
        <Field label="Account holder" value={file.owner} />
        <Field label="File reference" value={file.ref} mono />
        <Field label="Opened" value={formatLongDateUTC(file.opened)} />
        <Field
          label="Last comparison"
          value={
            <>
              {formatLongDateUTC(file.lastScan)}
              <span className="px-2 text-ink-faint">·</span>
              <span className="text-ink-soft">
                {formatRelative(file.lastScan, DEMO_ANCHOR)}
              </span>
            </>
          }
        />
        <Field label="Monitoring" value={cadence[file.monitoring]} />
        <Field label="Scope" value="Indexed public sources only" />
      </dl>

      {file.verified ? (
        <Footnote>
          Argus compares this profile against sources that are already
          indexed and publicly reachable. Nothing behind a login, a paywall
          or a private account is ever read.
        </Footnote>
      ) : (
        <SealNotice file={file} />
      )}
    </div>
  );
}
