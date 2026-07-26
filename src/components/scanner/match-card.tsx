"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { DemoMatch } from "@/lib/scan/types";
import { Badge } from "@/components/ui/badge";
import { SourceBadge } from "@/components/primitives";
import { AbstractThumb } from "./abstract-thumb";
import { motionTokens } from "@/lib/motion";
import { formatDateUTC, cn } from "@/lib/utils";

const confidenceBadge = {
  high: { variant: "scan-warn" as const, label: "High confidence" },
  medium: { variant: "scan-accent" as const, label: "Possible match" },
  low: { variant: "scan" as const, label: "Low confidence" },
};

/**
 * A single potential-match tile inside the scanner.
 *
 * Two different masking techniques, each chosen for its content:
 * the domain is masked by CHARACTER substitution (re•••••••.to), so
 * it still reads as a domain; the preview is masked by BLUR, since
 * an abstract panel has no characters to substitute. Blurring the
 * domain text instead would read as a rendering fault.
 */
export function MatchCard({
  match,
  locked,
  index,
}: {
  match: DemoMatch;
  locked: boolean;
  index: number;
}) {
  const conf = confidenceBadge[match.confidence];
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: motionTokens.duration.base,
        ease: motionTokens.ease.enter,
        delay: Math.min(index * 0.02, 0.1),
      }}
      className="flex gap-3 rounded-md border border-scan-edge bg-scan-raised p-2.5"
    >
      <AbstractThumb
        seed={match.thumbSeed}
        locked={locked}
        className="size-14 shrink-0 sm:size-16"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-data",
                locked ? "text-scan-soft" : "text-scan-ink"
              )}
            >
              {locked ? match.domainMasked : match.domainFull}
            </p>
            <p className="mt-0.5 truncate text-2xs text-scan-soft">
              {match.matchType}
            </p>
          </div>
          <SourceBadge kind={match.sourceKind} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <Badge variant={conf.variant} className="shrink-0">
            {conf.label}
          </Badge>
          <span className="text-data text-scan-faint">
            {formatDateUTC(match.detectedAt)}
          </span>
        </div>
      </div>
    </motion.li>
  );
}

export function MatchCardSkeleton({ className }: { className?: string }) {
  return (
    <li
      className={cn(
        "flex gap-3 rounded-md border border-scan-edge bg-scan-raised/50 p-2.5",
        className
      )}
    >
      <div className="size-14 shrink-0 rounded-sm bg-scan-high/70 sm:size-16" />
      <div className="flex-1 space-y-2 py-1.5">
        <div className="h-2.5 w-2/3 rounded-full bg-scan-high" />
        <div className="h-2 w-1/2 rounded-full bg-scan-high/60" />
        <div className="h-2 w-1/3 rounded-full bg-scan-high/40" />
      </div>
    </li>
  );
}
