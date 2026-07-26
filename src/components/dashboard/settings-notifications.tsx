"use client";

import * as React from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { copy } from "@/config/product";

import { useStoredPrefs } from "./workspace-prefs";

const STORAGE_KEY = "settings-notifications";
const TOAST_ID = "settings-notifications-saved";

const TOUCH_TARGET =
  "relative before:absolute before:-inset-3 before:content-[''] sm:before:content-none";

type NotificationPrefs = {
  email: boolean;
  dashboard: boolean;
  weeklySummary: boolean;
};

const DEFAULTS: NotificationPrefs = {
  email: true,
  dashboard: true,
  weeklySummary: true,
};

function normalize(value: NotificationPrefs): NotificationPrefs {
  return {
    email: value.email === true,
    dashboard: value.dashboard === true,
    weeklySummary: value.weeklySummary === true,
  };
}

const ROWS: readonly {
  key: keyof NotificationPrefs;
  label: string;
  body: string;
}[] = [
  {
    key: "email",
    label: copy.onboarding.steps.notifications.email,
    body: copy.onboarding.steps.notifications.emailBody,
  },
  {
    key: "dashboard",
    label: copy.onboarding.steps.notifications.dashboard,
    body: copy.onboarding.steps.notifications.dashboardBody,
  },
  {
    key: "weeklySummary",
    label: copy.onboarding.steps.monitoring.weekly,
    body: copy.onboarding.steps.monitoring.weeklyBody,
  },
];

const text = { saved: "Saved" } as const;

/** Where the workspace is allowed to reach you. Nothing else. */
export function SettingsNotifications() {
  const [prefs, update] = useStoredPrefs(STORAGE_KEY, DEFAULTS, normalize);

  const save = React.useCallback(
    (key: keyof NotificationPrefs, checked: boolean) => {
      update({ [key]: checked } as Partial<NotificationPrefs>);
      toast.success(text.saved, { id: TOAST_ID });
    },
    [update]
  );

  return (
    <ul className="divide-y divide-edge-faint border-y border-edge">
      {ROWS.map((row) => {
        const labelId = `settings-notify-${row.key}`;
        return (
          <li
            key={row.key}
            className="flex items-start justify-between gap-5 py-4"
          >
            <div className="min-w-0">
              <p id={labelId} className="text-[14px] font-medium text-ink">
                {row.label}
              </p>
              <p className="mt-0.5 max-w-[52ch] text-[13px] leading-relaxed text-ink-soft">
                {row.body}
              </p>
            </div>
            <Switch
              checked={prefs[row.key]}
              onCheckedChange={(checked) => save(row.key, checked)}
              aria-labelledby={labelId}
              className={`mt-1 ${TOUCH_TARGET}`}
            />
          </li>
        );
      })}
    </ul>
  );
}
