/**
 * Route map — single place that defines where things live.
 * The dashboard route is /dashboard everywhere; never hardcode.
 */
export const routes = {
  home: "/",
  signIn: "/sign-in",
  onboarding: "/onboarding",
  onboardingDemo: "/onboarding?mode=demo",
  dashboard: "/dashboard",
  findings: "/dashboard/findings",
  sources: "/dashboard/sources",
  monitoring: "/dashboard/monitoring",
  takedowns: "/dashboard/takedowns",
  profiles: "/dashboard/profiles",
  settings: "/dashboard/settings",
  privacy: "/legal/privacy",
  terms: "/legal/terms",
  contentPolicy: "/legal/content-policy",
  takedownPolicy: "/legal/takedown-policy",
} as const;

export const dashboardNav = [
  { label: "Overview", href: routes.dashboard },
  { label: "Findings", href: routes.findings },
  { label: "Sources", href: routes.sources },
  { label: "Monitoring", href: routes.monitoring },
  { label: "Takedowns", href: routes.takedowns },
  { label: "Profiles", href: routes.profiles },
  { label: "Settings", href: routes.settings },
] as const;
