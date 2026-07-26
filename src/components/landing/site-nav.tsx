"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { copy } from "@/config/product";
import { routes } from "@/config/navigation";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

const links = [
  { label: copy.nav.howItWorks, href: "#how-it-works" },
  { label: copy.nav.agencies, href: "#for-agencies" },
];

/**
 * Deliberately minimal. When a scan starts the bar compacts so the
 * instrument takes priority — the product outranks the marketing.
 */
export function SiteNav({ compact }: { compact: boolean }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = React.useState(false);

  return (
    <motion.header
      animate={
        reduced ? undefined : { height: compact ? 56 : 72 }
      }
      transition={{
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.standard,
      }}
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-500",
        compact
          ? "border-edge bg-canvas/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
      style={reduced ? { height: 64 } : undefined}
    >
      <div className="mx-auto flex h-full max-w-[1560px] items-center gap-6 px-4 sm:px-8">
        <Link href={routes.home} aria-label={`${copy.nav.startScan} — home`}>
          <Logo />
        </Link>

        <nav
          aria-label="Primary"
          className="ml-4 hidden items-center gap-1 md:flex"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-sm px-3 py-2 text-[13px] text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href={routes.onboardingDemo}>{copy.nav.demo}</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href={routes.signIn}>{copy.nav.signIn}</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="ml-auto flex size-11 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-mineral hover:text-ink md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-edge bg-canvas md:hidden">
          <nav
            aria-label="Mobile"
            className="mx-auto max-w-[1560px] space-y-1 px-4 py-4"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-sm px-3 text-[15px] text-ink-soft hover:bg-mineral hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="h-11 flex-1" asChild>
                <Link href={routes.signIn} onClick={() => setOpen(false)}>
                  {copy.nav.signIn}
                </Link>
              </Button>
              <Button className="h-11 flex-1" asChild>
                <Link href={routes.onboardingDemo} onClick={() => setOpen(false)}>
                  {copy.nav.demo}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </motion.header>
  );
}
