import { z } from "zod";
import { copy } from "@/config/product";
import { platformLabels, type Platform } from "@/lib/validation";

/* ════════════════════════════════════════════════════════════════
   Onboarding state — the single shape persisted under
   `argus:v1:onboarding`. Everything here is pure: no window access,
   no timers, safe to import from server or client.
   ════════════════════════════════════════════════════════════════ */

export const ONBOARDING_KEY = "onboarding";
export const TOTAL_STEPS = 6;

export type AccountType = "creator" | "agency";
export type ScanFrequency = "daily" | "twiceWeekly" | "weekly";
export type CoverageLevel = "standard" | "extended";

export type ProfileEntry = {
  id: string;
  username: string;
  platform: Platform;
  url: string;
};

export type OnboardingState = {
  step: number;
  /** monotonic counter for stable profile ids — no randomness, no clock */
  seq: number;
  accountType: AccountType | null;
  profiles: ProfileEntry[];
  demoAcknowledged: boolean;
  frequency: ScanFrequency;
  coverage: CoverageLevel;
  highConfidenceAlerts: boolean;
  weeklySummary: boolean;
  emailEnabled: boolean;
  email: string;
  completed: boolean;
};

export type OnboardingUpdate = (
  updater: (prev: OnboardingState) => OnboardingState
) => void;

export const DEFAULT_ONBOARDING: OnboardingState = {
  step: 1,
  seq: 1,
  accountType: null,
  profiles: [],
  demoAcknowledged: false,
  frequency: "weekly",
  coverage: "standard",
  highConfidenceAlerts: true,
  weeklySummary: true,
  emailEnabled: false,
  email: "",
  completed: false,
};

/* ── Local copy — strings the shared config does not define ─────── */

export const local = {
  stepNames: [
    "Account",
    "Profiles",
    "Ownership",
    "Monitoring",
    "Notifications",
    "Workspace",
  ],
  stepCounter: (step: number) => `Step ${step} of ${TOTAL_STEPS}`,
  summaryTitle: "Your workspace",
  summaryPending: "Not set",
  account: "Account",
  profilesNone: "None yet",
  frequency: "Frequency",
  coverage: "Coverage",
  alerts: "Alerts",
  reach: "Reach you at",
  dashboardOnly: "Dashboard only",
  alertsOff: "Summary only",
  alertsBoth: "High confidence, weekly summary",
  alertsHigh: "High confidence",
  alertsWeekly: "Weekly summary",
  alertsNone: "None",
  addAnother: "Add another profile at any time from the workspace.",
  usernamePlaceholder: "username, @handle or profile URL",
  urlPlaceholder: "https://",
  duplicate: "That profile is already on the list.",
  invalidUrl: "That doesn't look like a profile URL.",
  removeProfile: (username: string) => `Remove ${username}`,
  profilesEmpty: "No profiles added yet.",
  planned: copy.onboarding.steps.notifications.planned,
  alwaysOn: "Always on",
  assembly: "Workspace assembly",
  assemblyPending: "Preparing",
  loading: "Loading your setup",
  guards: {
    account: "Choose Creator or Agency to continue.",
    profiles: copy.onboarding.steps.profiles.empty,
    ownership: "Confirm you want to continue in demo mode.",
    email: "Enter a valid email address, or turn email off.",
  },
  frequencyLegend: "Scan frequency",
  coverageLegend: "Source coverage",
  accountLegend: copy.onboarding.steps.account.title,
} as const;

export const frequencyOptions: readonly {
  value: ScanFrequency;
  title: string;
  body: string;
}[] = [
  { value: "daily", title: "Daily", body: "A full pass every day." },
  {
    value: "twiceWeekly",
    title: "Twice weekly",
    body: "A full pass on Monday and Thursday.",
  },
  { value: "weekly", title: "Weekly", body: "A full pass every Monday." },
];

export const coverageOptions: readonly {
  value: CoverageLevel;
  title: string;
  body: string;
}[] = [
  {
    value: "standard",
    title: "Standard",
    body: "Indexed websites, mirrors and public archives.",
  },
  {
    value: "extended",
    title: "Extended",
    body: "Adds indexed public forums and channels. Slower, wider.",
  },
];

/* ── Derived labels ─────────────────────────────────────────────── */

export function stepName(step: number): string {
  return local.stepNames[step - 1] ?? local.stepNames[0] ?? "";
}

