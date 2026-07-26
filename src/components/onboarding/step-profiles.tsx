"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { copy } from "@/config/product";
import { parseSearchQuery, platformLabels, type Platform } from "@/lib/validation";
import {
  local,
  profileCountLabel,
  type OnboardingState,
  type OnboardingUpdate,
} from "./state";

/** "" when empty (allowed), null when the value can't be a URL. */
function normalizeProfileUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return "";
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
}

export function StepProfiles({
  state,
  update,
}: {
  state: OnboardingState;
  update: OnboardingUpdate;
}) {
  const [username, setUsername] = React.useState("");
  const [platform, setPlatform] = React.useState<Platform>("onlyfans");
  const [url, setUrl] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [urlError, setUrlError] = React.useState<string | null>(null);
  const usernameRef = React.useRef<HTMLInputElement>(null);

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = parseSearchQuery(username, platform);
    if (!parsed.ok) {
      setError(copy.landing.errors[parsed.error]);
      usernameRef.current?.focus();
      return;
    }
    const normalizedUrl = normalizeProfileUrl(url);
    if (normalizedUrl === null) {
      setUrlError(local.invalidUrl);
      return;
    }
    const resolvedPlatform = parsed.value.platform ?? platform;
    const duplicate = state.profiles.some(
      (profile) =>
        profile.username === parsed.value.username &&
        profile.platform === resolvedPlatform
    );
    if (duplicate) {
      setError(local.duplicate);
      usernameRef.current?.focus();
      return;
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
    setUsername("");
    setUrl("");
    setError(null);
    setUrlError(null);
    setPlatform(resolvedPlatform);
    usernameRef.current?.focus();
  };

  const remove = (id: string) => {
    update((prev) => ({
      ...prev,
      profiles: prev.profiles.filter((profile) => profile.id !== id),
    }));
  };

  return (
    <div>
      <form
        onSubmit={add}
        noValidate
        className="rounded-md border border-edge bg-mineral p-4 sm:p-5"
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
          <Field
            label={copy.onboarding.steps.profiles.username}
            htmlFor="onboarding-username"
            error={error ?? undefined}
          >
            <Input
              id="onboarding-username"
              ref={usernameRef}
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                if (error) setError(null);
              }}
              placeholder={local.usernamePlaceholder}
              aria-invalid={error !== null}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className="h-11 bg-paper sm:h-9"
            />
          </Field>
          <Field
            label={copy.onboarding.steps.profiles.platform}
            htmlFor="onboarding-platform"
          >
            <Select
              value={platform}
              onValueChange={(value) => setPlatform(value as Platform)}
            >
              <SelectTrigger
                id="onboarding-platform"
                aria-label={copy.onboarding.steps.profiles.platform}
                className="h-11 sm:h-9"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(platformLabels) as Platform[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {platformLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
          <Field
            label={copy.onboarding.steps.profiles.url}
            htmlFor="onboarding-url"
            error={urlError ?? undefined}
            className="min-w-0 flex-1"
          >
            <Input
              id="onboarding-url"
              type="url"
              inputMode="url"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                if (urlError) setUrlError(null);
              }}
              placeholder={local.urlPlaceholder}
              aria-invalid={urlError !== null}
              autoComplete="off"
              spellCheck={false}
              className="h-11 bg-paper sm:h-9"
            />
          </Field>
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full shrink-0 sm:w-auto"
          >
            <Plus aria-hidden />
            {copy.onboarding.steps.profiles.add}
          </Button>
        </div>
      </form>

      <div className="mt-7">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-label">{copy.dashboard.sections.profiles}</h2>
          <span className="text-data tabular text-ink-soft">
            {profileCountLabel(state.profiles.length)}
          </span>
        </div>

        {state.profiles.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-edge-strong px-4 py-5 text-[13px] text-ink-soft">
            {local.profilesEmpty} {copy.onboarding.steps.profiles.empty}
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-edge border-y border-edge">
            {state.profiles.map((profile) => (
              <li key={profile.id} className="flex items-center gap-3 py-2.5">
                <Avatar name={profile.username} size="xs" />
                <span className="min-w-0 flex-1 truncate text-data text-ink">
                  {profile.username}
                </span>
                {profile.url ? (
                  <span className="hidden max-w-[180px] truncate text-data text-ink-soft md:block">
                    {profile.url.replace(/^https?:\/\//, "")}
                  </span>
                ) : null}
                <Badge variant="neutral" className="shrink-0">
                  {platformLabels[profile.platform]}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={local.removeProfile(profile.username)}
                  onClick={() => remove(profile.id)}
                  className="size-11 shrink-0 sm:size-9"
                >
                  <X aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-[13px] text-ink-soft">{local.addAnother}</p>
      </div>
    </div>
  );
}
