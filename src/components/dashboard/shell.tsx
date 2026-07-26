"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { TooltipProvider } from "@/components/ui/tooltip";
import { copy } from "@/config/product";
import { demoProfiles } from "@/lib/demo/scan-data";

import { DashboardHeader } from "./header";
import { dashboardContainer } from "./nav";
import { DashboardRail, DashboardTabBar } from "./rail";

const text = {
  skip: "Skip to content",
} as const;

/**
 * The demo workspace chrome: a narrow instrument rail on the left
 * (a bottom bar on small screens) and a contextual header that
 * states the section and the profile everything is measured
 * against. No gating happens here — the workspace is reachable in
 * demo mode by design.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [profileId, setProfileId] = React.useState<string>(
    demoProfiles[0]?.id ?? ""
  );
  const activeProfile =
    demoProfiles.find((profile) => profile.id === profileId) ?? demoProfiles[0];

  return (
    <TooltipProvider delayDuration={220} skipDelayDuration={300}>
      <div className="min-h-dvh bg-canvas">
        <a
          href="#workspace-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-paper"
        >
          {text.skip}
        </a>

        <DashboardRail pathname={pathname} profile={activeProfile} />

        <div className="flex min-h-dvh flex-col lg:pl-16">
          <DashboardHeader
            pathname={pathname}
            profiles={demoProfiles}
            activeProfile={activeProfile}
            onSelectProfile={setProfileId}
          />

          {/* Stated once for the whole workspace, at hairline weight. */}
          <div className="border-b border-edge-faint bg-mineral/60">
            <div
              className={`${dashboardContainer} flex items-start gap-2.5 py-2`}
            >
              <span
                aria-hidden
                className="mt-[0.4rem] size-1 shrink-0 rounded-full bg-ink-faint"
              />
              <p className="text-2xs leading-relaxed text-ink-soft">
                {copy.dashboard.demoNote}
              </p>
            </div>
          </div>

          <main
            id="workspace-content"
            className={`${dashboardContainer} flex-1 pb-28 pt-6 sm:pt-8 lg:pb-14`}
          >
            {children}
          </main>
        </div>

        <DashboardTabBar pathname={pathname} />
      </div>
    </TooltipProvider>
  );
}
