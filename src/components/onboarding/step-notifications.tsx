"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { copy } from "@/config/product";
import {
  isEmailAddress,
  local,
  type OnboardingState,
  type OnboardingUpdate,
} from "./state";

const TOUCH_TARGET =
  "relative before:absolute before:-inset-3 before:content-[''] sm:before:content-none";

function ChannelRow({
  labelId,
  label,
  body,
  trailing,
  control,
  children,
}: {
  labelId: string;
  label: string;
  body: string;
  trailing?: React.ReactNode;
  control: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-edge py-4 first:border-t first:border-edge">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p id={labelId} className="text-[14px] font-medium text-ink">
              {label}
            </p>
            {trailing}
          </div>
          <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">
            {body}
          </p>
        </div>
        <div className="mt-1 shrink-0">{control}</div>
      </div>
      {children}
    </div>
  );
}

export function StepNotifications({
  state,
  update,
}: {
  state: OnboardingState;
  update: OnboardingUpdate;
}) {
  const notifications = copy.onboarding.steps.notifications;
  const [touched, setTouched] = React.useState(false);
  const trimmed = state.email.trim();
  const invalid =
    state.emailEnabled && touched && trimmed.length > 0 && !isEmailAddress(trimmed);
  const missing = state.emailEnabled && touched && trimmed.length === 0;

  return (
    <div>
      <ChannelRow
        labelId="onboarding-email-label"
        label={notifications.email}
        body={notifications.emailBody}
        control={
          <Switch
            checked={state.emailEnabled}
            onCheckedChange={(checked) => {
              if (!checked) setTouched(false);
              update((prev) => ({ ...prev, emailEnabled: checked }));
            }}
            aria-labelledby="onboarding-email-label"
            className={TOUCH_TARGET}
          />
        }
      >
        {state.emailEnabled ? (
          <div className="mt-4 max-w-sm">
            <Field
              label={local.emailAddress}
              htmlFor="onboarding-email"
              error={invalid || missing ? local.guards.email : undefined}
            >
              <Input
                id="onboarding-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={state.email}
                onChange={(event) => {
                  const email = event.target.value;
                  update((prev) => ({ ...prev, email }));
                }}
                onBlur={() => setTouched(true)}
                aria-invalid={invalid || missing}
                spellCheck={false}
                className="h-11 sm:h-9"
              />
            </Field>
          </div>
        ) : null}
      </ChannelRow>

      <ChannelRow
        labelId="onboarding-dashboard-label"
        label={notifications.dashboard}
        body={notifications.dashboardBody}
        trailing={<Badge variant="neutral">{local.alwaysOn}</Badge>}
        control={
          <Switch
            checked
            disabled
            aria-labelledby="onboarding-dashboard-label"
            aria-readonly="true"
          />
        }
      />

      <ChannelRow
        labelId="onboarding-integrations-label"
        label={notifications.integrations}
        body={notifications.integrationsBody}
        trailing={<Badge variant="outline">{notifications.planned}</Badge>}
        control={
          <Switch
            checked={false}
            disabled
            aria-labelledby="onboarding-integrations-label"
          />
        }
      />
    </div>
  );
}
