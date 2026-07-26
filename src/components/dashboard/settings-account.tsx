"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { demoProfiles } from "@/lib/demo/scan-data";
import { useStoredPrefs } from "./workspace-prefs";

const STORAGE_KEY = "settings-account";
const TOAST_ID = "settings-account-saved";

const DEFAULT_NAME = demoProfiles[0]?.username ?? "";

const text = {
  displayName: "Display name",
  displayNameHint: "Shown in this workspace only",
  email: "Email",
  emailHint: "Managed by your sign-in method",
  emailPlaceholder: "Not connected in the demo workspace",
  save: "Save changes",
  saved: "Saved",
} as const;

/**
 * The two fields an account actually owns here. The address is read
 * from the sign-in method rather than edited, so it is shown and
 * locked rather than hidden.
 */
export function SettingsAccount() {
  // Persistence goes through the shared hook rather than a second
  // hand-rolled hydration effect: one pattern for stored preferences
  // across the workspace.
  const [stored, setStored] = useStoredPrefs(
    STORAGE_KEY,
    { displayName: DEFAULT_NAME },
    (value) => ({
      displayName:
        typeof value.displayName === "string" && value.displayName.trim()
          ? value.displayName
          : DEFAULT_NAME,
    })
  );

  const [draft, setDraft] = React.useState<string | null>(null);
  const current = draft ?? stored.displayName;
  const dirty = current.trim() !== stored.displayName;

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const value = current.trim();
    setStored({ displayName: value });
    setDraft(null);
    toast.success(text.saved, { id: TOAST_ID });
  };

  return (
    <form onSubmit={save} noValidate className="max-w-md">
      <Field
        label={text.displayName}
        htmlFor="settings-display-name"
        hint={text.displayNameHint}
      >
        <Input
          id="settings-display-name"
          value={current}
          onChange={(event) => setDraft(event.target.value)}
          autoComplete="nickname"
          spellCheck={false}
          maxLength={60}
          className="h-11 sm:h-9"
        />
      </Field>

      <Field
        label={text.email}
        htmlFor="settings-email"
        hint={text.emailHint}
        className="mt-4"
      >
        <Input
          id="settings-email"
          type="email"
          value=""
          readOnly
          disabled
          placeholder={text.emailPlaceholder}
          className="h-11 sm:h-9"
        />
      </Field>

      <Button
        type="submit"
        variant="secondary"
        size="lg"
        disabled={!dirty}
        className="mt-5 w-full sm:h-9 sm:w-auto sm:px-4 sm:text-sm"
      >
        {text.save}
      </Button>
    </form>
  );
}
