"use client";

import * as React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { routes } from "@/config/navigation";
import type { FileRecord } from "@/lib/demo/files";
import { Figure } from "../parts";

/**
 * The seal.
 *
 * What a sealed file may say about itself is deliberately thin: how
 * much is held, and how to open it. The findings, the sources and
 * the requests are not rendered at all until the account holder has
 * proved the profile is theirs — they are not hidden with CSS, they
 * are simply not built.
 */
export function SealNotice({ file }: { file: FileRecord }) {
  return (
    <section className="mt-10 border-t border-edge pt-8">
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
        <div className="max-w-[42ch]">
          <h3 className="text-title flex items-center gap-2.5 text-[17px] text-ink">
            <Lock className="size-4 shrink-0" aria-hidden />
            Findings, sources and actions are sealed
          </h3>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
            They stay closed until the account holder proves that @
            {file.username} belongs to them. Until then this workspace can
            see how much is held, and nothing of what it contains.
          </p>
        </div>

        <dl className="flex gap-x-10 gap-y-4">
          <div>
            <dd>
              <Figure value={file.findings} className="text-[34px]" />
            </dd>
            <dt className="mt-1.5 text-[13.5px] text-ink-soft">
              findings held
            </dt>
          </div>
          <div>
            <dd>
              <Figure value={file.sources} className="text-[34px]" />
            </dd>
            <dt className="mt-1.5 text-[13.5px] text-ink-soft">
              sources involved
            </dt>
          </div>
        </dl>
      </div>

      <Link
        href={routes.onboarding}
        className="mt-7 inline-flex h-12 items-center rounded-[4px] bg-ink px-5 text-[15px] font-medium text-page transition-colors duration-150 hover:bg-graphite sm:h-11"
      >
        Start ownership verification
      </Link>
    </section>
  );
}
