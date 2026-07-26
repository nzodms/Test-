import type { Metadata } from "next";

import { MonitoringAlertRules } from "@/components/dashboard/monitoring-alert-rules";
import { MonitoringComparison } from "@/components/dashboard/monitoring-comparison";
import { MonitoringRecurrences } from "@/components/dashboard/monitoring-recurrences";
import { MonitoringSchedule } from "@/components/dashboard/monitoring-schedule";
import { MonitoringStatus } from "@/components/dashboard/monitoring-status";
import { PageIntro, Section } from "@/components/dashboard/page-intro";
import { copy } from "@/config/product";
import { scanTotals } from "@/lib/demo/scan-data";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: copy.dashboard.sections.monitoring,
};

const text = {
  intro:
    "What happens between scans: the schedule the watching runs on, how this week compares with your history, and what is worth an alert.",
  schedule: "Schedule",
  scheduleBody:
    "Frequency and coverage apply to every monitored profile. Changes are saved as you make them.",
  comparison: "This week vs. your history",
  comparisonBody:
    "Weekly detection events for the monitored profiles, read against the seven weeks before.",
  recurrences: "Recurrence tracking",
  recurrencesBody: (count: number) =>
    `Content that came back after action was taken on it. ${formatNumber(count)} recurrence cases are open on this profile.`,
  rules: "Alert rules",
  rulesBody:
    "An alert is the exception. Everything is recorded in the workspace whether a rule fires or not.",
} as const;

/**
 * Monitoring.
 *
 * The page answers one question in order: is it running, on what
 * schedule, what did it see this week, what came back, and what will
 * reach you. Weight falls off as the page moves from state to
 * settings.
 */
export default function MonitoringPage() {
  return (
    <div className="flex min-w-0 flex-col">
      <PageIntro
        title={copy.dashboard.sections.monitoring}
        description={text.intro}
      />

      <div className="mt-6 sm:mt-8">
        <MonitoringStatus />
      </div>

      <Section
        title={text.schedule}
        description={text.scheduleBody}
        className="mt-10 sm:mt-14"
      >
        <MonitoringSchedule />
      </Section>

      <Section
        title={text.comparison}
        description={text.comparisonBody}
        className="mt-10 sm:mt-14"
      >
        <MonitoringComparison />
      </Section>

      <Section
        title={text.recurrences}
        description={text.recurrencesBody(scanTotals.recurrences)}
        className="mt-10 sm:mt-14"
      >
        <MonitoringRecurrences />
      </Section>

      <Section
        label="Alerts"
        title={text.rules}
        description={text.rulesBody}
        className="mt-10 sm:mt-14"
      >
        <MonitoringAlertRules />
      </Section>
    </div>
  );
}
