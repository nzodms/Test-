"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Surface } from "@/components/primitives/surface";
import { copy } from "@/config/product";
import { enterTransition } from "@/lib/motion";
import { platformLabels } from "@/lib/validation";
import { cn } from "@/lib/utils";
import {
  accountLabel,
  alertsLabel,
  coverageLabel,
  frequencyLabel,
  local,
  profileCountLabel,
  reachLabel,
  type OnboardingState,
} from "./state";

/* ════════════════════════════════════════════════════════════════
   The context panel: what the workspace looks like so far. It fills
   in as steps are passed, so the setup reads as construction rather
   than as a form queue.
   ════════════════════════════════════════════════════════════════ */

function Value({
  value,
  reached,
  reduced,
}: {
  value: string;
  reached: boolean;
  reduced: boolean;
}) {
  return (
    <motion.span
      key={value}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={enterTransition}
      className={cn(
        "block text-[13px] leading-snug",
        reached ? "text-ink" : "text-ink-soft"
      )}
    >
      {value}
    </motion.span>
  );
}

function SummaryRow({
  label,
  value,
  reached,
  reduced,
  children,
}: {
  label: string;
  value: string;
  reached: boolean;
  reduced: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="py-3">
      <dt className="text-label">{label}</dt>
      <dd className="mt-1 min-w-0">
        <Value value={value} reached={reached} reduced={reduced} />
        {children}
      </dd>
    </div>
  );
}

export function SummaryPanel({
  state,
  maxStep,
}: {
  state: OnboardingState;
  maxStep: number;
}) {
  const reduced = useReducedMotion() ?? false;
  const hasProfiles = state.profiles.length > 0;

  return (
    <Surface tone="paper" className="rounded-lg p-5">
      <h2 className="text-label">{local.summaryTitle}</h2>

      <dl className="mt-3 divide-y divide-edge-faint">
        <SummaryRow
          label={local.account}
          value={accountLabel(state.accountType) ?? local.summaryPending}
          reached={state.accountType !== null}
          reduced={reduced}
        />

        <SummaryRow
          label={copy.dashboard.sections.profiles}
          value={
            hasProfiles
              ? profileCountLabel(state.profiles.length)
              : local.profilesNone
          }
          reached={hasProfiles}
          reduced={reduced}
        >
          {hasProfiles ? (
            <ul className="mt-2 space-y-1.5">
              {state.profiles.slice(0, 3).map((profile) => (
                <li key={profile.id} className="flex items-center gap-2">
                  <Avatar name={profile.username} size="xs" />
                  <span className="min-w-0 flex-1 truncate text-data text-ink">
                    {profile.username}
                  </span>
                  <span className="shrink-0 text-2xs text-ink-soft">
                    {platformLabels[profile.platform]}
                  </span>
                </li>
              ))}
              {state.profiles.length > 3 ? (
                <li className="text-data tabular text-ink-soft">
                  +{state.profiles.length - 3}
                </li>
              ) : null}
            </ul>
          ) : null}
        </SummaryRow>

        <SummaryRow
          label={local.frequency}
          value={
            maxStep >= 4 ? frequencyLabel(state.frequency) : local.summaryPending
          }
          reached={maxStep >= 4}
          reduced={reduced}
        />

        <SummaryRow
          label={local.coverage}
          value={
            maxStep >= 4 ? coverageLabel(state.coverage) : local.summaryPending
          }
          reached={maxStep >= 4}
          reduced={reduced}
        />

        <SummaryRow
          label={local.alerts}
          value={maxStep >= 4 ? alertsLabel(state) : local.summaryPending}
          reached={maxStep >= 4}
          reduced={reduced}
        />

        <SummaryRow
          label={local.reach}
          value={maxStep >= 5 ? reachLabel(state) : local.summaryPending}
          reached={maxStep >= 5}
          reduced={reduced}
        />
      </dl>

      <div aria-hidden className="mt-5 h-px edge-fade-x" />

      <ul className="mt-4 space-y-1.5">
        {copy.legal.positioning.map((line) => (
          <li
            key={line}
            className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-soft"
          >
            <Check className="mt-0.5 size-3 shrink-0 text-ink-faint" aria-hidden />
            <span className="min-w-0">{line}</span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}

export function SummaryStrip({
  state,
  maxStep,
  className,
}: {
  state: OnboardingState;
  maxStep: number;
  className?: string;
}) {
  const items: { label: string; value: string }[] = [
    {
      label: local.account,
      value: accountLabel(state.accountType) ?? local.summaryPending,
    },
    {
      label: copy.dashboard.sections.profiles,
      value: state.profiles.length
        ? profileCountLabel(state.profiles.length)
        : local.profilesNone,
    },
  ];
  if (maxStep >= 4) {
    items.push({
      label: local.frequency,
      value: `${frequencyLabel(state.frequency)} · ${coverageLabel(state.coverage)}`,
    });
  }
  if (maxStep >= 5) {
    items.push({ label: local.reach, value: reachLabel(state) });
  }

  return (
    <dl
      className={cn(
        "flex items-baseline gap-x-5 gap-y-1 overflow-x-auto scrollbar-quiet rounded-md border border-edge bg-paper px-4 py-3",
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex shrink-0 items-baseline gap-2">
          <dt className="text-label">{item.label}</dt>
          <dd className="max-w-[180px] truncate text-[13px] text-ink">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
