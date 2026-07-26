/**
 * Search input parsing: accepts `username`, `@username`, or a
 * profile URL, with an optional platform hint.
 */

export type Platform = "onlyfans" | "fansly" | "mym" | "other";

export interface ParsedQuery {
  username: string;
  platform: Platform | null;
  /** what the user actually typed, for display */
  raw: string;
}

export type ParseResult =
  | { ok: true; value: ParsedQuery }
  | { ok: false; error: "empty" | "invalid" | "tooShort" };

const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{1,29}$/i;

const PLATFORM_HOSTS: Record<string, Platform> = {
  "onlyfans.com": "onlyfans",
  "www.onlyfans.com": "onlyfans",
  "fansly.com": "fansly",
  "www.fansly.com": "fansly",
  "mym.fans": "mym",
  "www.mym.fans": "mym",
};

export function parseSearchQuery(
  raw: string,
  platformHint: Platform | null = null
): ParseResult {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { ok: false, error: "empty" };

  // Profile URL
  if (/^https?:\/\//i.test(trimmed) || /^[a-z0-9.-]+\.[a-z]{2,}\//i.test(trimmed)) {
    try {
      const url = new URL(
        /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
      );
      const host = url.hostname.toLowerCase();
      const platform = PLATFORM_HOSTS[host] ?? "other";
      const segment = url.pathname.split("/").filter(Boolean)[0] ?? "";
      const username = segment.replace(/^@/, "");
      if (!USERNAME_RE.test(username)) return { ok: false, error: "invalid" };
      return {
        ok: true,
        value: { username: username.toLowerCase(), platform, raw: trimmed },
      };
    } catch {
      return { ok: false, error: "invalid" };
    }
  }

  // @handle or bare username
  const handle = trimmed.replace(/^@/, "");
  if (handle.length < 3) return { ok: false, error: "tooShort" };
  if (!USERNAME_RE.test(handle)) return { ok: false, error: "invalid" };
  return {
    ok: true,
    value: { username: handle.toLowerCase(), platform: platformHint, raw: trimmed },
  };
}

export const platformLabels: Record<Platform, string> = {
  onlyfans: "OnlyFans",
  fansly: "Fansly",
  mym: "MYM",
  other: "Other",
};
