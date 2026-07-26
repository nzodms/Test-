"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/misc";
import { Label } from "@/components/ui/label";
import { copy } from "@/config/product";
import { local, type OnboardingState, type OnboardingUpdate } from "./state";

const TOUCH_TARGET =
  "relative before:absolute before:-inset-3 before:content-[''] sm:before:content-none";

export function StepOwnership({
  state,
  update,
}: {
  state: OnboardingState;
  update: OnboardingUpdate;
}) {
  const methods = copy.onboarding.steps.ownership.methods;

  return (
    <div>
      <ol className="border-t border-edge">
        {methods.map((method, index) => (
          <li
            key={method.name}
            className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2 border-b border-edge py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:gap-x-5"
          >
            <span aria-hidden className="text-data tabular pt-0.5 text-ink-soft">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h2 className="text-title text-[15px] text-ink">{method.name}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                {method.body}
              </p>
            </div>
            <div className="col-start-2 sm:col-start-3 sm:pt-0.5">
              <Badge variant="outline">{local.planned}</Badge>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-7 rounded-md border border-edge bg-mineral p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Checkbox
            id="onboarding-demo-ack"
            checked={state.demoAcknowledged}
            onCheckedChange={(value) =>
              update((prev) => ({ ...prev, demoAcknowledged: value === true }))
            }
            className={`mt-0.5 ${TOUCH_TARGET}`}
          />
          <div className="min-w-0">
            <Label
              htmlFor="onboarding-demo-ack"
              className="text-[14px] font-medium text-ink"
            >
              {copy.onboarding.steps.ownership.demoContinue}
            </Label>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              {copy.onboarding.steps.ownership.demoNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
