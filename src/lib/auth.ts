"use client";

import { createClient } from "@/lib/supabase/client";
import { DEMO_SESSION_COOKIE, isSupabaseConfigured } from "@/lib/demo-mode";

/**
 * Client-side auth facade. Every auth surface goes through here so
 * the demo fallback stays in one place.
 */

export type AuthResult =
  | { ok: true; requiresConfirmation?: boolean }
  | { ok: false; error: string };

function siteUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/* ── demo-mode branch ──────────────────────────────────────────── */

function startDemoSession() {
  // 7-day demo session, readable by the middleware.
  document.cookie = `${DEMO_SESSION_COOKIE}=1; path=/; max-age=${7 * 24 * 3600}; samesite=lax`;
}

export function endDemoSession() {
  document.cookie = `${DEMO_SESSION_COOKIE}=; path=/; max-age=0`;
}

export function isDemoClient(): boolean {
  return !isSupabaseConfigured();
}

/* ── unified operations ────────────────────────────────────────── */

export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) {
    startDemoSession();
    return { ok: true };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: friendly(error.message) };
  return { ok: true };
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) {
    startDemoSession();
    return { ok: true };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/onboarding`,
    },
  });
  if (error) return { ok: false, error: friendly(error.message) };
  const requiresConfirmation = !data.session;
  return { ok: true, requiresConfirmation };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) {
    startDemoSession();
    return { ok: true };
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl()}/auth/callback?next=/dashboard` },
  });
  if (error) return { ok: false, error: friendly(error.message) };
  return { ok: true };
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) {
    // Demo mode: behave like success so the flow can be exercised.
    return { ok: true };
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/dashboard/settings`,
  });
  if (error) return { ok: false, error: friendly(error.message) };
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  if (!supabase) {
    endDemoSession();
    return;
  }
  await supabase.auth.signOut();
}

/** Map raw Supabase errors to calm, human sentences. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "That email and password combination doesn't match our records.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email address first — check your inbox for the link.";
  if (m.includes("user already registered"))
    return "An account already exists for this email. Try signing in instead.";
  if (m.includes("password should be"))
    return "Passwords need at least 8 characters.";
  if (m.includes("rate limit"))
    return "Too many attempts. Wait a moment and try again.";
  return message;
}
