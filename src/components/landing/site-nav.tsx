"use client";

import * as React from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────
   Strings local to the header.
   ──────────────────────────────────────────────────────────────── */

const text = {
  reference: "public scan",
  demo: "Start a demo scan",
  workspace: "Demo workspace",
  signIn: "Sign in",
} as const;

const entries = [
  { label: text.demo, href: routes.onboardingDemo },
  { label: text.workspace, href: routes.dashboard },
] as const;

/**
 * The header carries the issuing identity and the ways into the
 * product. There is no marketing menu — the product below is the
 * argument.
 *
 * At 375px three text entries and a mark cannot share one row
 * without colliding, so the phone gets a deliberate two-tier header
 * instead of a hidden link or a hamburger: identity and sign-in on
 * top, the two product entries as full-width targets beneath. It
 * scrolls away on a phone (where vertical space is the scarce
 * resource) and sticks from the small breakpoint up.
 */
export function SiteNav({ scanning }: { scanning: boolean }) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const settled = scrolled || scanning;

  return (
    <header
      className={cn(
        "relative z-40 border-b transition-colors duration-300 sm:sticky sm:top-0",
        settled
          ? "border-edge bg-canvas/92 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
        <div className="flex h-14 items-center gap-4 sm:h-16">
          <Link
            href={routes.home}
            className="flex items-baseline gap-2.5 rounded-xs"
            aria-label={`${brand.name} — home`}
          >
            <LogoMark size={19} className="translate-y-[3px]" />
            <span className="text-subject text-[16px] text-ink">
              {brand.name}
            </span>
            <span
              aria-hidden
              className="hidden font-mono text-[12.5px] text-ink-soft md:inline"
            >
              / {text.reference}
            </span>
          </Link>

          <nav
            aria-label="Product"
            className="ml-auto hidden items-center gap-1 sm:flex"
          >
            {entries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="flex h-11 items-center rounded-xs px-3 text-[14.5px] text-ink-soft transition-colors hover:text-ink"
              >
                {entry.label}
              </Link>
            ))}
            <Link
              href={routes.signIn}
              className="ml-1 flex h-11 items-center rounded-sm border border-edge-strong px-4 text-[14.5px] text-ink transition-colors hover:bg-page"
            >
              {text.signIn}
            </Link>
          </nav>

          {/* Phone: identity and the account entry share the top row. */}
          <Link
            href={routes.signIn}
            className="ml-auto flex h-11 items-center rounded-sm border border-edge-strong px-4 text-[15px] text-ink transition-colors hover:bg-page sm:hidden"
          >
            {text.signIn}
          </Link>
        </div>
      </div>

      {/* Phone: the two product entries, as full-width targets. */}
      <nav
        aria-label="Product"
        className="grid grid-cols-2 border-t border-edge-faint sm:hidden"
      >
        {entries.map((entry, i) => (
          <Link
            key={entry.href}
            href={entry.href}
            className={cn(
              "flex h-12 items-center justify-center text-[15px] text-ink-soft",
              "transition-colors active:bg-page",
              i === 1 && "border-l border-edge-faint"
            )}
          >
            {entry.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
