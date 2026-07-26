"use client";

import * as React from "react";
import { ReportPage } from "@/components/file/file-parts";
import { demoProfiles, demoTakedowns, DEMO_ANCHOR } from "@/lib/demo/scan-data";
import { formatRelative, cn } from "@/lib/utils";

const EXPOSURE_TONE = {
  low: "text-ok",
  moderate: "text-ink-soft",
  elevated: "text-warn",
  high: "text-crit",
} as const;

/**
 * The agency view: a library of files, not a dashboard.
 *
 * Each managed profile is one file with a state; the shelf is
 * ordered by what needs attention. This is the same object the
 * visitor has just seen created for themselves, multiplied.
 */
export function ForAgencies({ onOpenSample }: { onOpenSample: () => void }) {
  const pending = demoTakedowns.filter(
    (t) => t.status === "drafted" || t.status === "submitted"
  ).length;

  return (
    <section
      id="for-agencies"
      className="border-t border-edge bg-paper/50 py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[152px_minmax(0,1fr)] lg:gap-14">
          <div className="hidden lg:block">
            <p className="border-t border-ink/20 pt-3 font-mono text-[12px] text-ink-faint">
              Agencies
            </p>
          </div>

          <div className="min-w-0">
            <div className="max-w-[560px]">
              <h2 className="text-report text-[30px] text-ink sm:text-[34px]">
                A shelf of files, ordered by what needs attention
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
                Agencies hold one file per managed profile. Priority,
                pending removals and new findings surface across the
                roster instead of sitting inside separate accounts.
              </p>
            </div>

            <ReportPage className="mt-10 px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-edge pb-4">
                <p className="text-[15px] text-ink">Active files</p>
                <p className="font-mono text-[12.5px] text-ink-faint">
                  {pending} awaiting action
                </p>
              </div>

              <ul>
                {demoProfiles.map((p, i) => (
                  <li
                    key={p.id}
                    className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-edge-faint py-4 last:border-b-0 sm:gap-x-8"
                  >
                    <span className="font-mono text-[12.5px] tabular text-ink-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[16px] text-ink">
                        @{p.username}
                      </p>
                      <p className="mt-0.5 text-[14px] text-ink-soft">
                        {p.platform}
                        <span className="px-1.5 text-ink-faint">·</span>
                        scanned {formatRelative(p.lastScan, DEMO_ANCHOR)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="tabular text-[17px] text-ink">
                        {p.matches}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-[13.5px]",
                          EXPOSURE_TONE[p.exposure]
                        )}
                      >
                        {p.exposure === "low"
                          ? "Low"
                          : p.exposure === "moderate"
                            ? "Moderate"
                            : p.exposure === "elevated"
                              ? "Elevated"
                              : "High"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </ReportPage>

            <button
              type="button"
              onClick={onOpenSample}
              className="mt-7 h-11 text-[15px] text-ink underline decoration-edge-strong underline-offset-[5px] transition-colors hover:decoration-ink"
            >
              Open a sample file
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
