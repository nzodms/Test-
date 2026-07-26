"use client";

import { Switch } from "@/components/ui/switch";
import { Tabs, TabsSegment, TabsSegmentTrigger } from "@/components/ui/tabs";
import { copy } from "@/config/product";
import { ChoiceGroup } from "./choice-group";
import {
  coverageOptions,
  frequencyOptions,
  local,
  type CoverageLevel,
  type OnboardingState,
  type OnboardingUpdate,
  type ScanFrequency,
} from "./state";

const TOUCH_TARGET =
  "relative before:absolute before:-inset-3 before:content-[''] sm:before:content-none";

function ToggleRow({
  id,
  label,
  body,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  body: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-edge py-4">
      <div className="min-w-0">
        <p id={id} className="text-[14px] font-medium text-ink">
          {label}
        </p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{body}</p>
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

export function StepMonitoring({
  state,
  update,
}: {
  state: OnboardingState;
  update: OnboardingUpdate;
}) {
  const monitoring = copy.onboarding.steps.monitoring;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-label">{monitoring.frequency}</h2>
        <Tabs
          value={state.frequency}
          onValueChange={(value) =>
            update((prev) => ({ ...prev, frequency: value as ScanFrequency }))
          }
          className="mt-3"
        >
          <TabsSegment
            aria-label={local.frequencyLegend}
            className="w-full sm:w-auto"
          >
            {frequencyOptions.map((option) => (
              <TabsSegmentTrigger
                key={option.value}
                value={option.value}
                className="h-11 flex-1 px-3 sm:h-8 sm:flex-none"
              >
                {option.title}
              </TabsSegmentTrigger>
            ))}
          </TabsSegment>
        </Tabs>
        <p className="mt-2 text-[13px] text-ink-soft">
          {frequencyOptions.find((option) => option.value === state.frequency)
            ?.body ?? ""}
        </p>
      </section>

      <section>
        <h2 className="text-label">{monitoring.coverage}</h2>
        <ChoiceGroup
          label={local.coverageLegend}
          options={coverageOptions}
          value={state.coverage}
          onChange={(coverage: CoverageLevel) =>
            update((prev) => ({ ...prev, coverage }))
          }
          className="mt-3"
        />
      </section>

      <section className="border-t border-edge">
        <ToggleRow
          id="onboarding-alerts-label"
          label={monitoring.alerts}
          body={monitoring.alertsBody}
          checked={state.highConfidenceAlerts}
          onChange={(checked) =>
            update((prev) => ({ ...prev, highConfidenceAlerts: checked }))
          }
        />
        <ToggleRow
          id="onboarding-weekly-label"
          label={monitoring.weekly}
          body={monitoring.weeklyBody}
          checked={state.weeklySummary}
          onChange={(checked) =>
            update((prev) => ({ ...prev, weeklySummary: checked }))
          }
        />
      </section>
    </div>
  );
}
