"use client";

import { Checkbox } from "@/components/ui/misc";
import { Label } from "@/components/ui/label";
import { platformLabels } from "@/lib/validation";
import { local, type OnboardingState, type OnboardingUpdate } from "./state";

/** The 16px control needs a phone-sized hit area around it. */
const TOUCH_TARGET =
  "relative before:absolute before:-inset-3.5 before:content-[''] sm:before:-inset-2.5";

export function StepRelationship({
  state,
  update,
}: {
  state: OnboardingState;
  update: OnboardingUpdate;
}) {
  const subject = state.profiles[0] ?? null;
  const claim =
    state.accountType === "agency"
      ? local.relationship.agencyClaim
      : local.relationship.creatorClaim;

  return (
    <div>
      {/* The subject this declaration is about, restated so the
          confirmation is never made against the wrong profile. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-edge pt-4">
        <span className="text-[14px] text-ink-soft">
          {local.relationship.subjectLabel}
        </span>
        <span className="min-w-0 text-[16.5px] text-ink">
          {subject ? (
            <>
              <span className="text-subject">@{subject.username}</span>
              <span className="text-ink-soft">
                {" · "}
                {platformLabels[subject.platform]}
              </span>
            </>
          ) : (
            <span className="text-ink-soft">
              {local.relationship.subjectNone}
            </span>
          )}
        </span>
      </div>

      {/* The declaration — a clause on the record, marked in the
          margin, not a shaded consent box. */}
      <div className="mt-7 flex items-start gap-4 border-l-2 border-accent/50 pl-4 sm:pl-5">
        <Checkbox
          id="setup-relationship"
          checked={state.demoAcknowledged}
          onCheckedChange={(value) =>
            update((prev) => ({ ...prev, demoAcknowledged: value === true }))
          }
          className={`mt-1 ${TOUCH_TARGET}`}
        />
        <div className="min-w-0">
          <Label
            htmlFor="setup-relationship"
            className="block text-[16px] font-medium leading-snug text-ink"
          >
            {claim}
          </Label>
          <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
            {local.relationship.demoBody}
          </p>
        </div>
      </div>

      {/* What real verification will be, stated once — not four
          identical badges. */}
      <div className="mt-9">
        <h2 className="text-[15px] font-medium text-ink">
          {local.relationship.methodsHeading}
        </h2>
        {/* Stated before the list, not after it: whether any of this
            is available yet is the first thing worth knowing. */}
        <p className="mt-1.5 text-[14px] text-ink-soft">
          {local.relationship.methodsNote}
        </p>
        <ol className="mt-4 border-b border-edge">
          {local.relationship.methods.map((method, index) => (
            <li
              key={method.name}
              className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-x-3 border-t border-edge py-3"
            >
              <span
                aria-hidden
                className="font-mono text-[12.5px] tabular text-ink-soft"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block text-[15.5px] text-ink">
                  {method.name}
                </span>
                <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-soft">
                  {method.body}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
