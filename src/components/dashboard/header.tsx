"use client";

import Link from "next/link";
import { ChevronsUpDown } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routes } from "@/config/navigation";
import { copy } from "@/config/product";
import type { DemoProfile } from "@/lib/demo/scan-data";
import { formatNumber } from "@/lib/utils";

import { AccountMenu } from "./account-menu";
import { activeSectionTitle, dashboardContainer } from "./nav";

/* Strings this surface needs that the shared copy file doesn't carry. */
const text = {
  activeProfile: "Active profile",
  profileTrigger: "Change active profile",
  matches: "potential matches",
  manage: "Manage profiles",
  newScan: "New scan",
} as const;

/**
 * The contextual header: where you are, whose content you are
 * looking at, and the one action that leaves the workspace.
 */
export function DashboardHeader({
  pathname,
  profiles,
  activeProfile,
  onSelectProfile,
}: {
  pathname: string;
  profiles: readonly DemoProfile[];
  activeProfile: DemoProfile | undefined;
  onSelectProfile: (id: string) => void;
}) {
  const title = activeSectionTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-edge bg-canvas/85 backdrop-blur-md">
      <div
        className={`${dashboardContainer} flex h-14 items-center gap-2 sm:gap-3`}
      >
        <p className="min-w-0 truncate text-title text-sm text-ink sm:text-[15px]">
          {title}
        </p>

        <span
          aria-hidden
          className="hidden h-4 w-px shrink-0 bg-edge-strong sm:block"
        />

        {activeProfile ? (
          <ProfileSelector
            profiles={profiles}
            activeProfile={activeProfile}
            onSelectProfile={onSelectProfile}
          />
        ) : null}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex">
            {copy.dashboard.demoBadge}
          </Badge>

          <Button
            variant="secondary"
            size="sm"
            className="h-11 px-3.5 sm:h-8 sm:px-3"
            asChild
          >
            <Link href={routes.home}>{text.newScan}</Link>
          </Button>

          <AccountMenu
            profile={activeProfile}
            includeSections
            side="bottom"
            align="end"
            className="lg:hidden"
          />
        </div>
      </div>
    </header>
  );
}

/* ── Active profile selector ────────────────────────────────────
   Every figure in the workspace is read against one profile, so the
   switch belongs next to the section title — not buried in
   settings. */

function ProfileSelector({
  profiles,
  activeProfile,
  onSelectProfile,
}: {
  profiles: readonly DemoProfile[];
  activeProfile: DemoProfile;
  onSelectProfile: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${text.profileTrigger}. ${activeProfile.username}, ${activeProfile.platform}`}
          className="flex h-11 min-w-0 shrink-0 items-center gap-2 rounded-sm px-1.5 transition-colors hover:bg-mineral data-[state=open]:bg-mineral sm:h-9 sm:px-2"
        >
          <Avatar name={activeProfile.username} size="xs" />
          <span className="hidden max-w-[9rem] truncate text-[13px] text-ink md:block">
            {activeProfile.username}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-ink-soft" aria-hidden />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[16.5rem]">
        <DropdownMenuLabel>{text.activeProfile}</DropdownMenuLabel>

        {profiles.map((profile) => (
          <DropdownMenuCheckboxItem
            key={profile.id}
            checked={profile.id === activeProfile.id}
            onCheckedChange={() => onSelectProfile(profile.id)}
            className="py-2"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[13px] text-ink">
                  {profile.username}
                </span>
                <Badge variant="outline" className="shrink-0">
                  {profile.platform}
                </Badge>
              </span>
              <span className="text-2xs text-ink-soft">
                <span className="tabular">{formatNumber(profile.matches)}</span>{" "}
                {text.matches}
              </span>
            </span>
          </DropdownMenuCheckboxItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={routes.profiles}>{text.manage}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
