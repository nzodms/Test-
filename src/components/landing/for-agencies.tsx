"use client";

import Link from "next/link";
import { exposureLabels, fileLibrary } from "@/lib/demo/files";
import { DEMO_ANCHOR } from "@/lib/demo/scan-data";
import { routes } from "@/config/navigation";
import { cn, formatRelative } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────
   The agency view.

   Composition: a ledger. The data comes first and the explanation
   comes after it, which is the opposite order to the sequence above
   — the roster is the argument, so it is not introduced by a
   headline and a paragraph before anyone is allowed to see it.
   Structure is hairlines and alignment; there is no card here.
   ──────────────────────────────────────────────────────────────── */

const EXPOSURE_TONE = {
  low: "text-ok",
  moderate: "text-ink-soft",
  elevated: "text-warn",
  high: "text-crit",
} as const;

export function ForAgencies({ onOpenSample }: { onOpenSample: () => void }) {
  /* The same library the workspace opens, so the two never disagree. */
  const files = fileLibrary.slice(0, 5);
  const pending = fileLibrary.reduce((a, f) => a + f.awaitingReview, 0);

  return (
    <section
      id="for-agencies"
      className="scroll-mt-20 border-t border-edge bg-paper/50 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 className="text-title text-[22px] text-ink sm:text-[25px]">
            A roster, ordered by what needs attention
          </h2>
          <p className="font-mono text-[12.5px] tabular text-ink-soft">
            {fileLibrary.length} files · {pending} awaiting a decision
          </p>
        </div>

        <ul className="mt-8 border-t border-edge-strong">
          {files.map((f) => (
            <li
              key={f.ref}
              className="grid gap-x-8 gap-y-2 border-b border-edge-faint py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
            >
              <div className="min-w-0">
                <p className="text-subject truncate text-[17px] text-ink">
                  @{f.username}
                  <span className="px-2 text-ink-faint" aria-hidden>
                    ·
                  </span>
                  <span className="text-[15px] font-normal text-ink-soft">
                    {f.platform}
                  </span>
                </p>
                <p className="mt-1 truncate font-mono text-[12.5px] text-ink-soft">
                  {f.ref}
                  <span className="px-2" aria-hidden>
                    ·
                  </span>
                  {f.verified
                    ? `scanned ${formatRelative(f.lastScan, DEMO_ANCHOR)}`
                    : "sealed until verification"}
                </p>
              </div>

              <div className="flex items-baseline gap-6 sm:justify-end">
                <p className="text-figure text-[19px] text-ink">
                  {f.findings}
                  <span className="ml-1.5 text-[14px] font-normal tracking-normal text-ink-soft">
                    findings
                  </span>
                </p>
                <p
                  className={cn(
                    "w-[5.5rem] text-[14.5px] sm:text-right",
                    EXPOSURE_TONE[f.exposure]
                  )}
                >
                  {exposureLabels[f.exposure]}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-[58ch] text-[15px] leading-relaxed text-graphite">
            An agency holds one file per managed profile. Priority, pending
            removals and new findings surface across the whole roster instead of
            sitting inside separate accounts — and access to a file ends the
            moment the creator&apos;s mandate does.
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <button
              type="button"
              onClick={onOpenSample}
              className="inline-flex h-11 items-center rounded-xs text-[15px] text-ink underline decoration-edge-strong underline-offset-[5px] transition-colors hover:decoration-ink"
            >
              Open a sample file
            </button>
            <Link
              href={routes.dashboard}
              className="inline-flex h-11 items-center rounded-xs text-[15px] text-ink-soft transition-colors hover:text-ink"
            >
              Look inside the demo library
            </Link>
          </div>
        </div>

        <p className="mt-10 font-mono text-[12.5px] text-ink-soft">
          Demo library — every record above is simulated.
        </p>
      </div>
    </section>
  );
}
