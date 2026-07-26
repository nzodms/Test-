"use client";

import {
  Tabs,
  TabsContent,
  TabsSegment,
  TabsSegmentTrigger,
} from "@/components/ui/tabs";
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

/**
 * Two decisions, deliberately given different controls: how wide a
 * pass goes is an explained choice on the record, how often it runs
 * is a setting.
 */
export function StepMonitoring({
  state,
  update,
}: {
  state: OnboardingState;
  update: OnboardingUpdate;
}) {
  return (
    <div>
      <section>
        <h2 className="text-[15px] font-medium text-ink">
          {local.monitoring.coverageHeading}
        </h2>
        <ChoiceGroup
          label={local.monitoring.coverageLegend}
          options={coverageOptions}
          value={state.coverage}
          onChange={(coverage: CoverageLevel) =>
            update((prev) => ({ ...prev, coverage }))
          }
          className="mt-3"
        />
      </section>

      <section className="mt-10">
        <h2 className="text-[15px] font-medium text-ink">
          {local.monitoring.frequencyHeading}
        </h2>
        <Tabs
          value={state.frequency}
          onValueChange={(value) =>
            update((prev) => ({ ...prev, frequency: value as ScanFrequency }))
          }
          className="mt-3"
        >
          <TabsSegment
            aria-label={local.monitoring.frequencyLegend}
            className="flex w-full sm:inline-flex sm:w-auto"
          >
            {frequencyOptions.map((option) => (
              <TabsSegmentTrigger
                key={option.value}
                value={option.value}
                className="h-11 flex-1 whitespace-nowrap rounded-xs px-2 text-[14.5px] sm:h-10 sm:flex-none sm:px-4"
              >
                {option.title}
              </TabsSegmentTrigger>
            ))}
          </TabsSegment>
          {frequencyOptions.map((option) => (
            <TabsContent
              key={option.value}
              value={option.value}
              className="mt-3 text-[14.5px] leading-relaxed text-ink-soft"
            >
              {option.body}
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
