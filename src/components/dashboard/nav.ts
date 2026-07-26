import {
  FileText,
  Gauge,
  Globe,
  Radar,
  Search,
  Settings2,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { dashboardNav, routes } from "@/config/navigation";
import { copy } from "@/config/product";

/* ════════════════════════════════════════════════════════════════
   Dashboard chrome configuration.

   The destinations come from `dashboardNav` — this module only
   attaches the instrument icon and the section title used by the
   contextual header, so the route map stays the single source of
   truth for where things live.
   ════════════════════════════════════════════════════════════════ */

export interface DashboardNavItem {
  href: string;
  /** Rail tooltip and bottom-bar micro-label. */
  label: string;
  /** Section title shown in the contextual header. */
  title: string;
  icon: LucideIcon;
}

const SECTION_META: Record<string, { icon: LucideIcon; title: string }> = {
  [routes.dashboard]: { icon: Gauge, title: copy.dashboard.sections.overview },
  [routes.findings]: { icon: Search, title: copy.dashboard.sections.findings },
  [routes.sources]: { icon: Globe, title: copy.dashboard.sections.sources },
  [routes.monitoring]: { icon: Radar, title: copy.dashboard.sections.monitoring },
  [routes.takedowns]: { icon: FileText, title: copy.dashboard.sections.takedowns },
  [routes.profiles]: { icon: UserRound, title: copy.dashboard.sections.profiles },
  [routes.settings]: { icon: Settings2, title: copy.dashboard.sections.settings },
};

export const dashboardNavItems: DashboardNavItem[] = dashboardNav.map((item) => {
  const meta = SECTION_META[item.href];
  return {
    href: item.href,
    label: item.label,
    title: meta?.title ?? item.label,
    icon: meta?.icon ?? Gauge,
  };
});

/**
 * The five destinations that earn a slot in the mobile bottom bar.
 * Profiles and Settings stay one tap away in the header menu — a
 * bottom bar with seven targets is a bottom bar nobody can hit.
 */
const MOBILE_HREFS: readonly string[] = [
  routes.dashboard,
  routes.findings,
  routes.sources,
  routes.monitoring,
  routes.takedowns,
];

export const mobileNavItems: DashboardNavItem[] = dashboardNavItems.filter(
  (item) => MOBILE_HREFS.includes(item.href)
);

/** Reachable from the header menu on small screens. */
export const secondaryNavItems: DashboardNavItem[] = dashboardNavItems.filter(
  (item) => !MOBILE_HREFS.includes(item.href)
);

/** Overview matches exactly; every other section owns its subtree. */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === routes.dashboard) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function activeNavItem(pathname: string): DashboardNavItem | undefined {
  return dashboardNavItems.find((item) => isNavItemActive(pathname, item.href));
}

export function activeSectionTitle(pathname: string): string {
  return activeNavItem(pathname)?.title ?? copy.dashboard.sections.overview;
}

/**
 * Shared measure for the header, the demo strip and the content —
 * so the section title sits on the same optical line as the page
 * heading below it.
 */
export const dashboardContainer =
  "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8";
