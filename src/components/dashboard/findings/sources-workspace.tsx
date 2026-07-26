"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, MoreHorizontal, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

import { PageIntro, Section } from "@/components/dashboard/page-intro";
import { SourceBadge } from "@/components/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routes } from "@/config/navigation";
import { copy } from "@/config/product";
import {
  DEMO_ANCHOR,
  demoMatches,
  sourceActivity,
  sourceCoverage,
} from "@/lib/demo/scan-data";
import type { Confidence, SourceKind } from "@/lib/scan/types";
import { cn, formatRelative } from "@/lib/utils";

import {
  SOURCE_KINDS,
  buildSegments,
  confidenceMeta,
  confidenceRank,
  sourceLabels,
  ProportionBar,
  segmentsSummary,
} from "./shared";

/* Strings this surface needs that the shared copy file doesn't carry. */
const text = {
  description: (sources: number, categories: number) =>
    `${sources} indexed sources across ${categories} categories. Each category below lists the domains that currently hold findings in your review queue — public sources only.`,
  openFindings: "Open findings",

  coverageLabel: "Indexed coverage",
  coverageMeta: (sources: number, categories: number) =>
    `${sources} sources · ${categories} categories`,
  coverageAria: (summary: string) => `Source coverage: ${summary}.`,
  coverageNote:
    "Coverage is what Argus watches. A category can be monitored without holding a finding today.",

  activityLabel: "Recent source activity",
  activityNote: "Last seven days",

  groupMeta: (withFindings: number, indexed: number) =>
    `${withFindings} of ${indexed} indexed sources hold findings in the review queue.`,
  groupMatches: "matches",
  groupEmpty:
    "No findings in the review queue for this category right now. Monitoring continues.",

  matchesOn: "matches",
  lastSeen: "last seen",
  muted: "Muted",
  actionsFor: (domain: string) => `Actions for ${domain}`,
  actionsLabel: "Source actions",
  prepare: "Prepare takedown",
  mute: "Mute this source",
  unmute: "Unmute this source",

  toastPrepared: "Removal request drafted",
  toastPreparedBody: (domain: string) =>
    `Evidence for ${domain} attached. Demo workspace — nothing is sent.`,
  toastMuted: "Source muted",
  toastMutedBody: (domain: string) =>
    `New detections on ${domain} stay in the queue but stop raising alerts.`,
  toastUnmuted: "Source unmuted",
  toastUnmutedBody: (domain: string) => `Alerts resumed for ${domain}.`,
} as const;

interface DomainEntry {
  domainFull: string;
  kind: SourceKind;
  matches: number;
  highest: Confidence;
  lastDetected: string;
}

/** One row per distinct domain, folded from the review queue. */
const DOMAIN_ENTRIES: readonly DomainEntry[] = (() => {
  const byDomain = new Map<string, DomainEntry>();

  for (const match of demoMatches) {
    const existing = byDomain.get(match.domainFull);
    if (!existing) {
      byDomain.set(match.domainFull, {
        domainFull: match.domainFull,
        kind: match.sourceKind,
        matches: 1,
        highest: match.confidence,
        lastDetected: match.detectedAt,
      });
      continue;
    }
    existing.matches += 1;
    if (confidenceRank(match.confidence) > confidenceRank(existing.highest)) {
      existing.highest = match.confidence;
    }
    if (match.detectedAt > existing.lastDetected) {
      existing.lastDetected = match.detectedAt;
    }
  }

  return [...byDomain.values()];
})();

/** The activity feed carries masked domains; the verified owner sees full ones. */
const FULL_DOMAIN_BY_MASK = new Map<string, string>(
  demoMatches.map((match) => [match.domainMasked, match.domainFull] as const)
);

const COVERAGE_TOTAL = sourceCoverage.reduce(
  (total, entry) => total + entry.count,
  0
);

interface SourceGroup {
  kind: SourceKind;
  label: string;
  indexed: number;
  matches: number;
  entries: DomainEntry[];
}

const GROUPS: readonly SourceGroup[] = SOURCE_KINDS.map((kind) => {
  const coverage = sourceCoverage.find((entry) => entry.kind === kind);
  const entries = DOMAIN_ENTRIES.filter((entry) => entry.kind === kind).sort(
    (a, b) =>
      b.matches - a.matches ||
      (a.domainFull < b.domainFull ? -1 : a.domainFull > b.domainFull ? 1 : 0)
  );
  return {
    kind,
    label: sourceLabels[kind],
    indexed: coverage?.count ?? 0,
    matches: entries.reduce((total, entry) => total + entry.matches, 0),
    entries,
  };
});

