import { RotateCcw } from "lucide-react";

import { SourceBadge } from "@/components/primitives";
import { EmptyState } from "@/components/ui/states";
import { DEMO_ANCHOR, demoMatches } from "@/lib/demo/scan-data";
import { formatRelative } from "@/lib/utils";

import { sourceLabels } from "./workspace-meta";

const LIMIT = 4;

const tracked = demoMatches.filter((match) => match.state === "review").slice(0, LIMIT);

const text = {
  emptyTitle: "Nothing recurring",
  emptyBody:
    "No monitored content has reappeared on a source since the last pass.",
  seen: "Last seen",
} as const;

/**
 * Sources that put the same content back after action was taken.
 * The domain is shown in full: inside the workspace the owner is
 * verified, so nothing here is masked.
 */
export function MonitoringRecurrences() {
  if (tracked.length === 0) {
    return (
      <EmptyState
        icon={RotateCcw}
        title={text.emptyTitle}
        description={text.emptyBody}
      />
    );
  }

  return (
    <ul className="divide-y divide-edge-faint border-y border-edge">
      {tracked.map((match, index) => (
        <li key={match.id} className="flex items-start gap-3 py-3.5 sm:gap-4">
          <span aria-hidden className="text-data pt-0.5 text-ink-faint">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <span className="text-data max-w-full truncate text-ink">
                {match.domainFull}
              </span>
              <SourceBadge kind={match.sourceKind} tone="light" />
            </div>
            <p className="mt-1.5 text-2xs leading-relaxed text-ink-soft">
              {match.matchType} · {sourceLabels[match.sourceKind]}
            </p>
          </div>

          <span className="shrink-0 text-2xs text-ink-soft">
            {text.seen} {formatRelative(match.detectedAt, DEMO_ANCHOR)}
          </span>
        </li>
      ))}
    </ul>
  );
}
