"use client";

import * as React from "react";

import { mergeStored, readStored, writeStored } from "@/lib/storage";

/**
 * Workspace preferences held in local storage.
 *
 * The first render always uses the defaults — stored values can only
 * be read once the browser exists — then the stored shape is merged
 * over them. `normalize` gets the last word, because storage is
 * user-writable and survives deploys: nothing read from it is
 * trusted as-is.
 */
export function useStoredPrefs<T extends Record<string, unknown>>(
  key: string,
  defaults: T,
  normalize: (value: T) => T = (value) => value
): [T, (patch: Partial<T>) => void] {
  const defaultsRef = React.useRef(defaults);
  const normalizeRef = React.useRef(normalize);
  const [value, setValue] = React.useState<T>(defaults);

  React.useEffect(() => {
    const stored = readStored<unknown>(key);
    if (stored === null) return;
    // One-time hydration from storage: the value cannot exist before
    // mount, so this setState in an effect is the supported pattern.
    setValue(normalizeRef.current(mergeStored(defaultsRef.current, stored)));
  }, [key]);

  const update = React.useCallback(
    (patch: Partial<T>) => {
      setValue((prev) => {
        const next = normalizeRef.current({ ...prev, ...patch });
        writeStored(key, next);
        return next;
      });
    },
    [key]
  );

  return [value, update];
}

/** Narrow an unknown stored value to one of a fixed set of options. */
export function oneOf<T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: T
): T {
  return options.includes(value as T) ? (value as T) : fallback;
}
