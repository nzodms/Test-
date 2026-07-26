"use client";

import Link from "next/link";
import { ArrowUpRight, MoreHorizontal, RotateCcw } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routes } from "@/config/navigation";
import type { DemoProfile } from "@/lib/demo/scan-data";
import { cn } from "@/lib/utils";

import { secondaryNavItems } from "./nav";

/* Strings this surface needs that the shared copy file doesn't carry. */
const text = {
  trigger: "Account and workspace menu",
  signedInAs: "Signed in as",
  demoAccount: "Demo account",
  restart: "Restart onboarding",
  backToSite: "Back to site",
  moreSections: "More sections",
} as const;

/**
 * The account affordance. It lives at the foot of the desktop rail
 * and, below `lg`, in the contextual header — where it also carries
 * the two destinations the bottom bar has no room for.
 */
export function AccountMenu({
  profile,
  includeSections = false,
  side = "top",
  align = "start",
  className,
}: {
  profile: DemoProfile | undefined;
  /** Adds Profiles / Settings — used by the mobile header trigger. */
  includeSections?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}) {
  const name = profile?.username ?? text.demoAccount;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={text.trigger}
          className={cn(
            "flex size-11 items-center justify-center rounded-sm transition-colors",
            "text-ink-soft hover:bg-mineral hover:text-ink",
            "data-[state=open]:bg-mineral data-[state=open]:text-ink",
            className
          )}
        >
          {/* Not an avatar: the profile switcher next to this already
              shows one, and two identical initials circles in one bar
              read as a duplicated control rather than two different
              menus. */}
          <MoreHorizontal className="size-5" aria-hidden />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side={side} align={align} className="w-60">
        <DropdownMenuLabel>{text.signedInAs}</DropdownMenuLabel>
        <div className="flex items-center gap-2.5 px-2.5 pb-2 pt-0.5">
          <Avatar name={name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-ink">{name}</p>
            <p className="truncate text-2xs text-ink-soft">
              {profile ? profile.platform : text.demoAccount}
            </p>
          </div>
        </div>

        {includeSections ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{text.moreSections}</DropdownMenuLabel>
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>
                    <Icon aria-hidden />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </>
        ) : null}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={routes.onboarding}>
            <RotateCcw aria-hidden />
            {text.restart}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={routes.home}>
            <ArrowUpRight aria-hidden />
            {text.backToSite}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
