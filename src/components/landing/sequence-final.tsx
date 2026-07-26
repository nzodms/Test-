"use client";

import * as React from "react";
import Link from "next/link";
import { SearchField } from "@/components/scanner/search-field";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { copy } from "@/config/product";
import { routes } from "@/config/navigation";
import type { Platform } from "@/lib/validation";

/**
 * Sequence 5 — the closing action.
 *
 * No coloured banner, no oversized claim. The instrument returns,
 * because starting again is the point.
 */
export function SequenceFinal({
  onScan,
}: {
  onScan: (username: string, platform: Platform | null, raw: string) => void;
}) {
  return (
    <section className="mx-auto w-full max-w-[1560px] px-4 py-24 sm:px-8 sm:py-32">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-end lg:gap-20">
        <Reveal>
          <h2 className="text-display max-w-md text-[26px] text-ink sm:text-[32px]">
            {copy.sequences.final.title}
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-soft">
            No account needed to run the first scan. Detailed results
            unlock once you verify the profile is yours.
          </p>
          <Button variant="ghost" size="sm" className="mt-6 -ml-3" asChild>
            <Link href={routes.onboarding}>
              {copy.sequences.final.onboarding}
            </Link>
          </Button>
        </Reveal>

        <Reveal delay={0.08}>
          <SearchField onScan={onScan} size="md" />
        </Reveal>
      </div>
    </section>
  );
}
