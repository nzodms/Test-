"use client";

import * as React from "react";
import { RedactedDomain } from "@/components/file/redacted";
import { findingsFor, sourcesFor, type FileRecord } from "@/lib/demo/files";
import { DEMO_ANCHOR } from "@/lib/demo/scan-data";
import { cn, formatRelative } from "@/lib/utils";
import { Figure, Footnote, PanelHead, SubHead } from "../parts";

/* One ink, five weights — a coverage bar has to be decodable in
   greyscale, and five hues would turn the panel into a chart legend. */
const SHADE = [
  "bg-ink/85",
  "bg-ink/62",
  "bg-ink/44",
  "bg-ink/28",
  "bg-ink/16",
] as const;

/** Hand an allowance out along a list, widest kinds first. */
function spread(counts: number[], allowance: number): number[] {
  const out: number[] = [];
  let left = allowance;
  for (let i = 0; i < counts.length; i++) {
    const take = Math.min(left, Math.min(counts[i] ?? 0, i === 0 ? 2 : 1));
    out.push(take);
    left -= take;
  }
  return out;
}

/**
 * 04 — the coverage surface.
 *
 * Not a table of sources: a picture of where this profile has spread.
 * The proportion is read once, across the top; underneath, each kind
 * of source carries what it holds, what has come off, and what came
 * back. The chronology at the foot is what changed recently.
 */
export function SourcesPanel({ file }: { file: FileRecord }) {
  const sources = sourcesFor(file);
  const findings = findingsFor(file);
  const total = sources.reduce((a, s) => a + s.count, 0) || 1;
  const recurring = sources.reduce((a, s) => a + s.recurring, 0);

  /* New sources this week, spread across the widest kinds first. */
  const fresh = spread(
    sources.map((s) => s.count),
    file.newFindings > 0 ? Math.max(1, Math.round(file.newFindings / 8)) : 0
  );
  const newSources = fresh.reduce((a, n) => a + n, 0);

  const events = findings
    .slice(0, 5)
    .map((m, i) => ({
      id: `${m.id}-${i}`,
      redaction: m.redaction,
      at: m.detectedAt,
      ...ACTIVITY[i % ACTIVITY.length]!,
    }))
    .sort((a, b) => (a.at < b.at ? 1 : -1));

  return (
    <div>
      <PanelHead
        index="04"
        title="Indexed public sources"
        note="Every source already indexed and publicly reachable that carries a finding against this profile."
      />

      {/* ── Coverage, read once ───────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-x-12 gap-y-6">
        <p>
          <Figure value={file.sources} className="text-[52px] sm:text-[60px]" />
          <span className="mt-2 block max-w-[24ch] text-[14.5px] leading-relaxed text-ink-soft">
            sources carry this profile
          </span>
        </p>
        <dl className="flex gap-x-10 gap-y-4 pb-1">
          <div>
            <dd>
              <Figure
                value={newSources}
                tone={newSources > 0 ? "warn" : "ink"}
                className="text-[26px]"
              />
            </dd>
            <dt className="mt-1.5 text-[13.5px] text-ink-soft">new this week</dt>
          </div>
          <div>
            <dd>
              <Figure
                value={recurring}
                tone={recurring > 0 ? "warn" : "ink"}
                className="text-[26px]"
              />
            </dd>
            <dt className="mt-1.5 text-[13.5px] text-ink-soft">
              recurring after removal
            </dt>
          </div>
        </dl>
      </div>

      <div
        aria-hidden
        className="mt-7 flex h-2.5 w-full gap-[2px] overflow-hidden rounded-[2px]"
      >
        {sources.map((s, i) => (
          <span
            key={s.kind}
            className={SHADE[i % SHADE.length]}
            style={{ flexGrow: s.count, flexBasis: 0 }}
          />
        ))}
      </div>

      {/* ── What each kind holds ──────────────────────────────────── */}
      <dl className="mt-7">
        {sources.map((s, i) => {
          const share = Math.max(1, Math.round((file.findings * s.count) / total));
          return (
            <div
              key={s.kind}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-5 border-t border-edge py-4"
            >
              <div className="min-w-0">
                <dt className="flex items-baseline gap-2.5 text-[15.5px] text-ink">
                  <span
                    aria-hidden
                    className={cn(
                      "size-2 shrink-0 translate-y-[-1px] rounded-[1px]",
                      SHADE[i % SHADE.length]
                    )}
                  />
                  {s.label}
                </dt>
                <p className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[13.5px] text-ink-soft">
                  <span className="tabular">{share} findings</span>
                  {s.removed > 0 ? (
                    <span className="tabular text-ok">{s.removed} removed</span>
                  ) : null}
                  {s.recurring > 0 ? (
                    <span className="tabular text-warn">
                      {s.recurring} recurring
                    </span>
                  ) : null}
                  {(fresh[i] ?? 0) > 0 ? (
                    <span className="tabular">{fresh[i]} new this week</span>
                  ) : null}
                </p>
              </div>
              <dd>
                <Figure value={s.count} className="text-[21px] sm:text-[23px]" />
              </dd>
            </div>
          );
        })}
      </dl>

      {/* ── What changed lately ───────────────────────────────────── */}
      <div className="mt-11">
        <SubHead title="Recent activity" count={events.length} />
        <ol className="mt-4">
          {events.map((e) => (
            <li
              key={e.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-5 border-t border-edge py-3.5"
            >
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[14.5px]",
                    e.tone === "warn"
                      ? "text-warn"
                      : e.tone === "ok"
                        ? "text-ok"
                        : "text-ink"
                  )}
                >
                  {e.event}
                </p>
                <RedactedDomain
                  head={e.redaction.head}
                  tail={e.redaction.tail}
                  hiddenChars={e.redaction.hidden}
                  className="mt-1 text-[13px] text-ink-soft"
                />
              </div>
              <span className="font-mono text-[12.5px] tabular text-ink-soft">
                {formatRelative(e.at, DEMO_ANCHOR)}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <Footnote>
        A recurrence means the same material reappeared on a source after it
        had been removed. Those sources stay under closer comparison, and
        their next request goes to the host rather than the page.
      </Footnote>
    </div>
  );
}

const ACTIVITY: Array<{ event: string; tone: "ink" | "warn" | "ok" }> = [
  { event: "New source detected", tone: "warn" },
  { event: "3 new findings indexed", tone: "ink" },
  { event: "Recurrence after removal", tone: "warn" },
  { event: "Content confirmed removed", tone: "ok" },
  { event: "Thread updated with reposts", tone: "ink" },
];
