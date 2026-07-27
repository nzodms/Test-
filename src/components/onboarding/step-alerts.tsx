"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { controlHeight, SetupField } from "./field";
import {
  isEmailAddress,
  local,
  type OnboardingState,
  type OnboardingUpdate,
  type RegisterAdvance,
} from "./state";

const TOUCH_TARGET =
  "relative before:absolute before:-inset-3 before:content-[''] sm:before:-inset-2";

function Row({
  labelId,
  label,
  body,
  control,
  note,
  first = false,
  children,
}: {
  labelId: string;
  label: string;
  body: string;
  control?: React.ReactNode;
  note?: string;
  first?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-t border-edge py-4 sm:py-4.5",
        first && "border-t-0 pt-0"
      )}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p id={labelId} className="text-[15.5px] font-medium text-ink">
            {label}
          </p>
          <p className="mt-1 text-[14.5px] leading-relaxed text-ink-soft">
            {body}
          </p>
        </div>
        {control ? (
          <div className="mt-1 shrink-0">{control}</div>
        ) : note ? (
          <span className="mt-0.5 shrink-0 text-[14px] text-ink-soft">
            {note}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function StepAlerts({
  state,
  update,
  registerAdvance,
}: {
  state: OnboardingState;
  update: OnboardingUpdate;
  /** Continue reports the email problem at the field, not 200px below it. */
  registerAdvance: RegisterAdvance;
}) {
  const [touched, setTouched] = React.useState(false);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const trimmed = state.email.trim();
  const emailOk = !state.emailEnabled || isEmailAddress(trimmed);
  const invalid =
    state.emailEnabled && touched && trimmed.length > 0 && !isEmailAddress(trimmed);
  const missing = state.emailEnabled && touched && trimmed.length === 0;

  /* Re-registered every render so the hook always sees the current
     address. Returning false means: this entry has said why. */
  React.useEffect(() => {
    const attempt = () => {
      if (emailOk) return true;
      setTouched(true);
      emailRef.current?.focus();
      return false;
    };
    return registerAdvance(attempt);
  });

  return (
    <div>
      <Row
        first
        labelId="setup-high-confidence"
        label={local.alerts.highConfidence}
        body={local.alerts.highConfidenceBody}
        control={
          <Switch
            checked={state.highConfidenceAlerts}
            onCheckedChange={(checked) =>
              update((prev) => ({ ...prev, highConfidenceAlerts: checked }))
            }
            aria-labelledby="setup-high-confidence"
            className={TOUCH_TARGET}
          />
        }
      />

      <Row
        labelId="setup-weekly"
        label={local.alerts.weekly}
        body={local.alerts.weeklyBody}
        control={
          <Switch
            checked={state.weeklySummary}
            onCheckedChange={(checked) =>
              update((prev) => ({ ...prev, weeklySummary: checked }))
            }
            aria-labelledby="setup-weekly"
            className={TOUCH_TARGET}
          />
        }
      />

      <Row
        labelId="setup-email"
        label={local.alerts.email}
        body={local.alerts.emailBody}
        control={
          <Switch
            checked={state.emailEnabled}
            onCheckedChange={(checked) => {
              if (!checked) setTouched(false);
              update((prev) => ({ ...prev, emailEnabled: checked }));
            }}
            aria-labelledby="setup-email"
            className={TOUCH_TARGET}
          />
        }
      >
        {state.emailEnabled ? (
          <div className="mt-4 max-w-sm">
            <SetupField
              label={local.alerts.emailAddress}
              htmlFor="setup-email-address"
              error={invalid || missing ? local.guards.email : undefined}
            >
              <Input
                id="setup-email-address"
                ref={emailRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                value={state.email}
                onChange={(event) => {
                  const email = event.target.value;
                  update((prev) => ({ ...prev, email }));
                }}
                onBlur={() => setTouched(true)}
                aria-invalid={invalid || missing}
                spellCheck={false}
                className={controlHeight}
              />
            </SetupField>
          </div>
        ) : null}
      </Row>

      <Row
        labelId="setup-workspace"
        label={local.alerts.workspace}
        body={local.alerts.workspaceBody}
        note={local.alerts.alwaysOn}
      />

      <Row
        labelId="setup-integrations"
        label={local.alerts.integrations}
        body={local.alerts.integrationsBody}
      />
    </div>
  );
}
