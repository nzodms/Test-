"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { copy } from "@/config/product";
import {
  parseSearchQuery,
  platformLabels,
  type Platform,
} from "@/lib/validation";

export interface NewProfile {
  username: string;
  platform: Platform;
  url: string;
}

const text = {
  title: copy.onboarding.steps.profiles.add,
  description: copy.onboarding.steps.profiles.blurb,
  username: copy.onboarding.steps.profiles.username,
  platform: copy.onboarding.steps.profiles.platform,
  url: copy.onboarding.steps.profiles.url,
  usernamePlaceholder: "username, @handle or profile URL",
  urlPlaceholder: "https://",
  duplicate: "That profile is already being monitored.",
  invalidUrl: "That doesn't look like a profile URL.",
  cancel: "Cancel",
  submit: copy.onboarding.steps.profiles.add,
} as const;

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
 * Adding a profile is the same act as the first search: a public
 * username, optionally a public URL. Nothing private is requested,
 * and nothing is verified here — verification is its own step.
 */
export function ProfilesAddDialog({
  open,
  onOpenChange,
  existing,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing: readonly { username: string; platform: string }[];
  onAdd: (profile: NewProfile) => void;
}) {
  const [username, setUsername] = React.useState("");
  const [platform, setPlatform] = React.useState<Platform>("onlyfans");
  const [url, setUrl] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [urlError, setUrlError] = React.useState<string | null>(null);

  const reset = React.useCallback(() => {
    setUsername("");
    setUrl("");
    setError(null);
    setUrlError(null);
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = parseSearchQuery(username, platform);
    if (!parsed.ok) {
      setError(copy.landing.errors[parsed.error]);
      return;
    }
    const normalizedUrl = normalizeProfileUrl(url);
    if (normalizedUrl === null) {
      setUrlError(text.invalidUrl);
      return;
    }
    const resolvedPlatform = parsed.value.platform ?? platform;
    const label = platformLabels[resolvedPlatform];
    const duplicate = existing.some(
      (entry) =>
        entry.username === parsed.value.username && entry.platform === label
    );
    if (duplicate) {
      setError(text.duplicate);
      return;
    }

    onAdd({
      username: parsed.value.username,
      platform: resolvedPlatform,
      url: normalizedUrl,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{text.title}</DialogTitle>
          <DialogDescription>{text.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_150px]">
            <Field
              label={text.username}
              htmlFor="add-profile-username"
              error={error ?? undefined}
            >
              <Input
                id="add-profile-username"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  if (error) setError(null);
                }}
                placeholder={text.usernamePlaceholder}
                aria-invalid={error !== null}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="h-11 sm:h-9"
              />
            </Field>

            <Field label={text.platform} htmlFor="add-profile-platform">
              <Select
                value={platform}
                onValueChange={(value) => setPlatform(value as Platform)}
              >
                <SelectTrigger
                  id="add-profile-platform"
                  aria-label={text.platform}
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

          <Field
            label={text.url}
            htmlFor="add-profile-url"
            error={urlError ?? undefined}
            className="mt-4"
          >
            <Input
              id="add-profile-url"
              type="url"
              inputMode="url"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                if (urlError) setUrlError(null);
              }}
              placeholder={text.urlPlaceholder}
              aria-invalid={urlError !== null}
              autoComplete="off"
              spellCheck={false}
              className="h-11 sm:h-9"
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="sm:h-9 sm:px-4 sm:text-sm"
              onClick={() => onOpenChange(false)}
            >
              {text.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="sm:h-9 sm:px-4 sm:text-sm"
            >
              {text.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
