"use client";

/**
 * Onboarding state — persisted locally so a refresh never loses
 * progress. When Supabase is configured this same shape maps 1:1
 * onto the public.onboarding_state table (see the SQL migration);
 * persistState is the single hook point to add the upsert.
 */

export interface OnboardingState {
  step: number;
  company: {
    name: string;
    size: string;
    industry: string;
  };
  goals: string[];
  sources: string[];
  alerts: {
    channel: "slack" | "email" | "both";
    digest: "daily" | "weekly" | "off";
    quietHours: boolean;
    sensitivity: "conservative" | "balanced" | "eager";
  };
  completed: boolean;
}

export const initialOnboardingState: OnboardingState = {
  step: 1,
  company: { name: "", size: "", industry: "" },
  goals: [],
  sources: [],
  alerts: {
    channel: "slack",
    digest: "weekly",
    quietHours: true,
    sensitivity: "balanced",
  },
  completed: false,
};

const KEY = "halo-onboarding-v1";

export function loadOnboardingState(): OnboardingState {
  if (typeof window === "undefined") return initialOnboardingState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialOnboardingState;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    return { ...initialOnboardingState, ...parsed };
  } catch {
    return initialOnboardingState;
  }
}

export function persistOnboardingState(state: OnboardingState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    // Supabase hook point: upsert into public.onboarding_state here.
  } catch {
    // Storage unavailable (private mode) — the flow still works in memory.
  }
}

export function clearOnboardingState(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
