/**
 * Route map — single place that defines where things live.
 * The dashboard route is /dashboard everywhere; never hardcode.
 */
export const routes = {
  home: "/",
  signIn: "/sign-in",
  onboarding: "/onboarding",
  onboardingDemo: "/onboarding?mode=demo",
  /** The file library. Individual files live at /dashboard/<reference>. */
  dashboard: "/dashboard",
  privacy: "/legal/privacy",
  terms: "/legal/terms",
  contentPolicy: "/legal/content-policy",
  takedownPolicy: "/legal/takedown-policy",
} as const;

/** A file's own index — the tabs printed along the top of a record. */
export const fileSections = [
  "Profile file",
  "Status",
  "Findings",
  "Sources",
  "Timeline",
  "Actions",
] as const;
