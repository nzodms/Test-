import { z } from "zod";
import { platformLabels, type Platform } from "@/lib/validation";

/* ════════════════════════════════════════════════════════════════
   Onboarding state — the single shape persisted under
   `argus:v1:onboarding`. Everything here is pure: no window access,
   no timers, safe to import from server or client.

   The stored shape is deliberately unchanged: a workspace opened in
   an earlier session still resumes. Only the labels around it moved.
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

/* ── Copy ────────────────────────────────────────────────────────
   Defined here rather than in the shared product config: these
   strings belong to this flow only, and the flow owns its wording. */

export const local = {
  /* Chrome */
  documentTitle: "Workspace setup",
  headerLine: "Workspace setup",
  exit: "Save and exit",
  back: "Back",
  next: "Continue",
  create: "Create workspace",
  restart: "Start over",
  storageNote: "Answers are kept in this browser only.",
  resume: "Resuming where you left off.",
  loading: "Loading your setup",
  demoMarker: "DEMO",
  demoNote:
    "Demonstration setup. Nothing is submitted and no scan is performed.",
  railLabel: "Setup steps",
  change: "Change",
  notSet: "Not set",

  stepNames: [
    "Usage",
    "Profile",
    "Relationship",
    "Monitoring",
    "Alerts",
    "Workspace",
  ],
  stepCounter: (step: number) => `Step ${step} of ${TOTAL_STEPS}`,

  /* 01 — Usage */
  usage: {
    title: "How will you use Argus?",
    blurb: "This shapes the workspace. It can be changed later.",
    legend: "How you will use Argus",
    creator: "Creator",
    creatorBody: "Protect your own public profile and content.",
    agency: "Agency",
    agencyBody: "Protect the profiles of the creators you represent.",
  },

  /* 02 — Profile */
  profile: {
    title: "Add the public profile you want to protect",
    blurb:
      "A public username, handle or profile URL. Argus reads indexed public sources only.",
    username: "Username",
    usernamePlaceholder: "username, @handle or profile URL",
    platform: "Platform",
    url: "Profile URL (optional)",
    urlPlaceholder: "https://",
    add: "Add profile",
    addAnother: "Add another profile",
    cancelAdd: "Cancel",
    onFile: "Profile on file",
    onFilePlural: "Profiles on file",
    remove: (username: string) => `Remove ${username}`,
    duplicate: "That profile is already on file.",
    invalidUrl: "That does not look like a profile URL.",
    errors: {
      empty: "Enter a username, @handle or profile URL.",
      invalid: "That does not look like a username or profile URL.",
      tooShort: "Usernames have at least 3 characters.",
    },
  },

  /* 03 — Relationship */
  relationship: {
    title: "Confirm your relationship to this profile",
    blurb:
      "Findings and removal requests are released only to a verified owner.",
    subjectLabel: "Profile",
    subjectNone: "No profile added yet",
    creatorClaim: "I confirm this is my own public profile.",
    agencyClaim:
      "I confirm I am authorised to act for the owner of this profile.",
    demoBody:
      "Ownership verification is required before any removal request is sent. In this demonstration setup no verification is performed, nothing is submitted, and no scan is run.",
    methodsHeading: "How ownership will be verified",
    methods: [
      {
        name: "Profile link",
        body: "A temporary code placed in your public bio.",
      },
      { name: "One-time code", body: "A code sent through the platform." },
      {
        name: "Connected account",
        body: "Sign-in through a linked social account.",
      },
      { name: "Manual review", body: "Our team checks documentation you provide." },
    ],
    methodsNote: "None of these are available yet.",
    confirmed: "Confirmed — verification pending",
  },

  /* 04 — Monitoring */
  monitoring: {
    title: "Choose what Argus should monitor",
    blurb: "How wide each pass goes, and how often it runs.",
    coverageHeading: "Indexed public sources",
    coverageLegend: "Source coverage",
    frequencyHeading: "How often Argus re-scans",
    frequencyLegend: "Scan frequency",
  },

  /* 05 — Alerts */
  alerts: {
    title: "Choose how you want to be notified",
    blurb: "Only the channels you turn on. Nothing else.",
    highConfidence: "High-confidence alerts",
    highConfidenceBody:
      "Immediate notice when a match is very likely your content.",
    weekly: "Weekly summary",
    weeklyBody: "A short digest of new detections and changes.",
    email: "Email",
    emailBody: "Alerts and summaries sent to your inbox.",
    emailAddress: "Email address",
    workspace: "Workspace",
    workspaceBody: "Every finding stays visible in the workspace.",
    alwaysOn: "Always on",
    integrations: "Slack and webhooks",
    integrationsBody: "Planned. Not available yet.",
  },

  /* 06 — Workspace */
  workspace: {
    title: "Preparing your workspace",
    assembly: "Workspace assembly",
    lines: [
      "Creating workspace",
      "Adding profile",
      "Preparing monitoring",
      "Configuring alerts",
      "Workspace ready",
    ],
    ready: "Workspace ready",
    readyNote:
      "Your setup is saved in this browser. The entries above can still be reopened if you want to change one.",
    open: "Open workspace",
    pending: "Preparing",
  },

  /* Derived values */
  profilesNone: "None yet",
  reachWorkspace: "Workspace only",
  alertsBoth: "High confidence, weekly summary",
  alertsHigh: "High confidence",
  alertsWeekly: "Weekly summary",
  alertsNone: "No alerts",

  guards: {
    usage: "Choose Creator or Agency to continue.",
    profile: "Add the profile you want to protect to continue.",
    relationship: "Confirm your relationship to this profile to continue.",
    email: "Enter a valid email address, or turn email off.",
  },
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

/**
 * The heading an entry carries while it is open. The last entry is
 * the one that changes: it says what it is doing, then what it did.
 */
export function stepMeta(
  step: number,
  assembled = false
): { title: string; blurb?: string } {
  switch (step) {
    case 1:
      return { title: local.usage.title, blurb: local.usage.blurb };
    case 2:
      return { title: local.profile.title, blurb: local.profile.blurb };
    case 3:
      return {
        title: local.relationship.title,
        blurb: local.relationship.blurb,
      };
    case 4:
      return { title: local.monitoring.title, blurb: local.monitoring.blurb };
    case 5:
      return { title: local.alerts.title, blurb: local.alerts.blurb };
    default:
      return {
        title: assembled ? local.workspace.ready : local.workspace.title,
      };
  }
}

export function accountLabel(type: AccountType | null): string | null {
  if (type === "creator") return local.usage.creator;
  if (type === "agency") return local.usage.agency;
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
  return state.emailEnabled && email.length > 0 ? email : local.reachWorkspace;
}

/** The subject of the file: the first profile added, if any. */
export function subjectUsername(state: OnboardingState): string | null {
  return state.profiles[0]?.username ?? null;
}

export function profileLine(state: OnboardingState): string | null {
  const first = state.profiles[0];
  if (!first) return null;
  const head = `@${first.username} · ${platformLabels[first.platform]}`;
  const extra = state.profiles.length - 1;
  return extra > 0 ? `${head} · +${extra} more` : head;
}

/**
 * What a completed step reads as once it collapses back into the
 * ledger. This is the summary that stays visible while the rest of
 * the setup is filled in.
 */
export function stepValue(
  step: number,
  state: OnboardingState
): string | null {
  switch (step) {
    case 1:
      return accountLabel(state.accountType);
    case 2:
      return profileLine(state);
    case 3:
      return state.demoAcknowledged ? local.relationship.confirmed : null;
    case 4:
      return `${coverageLabel(state.coverage)} · ${frequencyLabel(state.frequency)}`;
    case 5:
      return `${alertsLabel(state)} · ${reachLabel(state)}`;
    default:
      return null;
  }
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

/** The reason the step cannot be left yet, or null when it is valid. */
export function stepGuard(state: OnboardingState): string | null {
  switch (state.step) {
    case 1:
      return state.accountType === null ? local.guards.usage : null;
    case 2:
      return state.profiles.length === 0 ? local.guards.profile : null;
    case 3:
      return state.demoAcknowledged ? null : local.guards.relationship;
    case 5:
      return isEmailValid(state) ? null : local.guards.email;
    default:
      return null;
  }
}

/**
 * The first entry that is still incomplete, or null when the whole
 * record holds. Stepping back through the rail can leave an earlier
 * entry unset, so this is checked once more before the workspace is
 * created.
 */
export function firstIncompleteStep(state: OnboardingState): number | null {
  for (let step = 1; step < TOTAL_STEPS; step++) {
    if (stepGuard({ ...state, step }) !== null) return step;
  }
  return null;
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

/**
 * How a step takes over Continue: it hands its validator to the flow
 * and receives the teardown. A callback rather than the ref itself,
 * so nothing reads a ref during render.
 */
export type RegisterAdvance = (
  attempt: (() => boolean) | null
) => () => void;
