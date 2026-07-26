import { Badge } from "@/components/ui/badge";
import type { TakedownStatus } from "@/lib/demo/scan-data";
import { formatNumber } from "@/lib/utils";

import { takedownMeta, takedownPipeline } from "./workspace-meta";

const STAGE_BODY: Record<TakedownStatus, string> = {
  drafted: "Prepared with the evidence attached, not yet sent.",
  submitted: "Sent to the host or platform that serves the page.",
  acknowledged: "Receipt confirmed, decision pending.",
  removed: "Confirmed gone. The source stays monitored.",
  rejected: "Closed without removal.",
};

const text = {
  rejectedNote:
    "Closed without removal. A new request can be prepared with additional evidence.",
} as const;

/**
 * The route a request travels, as a rail rather than a row of
 * cards: four stops on one line, each carrying its own count, and
 * the one outcome that leaves the line shown apart from it.
 */
export function TakedownsPipeline({
  counts,
}: {
  counts: Record<TakedownStatus, number>;
}) {
  return (
    <div className="rounded-lg border border-edge bg-paper p-4 shadow-hairline sm:p-6">
      <div className="relative">
        <span
          aria-hidden
          className="edge-fade-x absolute left-0 right-0 top-[5px] hidden h-px sm:block"
        />
        <ol className="relative grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 sm:gap-x-6">
          {takedownPipeline.map((status) => {
            const meta = takedownMeta[status];
            return (
              <li key={status} className="min-w-0">
                <span
                  aria-hidden
                  className="block size-[11px] rounded-full border border-edge-strong bg-paper"
                />
                <p className="tabular mt-3 text-2xl font-medium tracking-tight text-ink">
                  {formatNumber(counts[status])}
                </p>
                <div className="mt-2">
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </div>
                <p className="mt-2 max-w-[26ch] text-2xs leading-relaxed text-ink-soft">
                  {STAGE_BODY[status]}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-edge pt-4">
        <Badge variant={takedownMeta.rejected.variant}>
          {takedownMeta.rejected.label}
        </Badge>
        <span className="tabular text-sm font-medium text-ink">
          {formatNumber(counts.rejected)}
        </span>
        <p className="min-w-0 flex-1 text-2xs leading-relaxed text-ink-soft">
          {text.rejectedNote}
        </p>
      </div>
    </div>
  );
}
