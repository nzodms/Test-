"use client";

import * as React from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { cn } from "@/lib/utils";

/**
 * A file header, not a navigation bar.
 *
 * It carries the issuing identity and the two ways into the product.
 * There is no marketing menu: the file below is the argument.
 */
export function SiteNav({ scanning }: { scanning: boolean }) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled || scanning
          ? "border-edge bg-canvas/92 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center gap-4 px-5 sm:px-8">
        <Link
          href={routes.home}
          className="flex items-baseline gap-2.5"
          aria-label={`${brand.name} — home`}
        >
          <LogoMark size={19} className="translate-y-[3px]" />
          <span className="text-[16px] font-medium tracking-tight text-ink">
            {brand.name}
          </span>
          <span
            aria-hidden
            className="hidden font-mono text-[12px] text-ink-faint sm:inline"
          >
            / public scan
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="ml-auto flex items-center gap-1 sm:gap-2"
        >
          <Link
            href={routes.onboardingDemo}
            className="flex h-11 items-center rounded-[3px] px-3 text-[14.5px] text-ink-soft transition-colors hover:text-ink"
          >
            Open a file
          </Link>
          <Link
            href={routes.dashboard}
            className="hidden h-11 items-center rounded-[3px] px-3 text-[14.5px] text-ink-soft transition-colors hover:text-ink sm:flex"
          >
            Demo workspace
          </Link>
          <Link
            href={routes.signIn}
            className="flex h-11 items-center rounded-[3px] border border-edge-strong px-4 text-[14.5px] text-ink transition-colors hover:bg-page"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