export function SourcesWorkspace() {
  const [muted, setMuted] = React.useState<ReadonlySet<string>>(
    () => new Set<string>()
  );

  const coverageSegments = React.useMemo(
    () =>
      buildSegments(
        sourceCoverage.map((entry) => ({
          key: entry.kind,
          label: entry.label,
          count: entry.count,
        }))
      ),
    []
  );

  function prepareTakedown(domain: string) {
    toast.success(text.toastPrepared, {
      description: text.toastPreparedBody(domain),
    });
  }

  function toggleMute(domain: string) {
    const willMute = !muted.has(domain);
    setMuted((previous) => {
      const draft = new Set(previous);
      if (willMute) draft.add(domain);
      else draft.delete(domain);
      return draft;
    });
    if (willMute) {
      toast(text.toastMuted, { description: text.toastMutedBody(domain) });
    } else {
      toast(text.toastUnmuted, { description: text.toastUnmutedBody(domain) });
    }
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageIntro
        title={copy.dashboard.sections.sources}
        description={text.description(COVERAGE_TOTAL, sourceCoverage.length)}
        actions={
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="h-11 px-3.5 sm:h-8 sm:px-3"
          >
            <Link href={routes.findings}>{text.openFindings}</Link>
          </Button>
        }
      />

      {/* ── Coverage + movement ───────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 rounded-lg border border-edge bg-paper px-4 py-5 shadow-hairline sm:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-label">{text.coverageLabel}</p>
            <p className="tabular text-2xs text-ink-soft">
              {text.coverageMeta(COVERAGE_TOTAL, sourceCoverage.length)}
            </p>
          </div>

          <ProportionBar
            className="mt-4"
            segments={coverageSegments}
            ariaLabel={text.coverageAria(segmentsSummary(coverageSegments))}
          />

          <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
            {coverageSegments.map((segment) => (
              <li
                key={segment.key}
                className="flex min-w-0 items-center gap-2.5 border-b border-edge-faint pb-2.5 last:border-b-0 sm:border-b-0 sm:pb-0"
              >
                <span
                  aria-hidden
                  className={cn("size-2.5 shrink-0 rounded-xs", segment.tone)}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                  {segment.label}
                </span>
                <span className="tabular text-[13px] font-medium text-ink">
                  {segment.count}
                </span>
                <span className="tabular w-9 shrink-0 text-right text-2xs text-ink-soft">
                  {segment.percent}%
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-5 max-w-[62ch] text-2xs leading-relaxed text-ink-soft">
            {text.coverageNote}
          </p>
        </div>

        <div className="min-w-0 rounded-md border border-edge-faint bg-mineral px-4 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-label">{text.activityLabel}</p>
            <p className="text-2xs text-ink-soft">{text.activityNote}</p>
          </div>

          <ul className="mt-3 divide-y divide-edge-faint">
            {sourceActivity.map((entry) => {
              const domain =
                FULL_DOMAIN_BY_MASK.get(entry.domainMasked) ?? entry.domainMasked;
              return (
                <li key={entry.id} className="min-w-0 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-baseline justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate text-data text-ink">
                      {domain}
                    </span>
                    <span className="shrink-0 text-data text-ink-soft">
                      {formatRelative(entry.at, DEMO_ANCHOR)}
                    </span>
                  </div>
                  <p className="mt-1 text-2xs leading-relaxed text-ink-soft">
                    {entry.event}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ── Per-category domains ──────────────────────────────────── */}
      <div className="space-y-8">
        {GROUPS.map((group) => (
          <Section
            key={group.kind}
            title={group.label}
            description={text.groupMeta(group.entries.length, group.indexed)}
            actions={
              <div className="flex items-center gap-2.5">
                <SourceBadge kind={group.kind} tone="light" />
                <span className="text-2xs text-ink-soft">
                  <span className="tabular">{group.matches}</span>{" "}
                  {text.groupMatches}
                </span>
              </div>
            }
          >
            {group.entries.length === 0 ? (
              <p className="rounded-md border border-dashed border-edge-strong bg-paper/60 px-4 py-5 text-[13px] leading-relaxed text-ink-soft">
                {text.groupEmpty}
              </p>
            ) : (
              <ul className="divide-y divide-edge-faint overflow-hidden rounded-md border border-edge bg-paper">
                {group.entries.map((entry) => {
                  const isMuted = muted.has(entry.domainFull);
                  const conf = confidenceMeta[entry.highest];
                  return (
                    <li
                      key={entry.domainFull}
                      className={cn(
                        "flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 transition-opacity sm:px-4",
                        isMuted && "opacity-55"
                      )}
                    >
                      <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                        <p className="truncate text-data text-ink">
                          {entry.domainFull}
                        </p>
                        <p className="mt-1 text-2xs text-ink-soft">
                          <span className="tabular">{entry.matches}</span>{" "}
                          {text.matchesOn} · {text.lastSeen}{" "}
                          {formatRelative(entry.lastDetected, DEMO_ANCHOR)}
                        </p>
                      </div>

                      <Badge variant={conf.variant}>{conf.label}</Badge>

                      {isMuted ? (
                        <Badge variant="neutral" dot>
                          {text.muted}
                        </Badge>
                      ) : null}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={text.actionsFor(entry.domainFull)}
                            className="ml-auto size-11 sm:size-8"
                          >
                            <MoreHorizontal aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel>
                            {text.actionsLabel}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onSelect={() => prepareTakedown(entry.domainFull)}
                          >
                            <FileText aria-hidden />
                            {text.prepare}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => toggleMute(entry.domainFull)}
                          >
                            {isMuted ? (
                              <Volume2 aria-hidden />
                            ) : (
                              <VolumeX aria-hidden />
                            )}
                            {isMuted ? text.unmute : text.mute}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        ))}
      </div>
    </div>
  );
}
