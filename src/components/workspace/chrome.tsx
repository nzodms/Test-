"use client";

import * as React from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { workspace } from "@/lib/demo/files";
import { cn } from "@/lib/utils";

/**
 * The file room.
 *
 * A single horizontal header carrying who issues the files, which
 * workspace they belong to, and the way back to the library. There is
 * no icon rail: a file room is entered through its index, not through
 * a column of glyphs, and navigation happens inside the file itself.
 */
export function WorkspaceChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#workspace-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-page"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-edge bg-canvas/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center gap-4 px-5 sm:px-8">
          <Link
            href={routes.dashboard}
            className="flex shrink-0 items-baseline gap-2.5"
            aria-label={`${brand.name} — file library`}
          >
            <LogoMark size={19} className="translate-y-[3px]" />
            <span className="text-[16px] font-medium tracking-tight text-ink">
              {brand.name}
            </span>
          </Link>

          <span aria-hidden className="hidden h-5 w-px bg-edge-strong sm:block" />

          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-[14.5px] text-ink">{workspace.name}</p>
          </div>

          <nav
            aria-label="Workspace"
            className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2"
          >
            <Link
              href={routes.onboarding}
              className="flex min-h-[44px] items-center rounded-[3px] px-3 text-[14.5px] text-ink-soft transition-colors hover:text-ink"
            >
              Open a new file
            </Link>
            <Link
              href={routes.home}
              className="hidden min-h-[44px] items-center rounded-[3px] px-3 text-[14.5px] text-ink-soft transition-colors hover:text-ink sm:flex"
            >
              Public scan
            </Link>
          </nav>
        </div>

        {/* Stated once, at hairline weight: this is demonstration material. */}
        <div className="border-t border-edge-faint bg-mineral/50">
          <div className="mx-auto flex w-full max-w-[1180px] items-baseline gap-2.5 px-5 py-1.5 sm:px-8">
            <span className="font-mono text-[11.5px] text-ink-faint">DEMO</span>
            <p className="text-[13px] text-ink-soft">
              Simulated file library. No scan is performed and no address is
              stored.
            </p>
          </div>
        </div>
      </header>

      <main
        id="workspace-content"
        className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-8 sm:px-8 sm:pt-12"
      >
        {children}
      </main>
    </div>
  );
}

/** The way back up, printed at the head of a file. */
export function LibraryReturn({ className }: { className?: string }) {
  return (
    <Link
      href={routes.dashboard}
      className={cn(
        "-ml-1 inline-flex min-h-[44px] items-center gap-2 rounded-[3px] px-1 text-[14px] text-ink-soft transition-colors hover:text-ink sm:min-h-0 sm:py-1",
        className
      )}
    >
      <span aria-hidden className="font-mono text-[13px]">
        ←
      </span>
      File library
    </Link>
  );
}