export function stepMeta(step: number): { title: string; blurb?: string } {
  const steps = copy.onboarding.steps;
  switch (step) {
    case 1:
      return { title: steps.account.title, blurb: steps.account.blurb };
    case 2:
      return { title: steps.profiles.title, blurb: steps.profiles.blurb };
    case 3:
      return { title: steps.ownership.title, blurb: steps.ownership.blurb };
    case 4:
      return { title: steps.monitoring.title, blurb: steps.monitoring.blurb };
    case 5:
      return {
        title: steps.notifications.title,
        blurb: steps.notifications.blurb,
      };
    default:
      return { title: steps.workspace.title };
  }
}

export function accountLabel(type: AccountType | null): string | null {
  if (type === "creator") return copy.onboarding.steps.account.creator;
  if (type === "agency") return copy.onboarding.steps.account.agency;
  return null;
}

export function frequencyLabel(value: ScanFrequency): string {
  return frequencyOptions.find((o) => o.value === value)?.title ?? "";
}

export function coverageLabel(value: CoverageLevel): string {
  return coverageOptions.find((o) => o.value === value)?.title ?? "";
}

export function profileCountLabel(count: number): string {
  return count === 1 ? "1 profile" : `${count} profiles`;
}

export function alertsLabel(state: OnboardingState): string {
  if (state.highConfidenceAlerts && state.weeklySummary) return local.alertsBoth;
  if (state.highConfidenceAlerts) return local.alertsHigh;
  if (state.weeklySummary) return local.alertsWeekly;
  return local.alertsNone;
}

export function reachLabel(state: OnboardingState): string {
  const email = state.email.trim();
  return state.emailEnabled && email.length > 0 ? email : local.dashboardOnly;
}

/* ── Validation ─────────────────────────────────────────────────── */

const emailSchema = z.email();

export function isEmailValid(state: OnboardingState): boolean {
  if (!state.emailEnabled) return true;
  return emailSchema.safeParse(state.email.trim()).success;
}

export function isEmailAddress(value: string): boolean {
  return emailSchema.safeParse(value.trim()).success;
}

/** The reason Continue is unavailable, or null when the step is valid. */
export function stepGuard(state: OnboardingState): string | null {
  switch (state.step) {
    case 1:
      return state.accountType === null ? local.guards.account : null;
    case 2:
      return state.profiles.length === 0 ? local.guards.profiles : null;
    case 3:
      return state.demoAcknowledged ? null : local.guards.ownership;
    case 5:
      return isEmailValid(state) ? null : local.guards.email;
    default:
      return null;
  }
}

/* ── Stored-value hardening ─────────────────────────────────────── */

const PLATFORM_KEYS: readonly string[] = Object.keys(platformLabels);

function isPlatform(value: unknown): value is Platform {
  return typeof value === "string" && PLATFORM_KEYS.includes(value);
}

function isProfileEntry(value: unknown): value is ProfileEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.username === "string" &&
    entry.username.length > 0 &&
    typeof entry.url === "string" &&
    isPlatform(entry.platform)
  );
}

/**
 * Storage is user-writable and survives deploys: never trust its shape.
 * Anything unrecognised falls back to the default for that field.
 */
export function normalizeOnboarding(raw: OnboardingState): OnboardingState {
  const step = Number.isFinite(raw.step)
    ? Math.min(TOTAL_STEPS, Math.max(1, Math.trunc(raw.step)))
    : 1;
  const profiles = Array.isArray(raw.profiles)
    ? raw.profiles.filter(isProfileEntry).slice(0, 40)
    : [];
  const seq = Number.isFinite(raw.seq)
    ? Math.max(profiles.length + 1, Math.trunc(raw.seq))
    : profiles.length + 1;

  return {
    step,
    seq,
    accountType:
      raw.accountType === "creator" || raw.accountType === "agency"
        ? raw.accountType
        : null,
    profiles,
    demoAcknowledged: raw.demoAcknowledged === true,
    frequency:
      raw.frequency === "daily" ||
      raw.frequency === "twiceWeekly" ||
      raw.frequency === "weekly"
        ? raw.frequency
        : DEFAULT_ONBOARDING.frequency,
    coverage:
      raw.coverage === "standard" || raw.coverage === "extended"
        ? raw.coverage
        : DEFAULT_ONBOARDING.coverage,
    highConfidenceAlerts: raw.highConfidenceAlerts !== false,
    weeklySummary: raw.weeklySummary !== false,
    emailEnabled: raw.emailEnabled === true,
    email: typeof raw.email === "string" ? raw.email.slice(0, 254) : "",
    completed: raw.completed === true,
  };
}
