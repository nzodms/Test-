"use client";

import * as React from "react";
import { RedactedDomain } from "@/components/file/redacted";
import {
  actionsFor,
  type ActionState,
  type FileAction,
  type FileRecord,
} from "@/lib/demo/files";
import { DEMO_ANCHOR } from "@/lib/demo/scan-data";
import { cn, formatDateUTC } from "@/lib/utils";
import {
  Figure,
  Footnote,
  Jump,
  PanelHead,
  SubHead,
  type OpenSection,
} from "../parts";

/* The pipeline a request travels. Declined sits outside it: it is an
   exception to work, not a stage to wait in. */
const STAGES: Array<{ id: ActionState; label: string; note: string }> = [
  { id: "drafted", label: "Drafted", note: "Ready to send" },
  { id: "sent", label: "Sent", note: "Awaiting a response" },
  { id: "acknowledged", label: "Acknowledged", note: "Removal promised" },
  { id: "removed", label: "Removed", note: "Confirmed gone" },
];

function daysSince(iso: string): number {
  return Math.max(
    1,
    Math.round(
      (new Date(DEMO_ANCHOR).getTime() - new Date(iso).getTime()) / 86_400_000
    )
  );
}

function nextStep(a: FileAction): { label: string; tone: string } {
  switch (a.state) {
    case "drafted":
      return { label: "Ready to send", tone: "text-ink" };
    case "sent":
      return {
        label: a.sentAt
          ? `Awaiting response · day ${daysSince(a.sentAt)}`
          : "Awaiting response",
        tone: "text-ink-soft",
      };
    case "acknowledged":
      return { label: "Verifying removal", tone: "text-ink-soft" };
    case "removed":
      return { label: "Closed", tone: "text-ok" };
    case "declined":
      return { label: "Escalate to the host", tone: "text-warn" };
  }
}

/**
 * 06 — the pipeline.
 *
 * A removal request has one life: drafted, sent, acknowledged,
 * removed. The rail across the top is that life with the file's
 * requests counted into it; the groups beneath are the same requests,
 * standing in the stage they have reached.
 */
export function ActionsPanel({
  file,
  onOpenSection,
}: {
  file: FileRecord;
  onOpenSection: OpenSection;
}) {
  const actions = actionsFor(file);
  const declined = actions.filter((a) => a.state === "declined");
  const counts = STAGES.map(
    (s) => actions.filter((a) => a.state === s.id).length
  );

  return (
    <div>
      <PanelHead
        index="06"
        title="Removal actions"
        note="Requests raised against the sources carrying confirmed findings, and where each one has got to."
        aside={
          <p className="font-mono text-[12.5px] tabular text-ink-soft">
            {actions.length} requests
          </p>
        }
      />

      {actions.length === 0 ? (
        <div className="border-t border-edge pt-7">
          <p className="max-w-[46ch] text-[16px] leading-relaxed text-ink">
            No removal request is open on this file. A request is raised the
            moment a finding is confirmed as yours.
          </p>
          <div className="mt-3">
            <Jump onClick={() => onOpenSection("findings")}>
              Review findings
            </Jump>
          </div>
        </div>
      ) : (
        <>
          {/* ── The rail ────────────────────────────────────────────── */}
          <ol className="sm:flex sm:gap-6">
            {STAGES.map((s, i) => (
              <li
                key={s.id}
                className={cn(
                  "flex items-baseline justify-between gap-4 border-t border-edge py-3.5",
                  "sm:relative sm:block sm:flex-1 sm:border-t-0 sm:pt-6"
                )}
              >
                {i < STAGES.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute left-0 top-[3px] hidden h-px w-[calc(100%+1.5rem)] bg-edge sm:block"
                  />
                ) : null}
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-0 hidden size-[7px] rounded-full sm:block",
                    (counts[i] ?? 0) > 0 ? "bg-graphite" : "bg-mineral-deep"
                  )}
                />
                <p className="order-2 sm:order-none">
                  <Figure
                    value={counts[i] ?? 0}
                    tone={(counts[i] ?? 0) > 0 ? "ink" : "faint"}
                    className="text-[26px] sm:text-[30px]"
                  />
                </p>
                <div className="order-1 min-w-0 sm:order-none sm:mt-2">
                  <p className="text-[14.5px] text-ink">{s.label}</p>
                  <p className="mt-0.5 text-[13.5px] text-ink-soft">{s.note}</p>
                </div>
              </li>
            ))}
          </ol>

          {declined.length > 0 ? (
            <p className="mt-5 border-t border-edge pt-4 text-[14.5px] text-warn">
              <span className="tabular">{declined.length}</span> request
              {declined.length === 1 ? " was" : "s were"} declined and can be
              escalated to the host or the registrar.
            </p>
          ) : null}

          {/* ── The requests, standing in their stage ───────────────── */}
          <div className="mt-11 space-y-10">
            {[...STAGES.map((s) => s.id), "declined" as ActionState].map(
              (stage) => {
                const group = actions.filter((a) => a.state === stage);
                if (group.length === 0) return null;
                const label =
                  STAGES.find((s) => s.id === stage)?.label ?? "Declined";
                return (
                  <section key={stage}>
                    <SubHead title={label} count={group.length} />
                    <ol className="mt-3">
                      {group.map((a) => {
                        const step = nextStep(a);
                        return (
                          <li
                            key={a.id}
                            className="grid grid-cols-[minmax(0,1fr)] gap-x-8 border-t border-edge py-4 sm:grid-cols-[minmax(0,1fr)_auto]"
                          >
                            <div className="min-w-0">
                              <RedactedDomain
                                head={a.redaction.head}
                                tail={a.redaction.tail}
                                hiddenChars={a.redaction.hidden}
                                className="text-[15px] text-ink"
                              />
                              <p className="mt-1.5 text-[13.5px] text-ink-soft">
                                {a.route}
                                <span className="px-2 text-ink-faint">·</span>
                                {a.sentAt
                                  ? `Sent ${formatDateUTC(a.sentAt)}`
                                  : "Not sent yet"}
                              </p>
                            </div>
                            <p
                              className={cn(
                                "mt-2 text-[14px] sm:mt-0 sm:text-right",
                                step.tone
                              )}
                            >
                              {step.label}
                            </p>
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                );
              }
            )}
          </div>
        </>
      )}

      <Footnote>
        Argus prepares and sends the request; whether the source complies is
        outside its control. A declined request can be escalated to the host
        or the registrar without opening a new file.
      </Footnote>
    </div>
  );
}
