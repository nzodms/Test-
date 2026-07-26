"use client";

import * as React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEMO_ANCHOR, demoMatches } from "@/lib/demo/scan-data";
import type { DemoTakedown } from "@/lib/demo/scan-data";
import { formatDateTimeUTC, formatRelative } from "@/lib/utils";

import { confidenceMeta, sourceLabels, takedownMeta } from "./workspace-meta";

const text = {
  title: "Removal request",
  description: "The request as it was prepared, with the evidence it cites.",
  reference: "Reference",
  target: "Target domain",
  category: "Source category",
  detected: "Detection date",
  confidence: "Confidence",
  match: "Match reference",
  status: "Status",
  submitted: "Submitted",
  updated: "Last update",
  none: "—",
  unlinked: "The linked detection is no longer in the review queue.",
  note: "This is a simulated request. Nothing is sent from the demo workspace, and no recipient is contacted.",
  copy: "Copy reference",
  copied: "Reference copied",
  copyFailed: "Copying is unavailable in this browser",
  close: "Close",
  utc: "UTC",
} as const;

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-edge-faint py-2.5 last:border-b-0">
      <dt className="shrink-0 text-2xs text-ink-soft">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  );
}

/**
 * A request summary in plain language: what was asked, about which
 * page, on what evidence. No legal boilerplate — the workspace
 * states the facts and says plainly that the demo sends nothing.
 */
export function TakedownRequestDialog({
  takedown,
  onOpenChange,
}: {
  takedown: DemoTakedown | null;
  onOpenChange: (open: boolean) => void;
}) {
  const match = takedown
    ? demoMatches.find((entry) => entry.id === takedown.matchId)
    : undefined;

  const copyReference = React.useCallback(async () => {
    if (!takedown) return;
    try {
      await navigator.clipboard.writeText(takedown.id);
      toast.success(text.copied);
    } catch {
      toast.error(text.copyFailed);
    }
  }, [takedown]);

  return (
    <Dialog open={takedown !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {takedown ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {text.title} {takedown.id}
              </DialogTitle>
              <DialogDescription>{text.description}</DialogDescription>
            </DialogHeader>

            <dl className="surface-mineral rounded-md px-4 py-1">
              <Row label={text.reference}>
                <span className="text-data text-ink">{takedown.id}</span>
              </Row>
              <Row label={text.target}>
                <span className="text-data text-ink">
                  {takedown.domainMasked}
                </span>
              </Row>
              <Row label={text.category}>
                <span className="text-[13px] text-ink">
                  {sourceLabels[takedown.sourceKind]}
                </span>
              </Row>
              <Row label={text.detected}>
                <span className="text-data text-ink">
                  {match
                    ? `${formatDateTimeUTC(match.detectedAt)} ${text.utc}`
                    : text.none}
                </span>
              </Row>
              <Row label={text.confidence}>
                {match ? (
                  <Badge variant={confidenceMeta[match.confidence].variant}>
                    {confidenceMeta[match.confidence].label}
                  </Badge>
                ) : (
                  <span className="text-[13px] text-ink-soft">{text.none}</span>
                )}
              </Row>
              <Row label={text.match}>
                <span className="text-data text-ink-soft">
                  {takedown.matchId}
                </span>
              </Row>
              <Row label={text.status}>
                <Badge variant={takedownMeta[takedown.status].variant}>
                  {takedownMeta[takedown.status].label}
                </Badge>
              </Row>
              <Row label={text.submitted}>
                <span className="text-data text-ink-soft">
                  {takedown.submittedAt
                    ? formatRelative(takedown.submittedAt, DEMO_ANCHOR)
                    : text.none}
                </span>
              </Row>
              <Row label={text.updated}>
                <span className="text-data text-ink-soft">
                  {formatRelative(takedown.updatedAt, DEMO_ANCHOR)}
                </span>
              </Row>
            </dl>

            {match ? null : (
              <p className="mt-3 text-2xs leading-relaxed text-ink-soft">
                {text.unlinked}
              </p>
            )}

            <p className="mt-4 border-l-2 border-edge-strong pl-3 text-[13px] leading-relaxed text-ink-soft">
              {text.note}
            </p>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="sm:h-9 sm:px-4 sm:text-sm"
                onClick={copyReference}
              >
                <Copy aria-hidden />
                {text.copy}
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="sm:h-9 sm:px-4 sm:text-sm"
                >
                  {text.close}
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
