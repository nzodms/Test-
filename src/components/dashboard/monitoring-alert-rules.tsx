"use client";

import * as React from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";

import { useStoredPrefs } from "./workspace-prefs";

const STORAGE_KEY = "monitoring-alert-rules";
const TOAST_ID = "monitoring-alert-rules-saved";

const TOUCH_TARGET =
  "relative before:absolute before:-inset-3 before:content-[''] sm:before:content-none";

type AlertRules = {
  highConfidence: boolean;
  newCategory: boolean;
  reappearance: boolean;
};

const DEFAULTS: AlertRules = {
  highConfidence: true,
  newCategory: false,
  reappearance: true,
};

const RULES: readonly {
  key: keyof AlertRules;
  label: string;
  body: string;
}[] = [
  {
    key: "highConfidence",
    label: "High-confidence match detected",
    body: "Alert as soon as a new match is graded high confidence.",
  },
  {
    key: "newCategory",
    label: "New source category appears",
    body: "Alert the first time content is found on a category you have not seen before.",
  },
  {
    key: "reappearance",
    label: "Content reappears after removal",
    body: "Alert when a source republishes content a removal already covered.",
  },
];

const text = { saved: "Saved" } as const;

function normalize(value: AlertRules): AlertRules {
  return {
    highConfidence: value.highConfidence === true,
    newCategory: value.newCategory === true,
    reappearance: value.reappearance === true,
  };
}

/**
 * What is worth interrupting you for. Rules are additive and quiet
 * by default: everything is still recorded in the workspace whether
 * a rule fires or not.
 */
export function MonitoringAlertRules() {
  const [rules, update] = useStoredPrefs(STORAGE_KEY, DEFAULTS, normalize);

  const save = React.useCallback(
    (key: keyof AlertRules, checked: boolean) => {
      update({ [key]: checked } as Partial<AlertRules>);
      toast.success(text.saved, { id: TOAST_ID });
    },
    [update]
  );

  return (
    <ul className="divide-y divide-edge-faint border-y border-edge">
      {RULES.map((rule) => {
        const labelId = `alert-rule-${rule.key}`;
        return (
          <li
            key={rule.key}
            className="flex items-start justify-between gap-5 py-4"
          >
            <div className="min-w-0">
              <p id={labelId} className="text-[14px] font-medium text-ink">
                {rule.label}
              </p>
              <p className="mt-0.5 max-w-[60ch] text-[13px] leading-relaxed text-ink-soft">
                {rule.body}
              </p>
            </div>
            <Switch
              checked={rules[rule.key]}
              onCheckedChange={(checked) => save(rule.key, checked)}
              aria-labelledby={labelId}
              className={`mt-1 ${TOUCH_TARGET}`}
            />
          </li>
        );
      })}
    </ul>
  );
}
