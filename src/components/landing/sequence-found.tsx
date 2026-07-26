import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { SourceBadge } from "@/components/primitives";
import { AbstractThumb } from "@/components/scanner/abstract-thumb";
import { Reveal } from "@/components/motion/reveal";
import { copy } from "@/config/product";
import { featuredMatches, DEMO_ANCHOR, demoMatches } from "@/lib/demo/scan-data";
import { formatDateTimeUTC, formatRelative } from "@/lib/utils";

/**
 * Sequence 1 — the anatomy of a finding.
 *
 * Rather than describing classification, this takes one real result
 * and opens it up: each axis the system grades is shown with its
 * actual value for this finding, connected back to the tile.
 */
export function SequenceFound() {
  const match = featuredMatches[0]!;

  // Occurrences on the same domain, derived — not asserted.
  const previous = demoMatches.filter(
    (m) => m.domainFull === match.domainFull
  ).length;

  const axes = [
    {
      label: "Confidence level",
      value: `${match.confidenceScore} / 100 · High`,
      note: "Graded from visual similarity, metadata and posting patterns.",
    },
    {
      label: "Source type",
      value: "Public website",
      note: "Categorised so takedown routes and response times are known upfront.",
    },
    {
      label: "Detection date",
      value: `${formatDateTimeUTC(match.detectedAt)} UTC`,
      note: "Recorded at detection, not at review — the clock starts immediately.",
    },
    {
      label: "Previous occurrences",
      value:
        previous > 1
          ? `${previous} on this domain`
          : "First occurrence on this domain",
      note: "Repeat sources are ranked higher; recurrence is treated as one case.",
    },
    {
      label: "Monitoring status",
      value: "Watched · re-checked weekly",
      note: "The source stays under observation after any action is taken.",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-[1560px] px-4 py-24 sm:px-8 sm:py-32">
      <Reveal className="max-w-2xl">
        <p className="text-label text-accent">{copy.sequences.found.label}</p>
        <h2 className="text-display mt-4 text-[26px] text-ink sm:text-[32px]">
          {copy.sequences.found.title}
        </h2>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
          {copy.sequences.found.body}
        </p>
      </Reveal>

      <Reveal delay={0.08} className="mt-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-16">
          {/* The finding itself */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-lg border border-edge bg-paper p-4 shadow-lift">
              <AbstractThumb
                seed={match.thumbSeed}
                className="aspect-[4/3] w-full"
              />
              <p className="mt-3.5 truncate text-data text-ink">
                {match.domainMasked}
              </p>
              <p className="mt-1 text-[13px] text-ink-soft">
                {match.matchType}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="warn">High confidence</Badge>
                <SourceBadge kind={match.sourceKind} tone="light" />
              </div>
              <p className="mt-3 border-t border-edge-faint pt-3 text-2xs text-ink-soft">
                Detected {formatRelative(match.detectedAt, DEMO_ANCHOR)} ·
                preview shown as an abstract placeholder
              </p>
            </div>
          </div>

          {/* Its graded axes */}
          <dl className="divide-y divide-edge">
            {axes.map((axis, i) => (
              <div
                key={axis.label}
                className="grid gap-1 py-5 first:pt-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8"
              >
                <dt className="flex items-baseline gap-2.5">
                  <span className="text-data text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[13px] font-medium text-ink-soft">
                    {axis.label}
                  </span>
                </dt>
                <dd>
                  <p className="text-[15px] text-ink">{axis.value}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    {axis.note}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </section>
  );
}
