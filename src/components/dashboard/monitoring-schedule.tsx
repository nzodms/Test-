"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsSegment,
  TabsSegmentTrigger,
} from "@/components/ui/tabs";
import { copy } from "@/config/product";

import { oneOf, useStoredPrefs } from "./workspace-prefs";

const STORAGE_KEY = "monitoring-prefs";
const TOAST_ID = "monitoring-prefs-saved";

/* A wide invisible hit area on touch, none on pointer devices. */
const TOUCH_TARGET =
  "relative before:absolute before:-inset-3 before:content-[''] sm:before:content-none";

type Frequency = "daily" | "twiceWeekly" | "weekly";
type Coverage = "standard" | "extended";

type SchedulePrefs = {
  frequency: Frequency;
  coverage: Coverage;
  highConfidenceAlerts: boolean;
  weeklySummary: boolean;
};

const FREQUENCIES: readonly { value: Frequency; label: string; body: string }[] =
  [
    { value: "daily", label: "Daily", body: "A full pass every day." },
    {
      value: "twiceWeekly",
      label: "Twice weekly",
      body: "A full pass on Monday and Thursday.",
    },
    { value: "weekly", label: "Weekly", body: "A full pass every Monday." },
  ];

const COVERAGES: readonly { value: Coverage; label: string; body: string }[] = [
  {
    value: "standard",
    label: "Standard",
    body: "Indexed websites, mirrors and public archives.",
  },
  {
    value: "extended",
    label: "Extended",
    body: "Adds indexed public forums and channels. Slower, wider.",
  },
];

const DEFAULTS: SchedulePrefs = {
  frequency: "weekly",
  coverage: "standard",
  highConfidenceAlerts: true,
  weeklySummary: true,
};

function normalize(value: SchedulePrefs): SchedulePrefs {
  return {
    frequency: oneOf(
      value.frequency,
      FREQUENCIES.map((option) => option.value),
      DEFAULTS.frequency
    ),
    coverage: oneOf(
      value.coverage,
      COVERAGES.map((option) => option.value),
      DEFAULTS.coverage
    ),
    highConfidenceAlerts: value.highConfidenceAlerts !== false,
    weeklySummary: value.weeklySummary !== false,
  };
}

const text = {
  saved: "Saved",
  frequency: copy.onboarding.steps.monitoring.frequency,
  coverage: copy.onboarding.steps.monitoring.coverage,
  alerts: copy.onboarding.steps.monitoring.alerts,
  alertsBody: copy.onboarding.steps.monitoring.alertsBody,
  weekly: copy.onboarding.steps.monitoring.weekly,
  weeklyBody: copy.onboarding.steps.monitoring.weeklyBody,
} as const;

function ToggleRow({
  id,
  label,
  body,
  checked,
  onChange,
  last = false,
}: {
  id: string;
  label: string;
  body: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-5 py-4 ${
        last ? "" : "border-b border-edge"
      }`}
    >
      <div className="min-w-0">
        <p id={id} className="text-[14px] font-medium text-ink">
          {label}
        </p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">
          {body}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-labelledby={id}
        className={`mt-1 ${TOUCH_TARGET}`}
      />
    </div>
  );
}

/**
 * The schedule the watching runs on. Every control writes through to
 * local storage the moment it changes and confirms once — a single
 * replacing toast, never a stack of them.
 */
export function MonitoringSchedule() {
  const [prefs, update] = useStoredPrefs(STORAGE_KEY, DEFAULTS, normalize);

  const save = React.useCallback(
    (patch: Partial<SchedulePrefs>) => {
      update(patch);
      toast.success(text.saved, { id: TOAST_ID });
    },
    [update]
  );

  const coverage =
    COVERAGES.find((option) => option.value === prefs.coverage) ?? COVERAGES[0];

  return (
    <div className="surface-mineral rounded-lg px-4 py-1 sm:px-5">
      <Tabs
        value={prefs.frequency}
        onValueChange={(value) => save({ frequency: value as Frequency })}
        className="flex flex-col gap-3 border-b border-edge py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
      >
        <div className="min-w-0">
          <p id="schedule-frequency" className="text-[14px] font-medium text-ink">
            {text.frequency}
          </p>
          {FREQUENCIES.map((option) => (
            <TabsContent
              key={option.value}
              value={option.value}
              className="mt-0.5 text-[13px] leading-relaxed text-ink-soft"
            >
              {option.body}
            </TabsContent>
          ))}
        </div>
        <TabsSegment
          aria-labelledby="schedule-frequency"
          className="w-full shrink-0 bg-paper sm:w-auto"
        >
          {FREQUENCIES.map((option) => (
            <TabsSegmentTrigger
              key={option.value}
              value={option.value}
              className="h-11 flex-1 whitespace-nowrap px-2 text-[12px] sm:h-8 sm:flex-none sm:px-2.5 sm:text-[13px]"
            >
              {option.label}
            </TabsSegmentTrigger>
          ))}
        </TabsSegment>
      </Tabs>

      <div className="flex flex-col gap-3 border-b border-edge py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p id="schedule-coverage" className="text-[14px] font-medium text-ink">
            {text.coverage}
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">
            {coverage?.body}
          </p>
        </div>
        <Select
          value={prefs.coverage}
          onValueChange={(value) => save({ coverage: value as Coverage })}
        >
          <SelectTrigger
            aria-labelledby="schedule-coverage"
            className="h-11 w-full shrink-0 sm:h-9 sm:w-[190px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COVERAGES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ToggleRow
        id="schedule-alerts"
        label={text.alerts}
        body={text.alertsBody}
        checked={prefs.highConfidenceAlerts}
        onChange={(checked) => save({ highConfidenceAlerts: checked })}
      />
      <ToggleRow
        id="schedule-weekly"
        label={text.weekly}
        body={text.weeklyBody}
        checked={prefs.weeklySummary}
        onChange={(checked) => save({ weeklySummary: checked })}
        last
      />
    </div>
  );
}
