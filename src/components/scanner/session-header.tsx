"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pencil, RotateCcw, SkipForward } from "lucide-react";
import type { ScanPhase } from "@/lib/scan/types";
import { StatusIndicator } from "@/components/primitives";
import { Badge } from "@/components/ui/badge";
import { copy } from "@/config/product";
import { platformLabels, type Platform } from "@/lib/validation";
import { DEMO_ANCHOR } from "@/lib/demo/scan-data";
import { formatDateTimeUTC, cn } from "@/lib/utils";

/**
 * The search bar becomes this once a scan starts: a session header
 * carrying the query, the platform, live status and the controls.
 */
export function SessionHeader({
  username,
  platform,
  phase,
  running,
  onEdit,
  onSkip,
  onReplay,
}: {
  username: string;
  platform: Platform | null;
  phase: ScanPhase;
  running: boolean;
  onEdit: () => void;
  onSkip: () => void;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const status = copy.scanner.statusByPhase[phase];

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-scan-edge px-4 py-3.5 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <StatusIndicator status={running ? "active" : "complete"} />
        <div className="min-w-0">
          <p className="flex items-baseline gap-2">
            <span className="truncate text-[15px] font-medium text-scan-ink">
              @{username}
            </span>
            {platform ? (
              <span className="shrink-0 text-2xs text-scan-faint">
                {platformLabels[platform]}
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 flex items-center gap-2 text-2xs">
            <span className="text-label-scan tracking-normal normal-case">
              {copy.scanner.sessionLabel}
            </span>
            <span className="text-scan-faint">·</span>
            <motion.span
              key={status}
              initial={reduced ? false : { opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "text-scan-soft",
                running && "text-accent-bright"
              )}
            >
              {status}
            </motion.span>
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* The demo disclosure is never hidden — including on a
            phone, where the header is tightest. */}
        <Badge variant="scan">{copy.landing.demoNotice}</Badge>
        <span className="hidden text-data text-scan-faint md:inline">
          {formatDateTimeUTC(DEMO_ANCHOR)} UTC
        </span>

        {running ? (
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-2xs text-scan-soft transition-colors hover:bg-scan-high hover:text-scan-ink"
          >
            <SkipForward className="size-3" aria-hidden />
            {copy.scanner.skip}
          </button>
        ) : (
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-2xs text-scan-soft transition-colors hover:bg-scan-high hover:text-scan-ink"
          >
            <RotateCcw className="size-3" aria-hidden />
            {copy.scanner.replay}
          </button>
        )}

        <button
          type="button"
          onClick={onEdit}
          aria-label={copy.scanner.edit}
          className="inline-flex size-8 items-center justify-center rounded-sm text-scan-soft transition-colors hover:bg-scan-high hover:text-scan-ink"
        >
          <Pencil className="size-3.5" aria-hidden />
        </button>
      </div>
    </header>
  );
}
