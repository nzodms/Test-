"use client";

import * as React from "react";
import { timelineFor, type FileEvent, type FileRecord } from "@/lib/demo/files";
import { cn } from "@/lib/utils";
import { Footnote, PanelHead } from "../parts";

/* Stamps a chronology is read by. Kept local so the file's own
   conventions (day + time in the margin, month as a heading) do not
   leak into the rest of the product. */
const dayStamp = (iso: string) =>
  Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(iso));

const timeStamp = (iso: string) =>
  Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(iso));

const monthStamp = (iso: string) =>
  Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));

/**
 * 05 — the chronology.
 *
 * Newest first, on one spine, cut into months. The margin carries the
 * stamp and nothing else; the spine carries what happened. The single
 * accent mark on the panel is the most recent event, which is the
 * only one a reader usually needs to find.
 */
export function TimelinePanel({ file }: { file: FileRecord }) {
  const events = timelineFor(file);

  const months: Array<{ key: string; events: FileEvent[] }> = [];
  for (const e of events) {
    const key = monthStamp(e.at);
    const last = months[months.length - 1];
    if (last && last.key === key) last.events.push(e);
    else months.push({ key, events: [e] });
  }

  let seen = 0;

  return (
    <div>
      <PanelHead
        index="05"
        title="Timeline"
        note="Everything that has happened to this file, newest first."
        aside={
          <p className="font-mono text-[12.5px] tabular text-ink-soft">
            {events.length} entries
          </p>
        }
      />

      {months.map((month) => (
        <section key={month.key} className="mb-2 pt-7 first:pt-0">
          <h3 className="border-b border-edge pb-2 text-[13.5px] text-ink-soft">
            {month.key}
          </h3>
          <ol className="mt-5">
            {month.events.map((e) => {
              const index = seen++;
              const newest = index === 0;
              const last = index === events.length - 1;
              return (
                <li
                  key={e.id}
                  className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-6"
                >
                  <div className="pt-px text-right">
                    <p className="font-mono text-[12.5px] tabular text-ink">
                      {dayStamp(e.at)}
                    </p>
                    <p className="mt-0.5 font-mono text-[12.5px] tabular text-ink-soft">
                      {timeStamp(e.at)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "relative border-l pl-5",
                      last ? "border-transparent pb-0" : "border-edge pb-8"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-[4px] top-[7px] size-[7px] rounded-full",
                        newest ? "bg-accent" : "bg-graphite"
                      )}
                    />
                    <p className="text-[15.5px] text-ink sm:text-[16px]">
                      {e.title}
                    </p>
                    {e.detail ? (
                      <p className="mt-1 max-w-[54ch] text-[14px] leading-relaxed text-ink-soft">
                        {e.detail}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <Footnote>
        {file.monitoring === "paused"
          ? "Nothing further is recorded on this file until ownership is verified."
          : `Monitoring active — the next ${
              file.monitoring === "daily" ? "daily" : "weekly"
            } comparison is added to this chronology as soon as it completes.`}
      </Footnote>
    </div>
  );
}
