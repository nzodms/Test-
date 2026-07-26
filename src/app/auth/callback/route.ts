import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth + email-confirmation callback. Supabase redirects here with
 * a `code` to exchange for a session. In demo mode this route just
 * forwards to the app.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/overview";
  const safeNext = next.startsWith("/") ? next : "/overview";

  const supabase = await createClient();
  if (supabase && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(
          "The sign-in link is invalid or has expired. Please try again."
        )}`
      );
    }
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
