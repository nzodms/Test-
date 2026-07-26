"use client";

import { copy } from "@/config/product";
import { ChoiceGroup, type ChoiceOption } from "./choice-group";
import { local, type AccountType, type OnboardingUpdate, type OnboardingState } from "./state";

/* One reticle: a single profile watched. */
function SingleReticle() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="14" cy="14" r="6.25" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M14 2.75v3.25M14 22v3.25M2.75 14H6M22 14h3.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

/* Three stacked reticles: a roster watched from one place. */
function StackedReticles() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <circle
        cx="9"
        cy="9"
        r="5"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.4"
      />
      <circle
        cx="12.5"
        cy="12.5"
        r="5"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.7"
      />
      <circle cx="17.5" cy="17.5" r="5.5" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M17.5 9.5v1.5M17.5 24v1.5M9.5 17.5H11M24 17.5h1.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="17.5" cy="17.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

const options: readonly ChoiceOption<AccountType>[] = [
  {
    value: "creator",
    title: copy.onboarding.steps.account.creator,
    body: copy.onboarding.steps.account.creatorBody,
    icon: <SingleReticle />,
  },
  {
    value: "agency",
    title: copy.onboarding.steps.account.agency,
    body: copy.onboarding.steps.account.agencyBody,
    icon: <StackedReticles />,
  },
];

export function StepAccount({
  state,
  update,
}: {
  state: OnboardingState;
  update: OnboardingUpdate;
}) {
  return (
    <ChoiceGroup
      label={local.accountLegend}
      layout="cards"
      options={options}
      value={state.accountType}
      onChange={(accountType) =>
        update((prev) => ({ ...prev, accountType }))
      }
    />
  );
}
