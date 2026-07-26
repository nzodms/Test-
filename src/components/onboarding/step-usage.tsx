"use client";

import { ChoiceGroup, type ChoiceOption } from "./choice-group";
import {
  local,
  type AccountType,
  type OnboardingState,
  type OnboardingUpdate,
} from "./state";

const options: readonly ChoiceOption<AccountType>[] = [
  {
    value: "creator",
    title: local.usage.creator,
    body: local.usage.creatorBody,
  },
  {
    value: "agency",
    title: local.usage.agency,
    body: local.usage.agencyBody,
  },
];

export function StepUsage({
  state,
  update,
}: {
  state: OnboardingState;
  update: OnboardingUpdate;
}) {
  return (
    <ChoiceGroup
      label={local.usage.legend}
      options={options}
      value={state.accountType}
      onChange={(accountType) => update((prev) => ({ ...prev, accountType }))}
    />
  );
}
