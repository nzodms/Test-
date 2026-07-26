"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RedactedDomain } from "@/components/file/redacted";
import { findingsFor, type FileRecord } from "@/lib/demo/files";
import { motionTokens } from "@/lib/motion";
import { cn, formatDateUTC } from "@/lib/utils";
import {
  ConfidenceMark,
  Figure,
  Footnote,
  PanelHead,
  confidenceWords,
} from "../parts";

type Decision = "confirmed" | "dismissed";

/**
 * 03 — the review queue.
 *
 * A queue, not a table: every entry carries the one thing the reader
 * has to do with it, on the right, at the end of the line. Confidence
 * sits in the margin as a figure so the column can be scanned
 * vertically, and the only colour on the panel is the warm one, used
 * where something is waiting on a person.
 */
export function FindingsPanel({ file }: { file: FileRecord }) {
  const reduced = useReducedMotion();
  const findings = findingsFor(file);
  const queueable = findings.filter((m) => m.state === "review");

  const [decisions, setDecisions] = React.useState<Record<string, Decision>>({});
  const [view, setView] = React.useState<"open" | "all">(
    queueable.length > 0 ? "open" : "all"
  );

  const settled = Object.keys(decisions).length;
  const pending = Math.max(0, file.awaitingReview - settled);
  const rows = view === "open" ? queueable : findings;

  function decide(key: string, decision: Decision) {
    setDecisions((d) => ({ ...d, [key]: decision }));
  }

  return (
    <div>
      <PanelHead
        index="03"
        title="Findings"
        note="One entry per detection on an indexed public source. The figure in the margin is the match confidence, from 0 to 100."
        aside={
          <p className="font-mono text-[12.5px] tabular text-ink-soft">
            {rows.length} of {file.findings}
          </p>
        }
      />

      {/* ── What is waiting, and which cut is open ─────────────────── */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-edge-strong">
        <div className="flex gap-6">
          {queueable.length > 0 ? (
            <QueueTab
              active={view === "open"}
              onClick={() => setView("open")}
              label="Needs a decision"
              count={queueable.length}
            />
          ) : null}
          <QueueTab
            active={view === "all"}
            onClick={() => setView("all")}
            label="All findings"
            count={findings.length}
          />
        </div>

        <p className="pb-3 text-[14px] text-ink-soft">
          {pending > 0 ? (
            <>
              <span className="tabular font-medium text-warn">{pending}</span>{" "}
              waiting on you across the file
            </>
          ) : (
            "Nothing on this file is waiting on you"
          )}
        </p>
      </div>

      <ol>
        {rows.map((m) => {
          /* Keyed by the finding itself, so a decision survives a
             switch between the two cuts of the queue. */
          const key = m.id;
          const decision = decisions[key];
          const open = m.state === "review" && !decision;

          return (
            <li
              key={key}
              className={cn(
                "grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 border-t border-edge py-4",
                "transition-opacity duration-300 sm:grid-cols-[4rem_minmax(0,1fr)_minmax(0,13.5rem)] sm:gap-x-8 sm:py-5",
                decision ? "opacity-60" : "opacity-100"
              )}
            >
              {/* margin: how sure the match is */}
              <div className="pt-0.5">
                <Figure
                  value={m.confidenceScore}
                  tone={m.confidence === "high" ? "warn" : "ink"}
                  className="text-[19px]"
                />
                <ConfidenceMark level={m.confidence} className="mt-2" />
              </div>

              {/* the finding */}
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[15.5px] text-ink sm:text-[16.5px]",
                    open && "text-subject"
                  )}
                >
                  {m.matchType}
                </p>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
                  <RedactedDomain
                    head={m.redaction.head}
                    tail={m.redaction.tail}
                    hiddenChars={m.redaction.hidden}
                    className="text-[13px] text-ink-soft"
                  />
                  <span className="text-[13.5px] text-ink-soft">
                    {confidenceWords[m.confidence]}
                  </span>
                  <span className="font-mono text-[12.5px] tabular text-ink-soft">
                    {formatDateUTC(m.detectedAt)}
                  </span>
                </div>
              </div>

              {/* what happens to it next */}
              <div className="col-start-2 mt-3 sm:col-start-3 sm:mt-0 sm:flex sm:justify-end">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={open ? "open" : (decision ?? m.state)}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduced ? undefined : { opacity: 0 }}
                    transition={{
                      duration: motionTokens.duration.fast,
                      ease: motionTokens.ease.standard,
                    }}
                    className="sm:text-right"
                  >
                    {open ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decide(key, "confirmed")}
                          className="h-11 rounded-[3px] bg-ink px-4 text-[14px] text-page transition-colors duration-150 hover:bg-graphite sm:h-9"
                        >
                          This is mine
                        </button>
                        <button
                          type="button"
                          onClick={() => decide(key, "dismissed")}
                          className="h-11 rounded-[3px] border border-edge-strong px-4 text-[14px] text-ink-soft transition-colors duration-150 hover:text-ink sm:h-9"
                        >
                          Not mine
                        </button>
                      </div>
                    ) : (
                      <NextStep state={decision ?? m.state} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ol>

      {rows.length === 0 ? (
        <p className="border-t border-edge py-10 text-[15px] text-ink-soft">
          Every finding on this file has been decided.
        </p>
      ) : null}

      <Footnote>
        Source addresses are shown in part. The full address sits on the
        evidence page of each finding and is never published outside this
        file.
      </Footnote>
    </div>
  );
}

/* ── The two cuts of the queue ─────────────────────────────────── */

function QueueTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "-mb-px flex min-h-[44px] items-baseline gap-2 border-b-2 pb-3 pt-2 text-[14.5px] transition-colors duration-150 sm:min-h-0",
        active
          ? "border-ink text-ink"
          : "border-transparent text-ink-soft hover:text-ink"
      )}
    >
      {label}
      <span className="font-mono text-[12.5px] tabular text-ink-soft">
        {count}
      </span>
    </button>
  );
}

/* ── The state a finding rests in ──────────────────────────────── */

function NextStep({
  state,
}: {
  state: Decision | "possible" | "review" | "confirmed";
}) {
  if (state === "confirmed")
    return (
      <span className="text-[14px] text-ok">Confirmed — removal queued</span>
    );
  if (state === "dismissed")
    return (
      <span className="text-[14px] text-ink-faint">
        Dismissed — not this creator
      </span>
    );
  if (state === "review")
    return <span className="text-[14px] text-ink-soft">Held for review</span>;
  return <span className="text-[14px] text-ink-soft">Monitoring</span>;
}
