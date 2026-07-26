"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motionTokens } from "@/lib/motion";
import {
  parseSearchQuery,
  platformLabels,
  type Platform,
} from "@/lib/validation";
import { controlHeight, SetupField } from "./field";
import {
  local,
  profileCountLabel,
  type OnboardingState,
  type OnboardingUpdate,
} from "./state";

/** "" when empty (allowed), null when the value cannot be a URL. */
function normalizeProfileUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return "";
  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * The profile the file is opened on.
 *
 * One profile is the point of the step; more can be added, which is
 * what an agency needs. The entry fields sit directly on the record —
 * there is no shaded form panel to fill in.
 */
export function StepProfile({
  state,
  update,
  advanceRef,
}: {
  state: OnboardingState;
  update: OnboardingUpdate;
  /** Continue commits whatever is typed, so nothing is lost. */
  advanceRef: React.RefObject<(() => boolean) | null>;
}) {
  const reduced = useReducedMotion() ?? false;
  const [username, setUsername] = React.useState("");
  const [platform, setPlatform] = React.useState<Platform>("onlyfans");
  const [url, setUrl] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [urlError, setUrlError] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [lastAdded, setLastAdded] = React.useState<string | null>(null);
  const usernameRef = React.useRef<HTMLInputElement>(null);

  const count = state.profiles.length;
  const hasProfiles = count > 0;
  const formOpen = !hasProfiles || adding;

  /** Returns true when a profile was recorded. */
  const commit = React.useCallback((): boolean => {
    const parsed = parseSearchQuery(username, platform);
    if (!parsed.ok) {
      setError(local.profile.errors[parsed.error]);
      usernameRef.current?.focus();
      return false;
    }
    const normalizedUrl = normalizeProfileUrl(url);
    if (normalizedUrl === null) {
      setUrlError(local.profile.invalidUrl);
      return false;
    }
    const resolvedPlatform = parsed.value.platform ?? platform;
    const duplicate = state.profiles.some(
      (profile) =>
        profile.username === parsed.value.username &&
        profile.platform === resolvedPlatform
    );
    if (duplicate) {
      setError(local.profile.duplicate);
      usernameRef.current?.focus();
      return false;
    }
    const fallbackUrl = normalizeProfileUrl(parsed.value.raw);
    update((prev) => ({
      ...prev,
      seq: prev.seq + 1,
      profiles: [
        ...prev.profiles,
        {
          id: `profile-${prev.seq}`,
          username: parsed.value.username,
          platform: resolvedPlatform,
          url: normalizedUrl || (fallbackUrl ?? ""),
        },
      ],
    }));
    setLastAdded(`profile-${state.seq}`);
    setUsername("");
    setUrl("");
    setError(null);
    setUrlError(null);
    setPlatform(resolvedPlatform);
    setAdding(false);
    return true;
  }, [platform, state, update, url, username]);

  /* Continue on an empty step should not dead-end the person: if
     something is typed, record it and move on. Re-registered every
     render so the hook always closes over the current fields. */
  React.useEffect(() => {
    const attempt = () => {
      if (state.profiles.length > 0) return true;
      return commit();
    };
    advanceRef.current = attempt;
    return () => {
      if (advanceRef.current === attempt) advanceRef.current = null;
    };
  });

  const remove = (id: string) => {
    update((prev) => ({
      ...prev,
      profiles: prev.profiles.filter((profile) => profile.id !== id),
    }));
  };

  return (
    <div>
      {formOpen ? (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            commit();
            usernameRef.current?.focus();
          }}
        >
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_11rem] sm:gap-4">
            <SetupField
              label={local.profile.username}
              htmlFor="setup-username"
              error={error ?? undefined}
            >
              <Input
                id="setup-username"
                ref={usernameRef}
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  if (error) setError(null);
                }}
                placeholder={local.profile.usernamePlaceholder}
                aria-invalid={error !== null}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className={controlHeight}
              />
            </SetupField>

            <SetupField label={local.profile.platform} htmlFor="setup-platform">
              <Select
                value={platform}
                onValueChange={(value) => setPlatform(value as Platform)}
              >
                <SelectTrigger
                  id="setup-platform"
                  aria-label={local.profile.platform}
                  className={controlHeight}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(platformLabels) as Platform[]).map((key) => (
                    <SelectItem key={key} value={key} className="py-2 text-[14.5px]">
                      {platformLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SetupField>
          </div>

          <SetupField
            label={local.profile.url}
            htmlFor="setup-url"
            error={urlError ?? undefined}
            className="mt-5"
          >
            <Input
              id="setup-url"
              type="url"
              inputMode="url"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                if (urlError) setUrlError(null);
              }}
              placeholder={local.profile.urlPlaceholder}
              aria-invalid={urlError !== null}
              autoComplete="off"
              spellCheck={false}
              className={controlHeight}
            />
          </SetupField>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="h-12 w-full text-[15px] sm:h-11 sm:w-auto"
            >
              <Plus aria-hidden />
              {local.profile.add}
            </Button>
            {hasProfiles ? (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => {
                  setAdding(false);
                  setError(null);
                  setUrlError(null);
                }}
                className="h-12 w-full text-[15px] sm:h-11 sm:w-auto"
              >
                {local.profile.cancelAdd}
              </Button>
            ) : null}
          </div>
        </form>
      ) : null}

      {hasProfiles ? (
        <div className={formOpen ? "mt-10" : ""}>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[15px] font-medium text-ink">
              {count === 1 ? local.profile.onFile : local.profile.onFilePlural}
            </h2>
            <span className="shrink-0 font-mono text-[12.5px] tabular text-ink-soft">
              {profileCountLabel(count)}
            </span>
          </div>

          <ul className="mt-3">
            {state.profiles.map((profile, index) => (
              <motion.li
                key={profile.id}
                initial={
                  reduced || profile.id !== lastAdded
                    ? false
                    : { opacity: 0, y: -6 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: motionTokens.duration.fast,
                  ease: motionTokens.ease.enter,
                }}
                className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-x-3 border-t border-edge py-3.5"
              >
                <span
                  aria-hidden
                  className="font-mono text-[12.5px] tabular text-ink-soft"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="text-subject block truncate text-[16.5px] text-ink">
                    @{profile.username}
                  </span>
                  <span className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[14px] text-ink-soft">
                    {platformLabels[profile.platform]}
                    {profile.url ? (
                      <span className="min-w-0 truncate font-mono text-[12.5px]">
                        {profile.url.replace(/^https?:\/\//, "")}
                      </span>
                    ) : null}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={local.profile.remove(profile.username)}
                  onClick={() => remove(profile.id)}
                  className="size-11 shrink-0"
                >
                  <X aria-hidden />
                </Button>
              </motion.li>
            ))}
          </ul>

          {!formOpen ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => {
                setAdding(true);
                window.setTimeout(() => usernameRef.current?.focus(), 0);
              }}
              className="mt-4 h-12 w-full justify-start px-0 text-[15px] sm:h-11 sm:w-auto sm:px-3"
            >
              <Plus aria-hidden />
              {local.profile.addAnother}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
