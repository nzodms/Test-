"use client";

import * as React from "react";

/**
 * useState persisted to localStorage under a namespaced key.
 * Hydration-safe: first render uses the fallback, then the stored
 * value is applied after mount. Used by settings forms and shell
 * preferences; swaps naturally for Supabase-backed preferences.
 */
export function usePersistentState<T>(
  key: string,
  fallback: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [state, setState] = React.useState<T>(fallback);
  const [hydrated, setHydrated] = React.useState(false);
  const storageKey = `halo:${key}`;

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      // One-time hydration from localStorage: the stored value can
      // only be read after mount (SSR has no window), so this
      // deliberate setState-in-effect is the supported pattern here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw !== null) setState(JSON.parse(raw) as T);
    } catch {
      // corrupted or unavailable storage — keep fallback
    }
    setHydrated(true);
  }, [storageKey]);

  const set = React.useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next =
          typeof value === "function" ? (value as (p: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [storageKey]
  );

  return [state, set, hydrated];
}
