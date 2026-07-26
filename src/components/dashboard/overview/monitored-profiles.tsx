import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Section } from "@/components/dashboard/page-intro";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/navigation";
import { DEMO_ANCHOR, demoProfiles } from "@/lib/demo/scan-data";
import { formatNumber, formatRelative } from "@/lib/utils";

import { exposureMeta } from "./conventions";

const text = {
  title: "Monitored profiles",
  description: "Each public profile Argus re-scans on your schedule.",
  manage: "Manage profiles",
  matches: "matches",
  fresh: "new this week",
  lastScan: (relative: string) => `Last scan ${relative}`,
} as const;

/**
 * A compact register, one line per protected profile. Figures are
 * read per profile, never summed — the totals above belong to the
 * active profile alone.
 */
export function MonitoredProfiles() {
  return (
    <Section
      title={text.title}
      description={text.description}
      actions={
        <Link
          href={routes.profiles}
          className="group inline-flex min-h-[44px] items-center gap-1.5 rounded-xs text-[13px] text-ink-soft transition-colors hover:text-ink sm:min-h-0"
        >
          {text.manage}
          <ChevronRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      }
    >
      <ul className="divide-y divide-edge-faint overflow-hidden rounded-md border border-edge bg-paper">
        {demoProfiles.map((profile) => {
          const exposure = exposureMeta[profile.exposure];
          return (
            <li key={profile.id}>
              <Link
                href={routes.profiles}
                className="flex min-h-[60px] items-center gap-3 px-3 py-3 transition-colors hover:bg-mineral/50 sm:px-4"
              >
                <Avatar name={profile.username} size="sm" />

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm text-ink">
                      {profile.username}
                    </span>
                    <Badge variant="outline" className="shrink-0">
                      {profile.platform}
                    </Badge>
                  </div>

                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-2xs text-ink-soft">
                    <span>
                      <span className="tabular text-ink">
                        {formatNumber(profile.matches)}
                      </span>{" "}
                      {text.matches}
                    </span>
                    <span aria-hidden>·</span>
                    <span>
                      <span className="tabular text-ink">
                        {formatNumber(profile.newThisWeek)}
                      </span>{" "}
                      {text.fresh}
                    </span>
                    <span aria-hidden>·</span>
                    <span>
                      {text.lastScan(
                        formatRelative(profile.lastScan, DEMO_ANCHOR)
                      )}
                    </span>
                  </p>
                </div>

                <Badge variant={exposure.variant} className="shrink-0">
                  {exposure.label}
                </Badge>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
