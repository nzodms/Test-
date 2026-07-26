"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { LogoMark } from "@/components/brand/logo";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import type { DemoProfile } from "@/lib/demo/scan-data";
import { enterTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { AccountMenu } from "./account-menu";
import { dashboardNavItems, isNavItemActive, mobileNavItems } from "./nav";

const text = {
  nav: "Workspace sections",
  home: "home",
} as const;

/* ── Desktop: a 64px instrument rail, icons only ────────────────
   Not a sidebar. It holds the mark, the seven destinations and the
   account — nothing else competes with the workspace itself. */

export function DashboardRail({
  pathname,
  profile,
}: {
  pathname: string;
  profile: DemoProfile | undefined;
}) {
  const reduced = useReducedMotion();

  return (
    <div className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col border-r border-edge bg-paper lg:flex">
      <div className="flex h-14 shrink-0 items-center justify-center border-b border-edge-faint">
        <Link
          href={routes.home}
          aria-label={`${brand.name} ${text.home}`}
          className="flex size-10 items-center justify-center rounded-sm transition-colors hover:bg-mineral"
        >
          <LogoMark size={22} />
        </Link>
      </div>

      <nav
        aria-label={text.nav}
        className="scrollbar-quiet flex-1 overflow-y-auto py-3"
      >
        <ul className="flex flex-col items-center gap-0.5">
          {dashboardNavItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href} className="relative w-full">
                {active ? (
                  reduced ? (
                    <span
                      aria-hidden
                      className="absolute left-0 top-3 h-5 w-[2px] rounded-r-full bg-ink"
                    />
                  ) : (
                    <motion.span
                      layoutId="argus-rail-active"
                      aria-hidden
                      transition={enterTransition}
                      className="absolute left-0 top-3 h-5 w-[2px] rounded-r-full bg-ink"
                    />
                  )
                ) : null}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "mx-auto flex size-11 items-center justify-center rounded-sm transition-colors",
                        active
                          ? "bg-mineral text-ink"
                          : "text-ink-soft hover:bg-mineral/70 hover:text-ink"
                      )}
                    >
                      <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex h-16 shrink-0 items-center justify-center border-t border-edge-faint">
        <AccountMenu profile={profile} side="right" align="end" />
      </div>
    </div>
  );
}

/* ── Mobile: the rail lies down at the bottom ───────────────────
   Five destinations, thumb-height, safe-area padded. No hamburger:
   the workspace is one tap deep at every width. */

export function DashboardTabBar({ pathname }: { pathname: string }) {
  const reduced = useReducedMotion();

  return (
    <nav
      aria-label={text.nav}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-edge",
        "bg-canvas/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden"
      )}
    >
      <ul className="grid grid-cols-5">
        {mobileNavItems.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="relative min-w-0">
              {active ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
                >
                  {reduced ? (
                    <span className="h-[2px] w-7 rounded-b-full bg-ink" />
                  ) : (
                    <motion.span
                      layoutId="argus-tab-active"
                      transition={enterTransition}
                      className="h-[2px] w-7 rounded-b-full bg-ink"
                    />
                  )}
                </span>
              ) : null}

              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 transition-colors",
                  active ? "text-ink" : "text-ink-soft"
                )}
              >
                <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
                <span className="max-w-full truncate text-[10px] leading-none">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
