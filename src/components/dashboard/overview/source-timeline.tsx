import { Section } from "@/components/dashboard/page-intro";
import { SourceBadge } from "@/components/primitives";
import { DEMO_ANCHOR, sourceActivity } from "@/lib/demo/scan-data";
import { cn, formatRelative } from "@/lib/utils";

const text = {
  title: "Recent source activity",
  description: "Changes observed on the sources being watched.",
} as const;

/**
 * How each event reads: a removal confirmed is good news, a
 * recurrence is not. Mapped explicitly so the dot never guesses.
 */
const EVENT_TONE: Record<string, string> = {
  "SA-1": "bg-warn",
  "SA-2": "bg-ok",
  "SA-3": "bg-warn",
  "SA-4": "bg-ink-faint",
  "SA-5": "bg-crit",
};

/** Newest first — ISO strings sort chronologically as plain text. */
const entries = [...sourceActivity].sort((a, b) => b.at.localeCompare(a.at));

/**
 * A quiet ledger of source-level events. These are observations
 * about a source rather than a finding, so the domain stays in its
 * masked form here.
 */
export function SourceTimeline() {
  return (
    <Section title={text.title} description={text.description}>
      <ol className="relative">
        <span
          aria-hidden
          className="absolute bottom-2 left-[3px] top-2 w-px bg-edge"
        />

        {entries.map((entry) => (
          <li key={entry.id} className="relative flex gap-3.5 pb-5 last:pb-0">
            <span
              aria-hidden
              className={cn(
                "relative z-10 mt-[7px] size-[7px] shrink-0 rounded-full ring-4 ring-canvas",
                EVENT_TONE[entry.id] ?? "bg-ink-faint"
              )}
            />

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <span className="min-w-0 truncate text-data text-ink">
                  {entry.domainMasked}
                </span>
                <span className="hidden shrink-0 sm:inline-flex">
                  <SourceBadge kind={entry.sourceKind} tone="light" />
                </span>
                <span className="shrink-0 text-2xs text-ink-soft">
                  {formatRelative(entry.at, DEMO_ANCHOR)}
                </span>
              </div>

              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                {entry.event}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
