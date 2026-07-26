/**
 * Local persistence abstraction. Everything the demo stores goes
 * through here, under versioned keys — so swapping localStorage for
 * Supabase later means changing this module only.
 */

const PREFIX = "argus:v1:";

export function readStored<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export function writeStored<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode) — state lives in memory only.
  }
}

export function removeStored(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

/**
 * Deep-merge stored partials over defaults so adding fields to a
 * stored shape never resurrects stale/incomplete nested objects.
 */
export function mergeStored<T extends Record<string, unknown>>(
  defaults: T,
  stored: unknown
): T {
  if (typeof stored !== "object" || stored === null) return defaults;
  const out: Record<string, unknown> = { ...defaults };
  for (const [k, v] of Object.entries(stored)) {
    const base = (defaults as Record<string, unknown>)[k];
    if (
      typeof base === "object" &&
      base !== null &&
      !Array.isArray(base) &&
      typeof v === "object" &&
      v !== null &&
      !Array.isArray(v)
    ) {
      out[k] = mergeStored(base as Record<string, unknown>, v);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}
