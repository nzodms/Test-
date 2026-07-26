/**
 * DEMO MODE — isolation point.
 *
 * The entire demo fallback hangs off this module. When a real
 * Supabase project is configured, `isSupabaseConfigured()` flips to
 * true and the app uses real auth + persistence. To remove demo mode
 * later: delete this file, `src/lib/data/demo.ts`, and the branches
 * that reference them (grep for "demo-mode" / "isDemoMode").
 */

export const DEMO_SESSION_COOKIE = "halo-demo-session";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}
