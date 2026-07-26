import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Section } from "@/components/dashboard/page-intro";
import { SourceBadge } from "@/components/primitives";
import { EvidenceBlock } from "@/components/file/evidence-block";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/navigation";
import { DEMO_ANCHOR, demoMatches } from "@/lib/demo/scan-data";
import { formatRelative } from "@/lib/utils";

import { confidenceMeta } from "./conventions";

const text = {
  title: "Recent detections",
  description: "The newest results waiting on a decision.",
  viewAll: "View all findings",
} as const;

const RECENT_COUNT = 6;

/** ISO strings sort chronologically as plain text — no clock read. */
const recent = [...demoMatches]
  .sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))
  .slice(0, RECENT_COUNT);

/**
 * Rich rows, not cards: preview, source, what was matched, how
 * confident, and when. The workspace owner is verified, so full
 * domains are legible here.
 */
export function RecentDetections() {
  return (
    <Section
      title={text.title}
      description={text.description}
      actions={
        <Link
          href={routes.findings}
          className="group inline-flex min-h-[44px] items-center gap-1.5 rounded-xs text-[13px] text-ink-soft transition-colors hover:text-ink sm:min-h-0"
        >
          {text.viewAll}
          <ChevronRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      }
    >
      <ul className="surface-paper divide-y divide-edge-faint overflow-hidden rounded-lg">
        {recent.map((match) => {
          const meta = confidenceMeta[match.confidence];
          return (
            <li key={match.id}>
              <Link
                href={routes.findings}
                className="flex min-h-[60px] items-center gap-3 px-3 py-3 transition-colors hover:bg-mineral/60 sm:gap-4 sm:px-5"
              >
                <EvidenceBlock
                  seed={match.thumbSeed}
                  className="size-10 shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-data text-ink">
                    {match.domainFull}
                  </p>
                  <div className="mt-1 flex min-w-0 items-center gap-2">
                    <span className="hidden shrink-0 sm:inline-flex">
                      <SourceBadge kind={match.sourceKind} />
                    </span>
                    <span className="truncate text-[13px] text-ink-soft">
                      {match.matchType}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                  <span className="text-data text-ink-soft">
                    {formatRelative(match.detectedAt, DEMO_ANCHOR)}
                  </span>
                </div>

                <ChevronRight
                  className="hidden size-4 shrink-0 text-ink-faint sm:block"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
