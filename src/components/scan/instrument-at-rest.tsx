"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Redacted } from "@/components/file/redacted";
import { SCAN_STAGES } from "@/lib/scan/types";
import { featuredMatches, sourceCoverage } from "@/lib/demo/scan-data";
import { motionTokens } from "@/lib/motion";
import { formatDateUTC } from "@/lib/utils";

/**
 * The instrument, before anyone has asked it anything.
 *
 * The landing shows the product rather than describing it — but a
 * screenshot of a finished dashboard would be a lie about what
 * happens next. This is the same surface the scan runs on, idle: the
 * stages are listed but unlit, the figures are absent rather than
 * zero, and three signals sit in the register with their addresses
 * already withheld.
 *
 * It says three true things at a glance: what Argus produces, that
 * the sensitive part is never shown, and that it is waiting for a
 * name.
 */
export function InstrumentAtRest() {
  const reduced = useReducedMotion();
  const signals = featuredMatches.slice(0, 3);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: motionTokens.duration.reveal,
        delay: reduced ? 0 : 0.1,
        ease: motionTokens.ease.enter,
      }}
      aria-hidden
      className="surface-active overflow-hidden rounded-[12px] shadow-scanner"
    >
      {/* Session bar, idle */}
      <div className="flex items-center gap-3 border-b border-edge px-4 py-2.5">
        <span className="size-1.5 shrink-0 rounded-full bg-ink-faint" />
        <p className="font-mono text-[12px] tabular text-ink-soft">
          IDLE
          <span className="px-2 text-ink-faint">·</span>
          <span className="text-ink-faint">awaiting a profile</span>
        </p>
      </div>

      <div className="px-4 py-5">
        {/* The five stages, listed but unlit */}
        <div className="grid grid-cols-5 gap-x-1.5">
          {SCAN_STAGES.map((s) => (
            <div key={s.id}>
              <span className="block h-px w-full bg-edge-strong" />
              <span className="mt-2 block truncate font-mono text-[10.5px] text-ink-faint">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Figures absent, not zero */}
        <div className="mt-6 grid grid-cols-3 gap-x-4">
          {[
            ["matches", null],
            ["sources", `${sourceCoverage.length} kinds`],
            ["exposure", null],
          ].map(([label, sub]) => (
            <div key={label as string}>
              <p className="text-figure text-[26px] text-ink-faint">—</p>
              <p className="mt-1 text-[12.5px] text-ink-soft">{label}</p>
              {sub ? (
                <p className="font-mono text-[11px] text-ink-faint">{sub}</p>
              ) : null}
            </div>
          ))}
        </div>

        {/* Signals, already withheld */}
        <ul className="mt-6 border-t border-edge">
          {signals.map((m, i) => (
            <li
              key={m.id}
              className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-edge py-2.5 last:border-b-0"
            >
              <span className="font-mono text-[11px] tabular text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex min-w-0 items-center gap-1 font-mono text-[12.5px] text-ink-soft">
                <span>{m.redaction.head}</span>
                <Redacted chars={Math.min(7, m.redaction.hidden)} />
                <span>{m.redaction.tail}</span>
              </span>
              <span className="shrink-0 font-mono text-[11px] text-ink-faint">
                {formatDateUTC(m.detectedAt)}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-soft">
          Addresses stay withheld until the profile is verified.
        </p>
      </div>
    </motion.div>
  );
}
