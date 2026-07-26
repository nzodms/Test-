import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { copy } from "@/config/product";
import { routes } from "@/config/navigation";
import {
  DEMO_ANCHOR,
  demoProfiles,
  demoTakedowns,
  scanTotals,
} from "@/lib/demo/scan-data";
import { formatRelative } from "@/lib/utils";

const exposureBadge = {
  low: { variant: "scan-ok" as const, label: "Low" },
  moderate: { variant: "scan" as const, label: "Moderate" },
  elevated: { variant: "scan-warn" as const, label: "Elevated" },
  high: { variant: "scan-crit" as const, label: "High" },
};

/**
 * Sequence 4 — the agency view.
 *
 * The one place the black glass returns outside the scanner: a
 * compact roster, the way an agency actually reads its morning
 * queue. Deliberately not a full page of agency marketing.
 */
export function SequenceAgency() {
  const pending = demoTakedowns.filter(
    (t) => t.status === "drafted" || t.status === "submitted"
  ).length;

  return (
    <section
      id="for-agencies"
      className="scroll-mt-20 border-t border-edge bg-mineral/40"
    >
      <div className="mx-auto w-full max-w-[1560px] px-4 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <p className="text-label text-accent">
              {copy.sequences.agency.label}
            </p>
            <h2 className="text-display mt-4 text-[26px] text-ink sm:text-[32px]">
              {copy.sequences.agency.title}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              {copy.sequences.agency.body}
            </p>
            <Button variant="secondary" className="mt-7" asChild>
              <Link href={routes.onboardingDemo}>
                {copy.nav.demo}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="surface-scanner scanner-reflection overflow-hidden rounded-lg">
              <div className="flex items-center justify-between border-b border-scan-edge px-4 py-3 sm:px-5">
                <p className="text-label-scan">Managed profiles</p>
                <p className="text-data text-scan-faint">
                  {pending} actions pending
                </p>
              </div>

              <ul className="divide-y divide-scan-edge">
                {demoProfiles.map((p) => {
                  const badge = exposureBadge[p.exposure];
                  return (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 sm:px-5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] text-scan-ink">
                          {p.username}
                        </p>
                        <p className="mt-0.5 text-2xs text-scan-faint">
                          {p.platform} · scanned{" "}
                          {formatRelative(p.lastScan, DEMO_ANCHOR)}
                        </p>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <p className="tabular text-[15px] text-scan-ink">
                            {p.matches}
                          </p>
                          <p className="text-2xs text-scan-faint">matches</p>
                        </div>
                        <div className="hidden text-right sm:block">
                          <p className="tabular text-[15px] text-scan-ink">
                            +{p.newThisWeek}
                          </p>
                          <p className="text-2xs text-scan-faint">this week</p>
                        </div>
                        <Badge variant={badge.variant} dot className="w-[92px] justify-center">
                          {badge.label}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-scan-edge bg-scan-raised/60 px-4 py-3 sm:px-5">
                <p className="text-2xs text-scan-soft">
                  Across the roster ·{" "}
                  <span className="tabular text-scan-ink">
                    {demoProfiles.reduce((a, p) => a + p.matches, 0)}
                  </span>{" "}
                  matches ·{" "}
                  <span className="tabular text-scan-ink">
                    {scanTotals.highConfidence}
                  </span>{" "}
                  high confidence
                </p>
                <p className="ml-auto text-2xs text-scan-faint">
                  Priorities update as each scan completes
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
