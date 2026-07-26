import type { Metadata } from "next";

import { ConfidenceSplit } from "@/components/dashboard/overview/confidence-split";
import { ExposureHeadline } from "@/components/dashboard/overview/exposure-headline";
import { MetricStrip } from "@/components/dashboard/overview/metric-strip";
import { MonitoredProfiles } from "@/components/dashboard/overview/monitored-profiles";
import { RecentDetections } from "@/components/dashboard/overview/recent-detections";
import { SourceTimeline } from "@/components/dashboard/overview/source-timeline";
import { TakedownSummary } from "@/components/dashboard/overview/takedown-summary";
import { PageIntro } from "@/components/dashboard/page-intro";
import { copy } from "@/config/product";

export const metadata: Metadata = {
  title: copy.dashboard.sections.overview,
};

const text = {
  intro:
    "Where the active profile stands right now, and what changed since the last scan.",
} as const;

/**
 * The workspace Overview.
 *
 * Reading order is deliberate: a single exposure reading first, the
 * totals it rests on immediately beneath it, then the detections
 * that need a decision, and finally the slower context — how the
 * queue is graded, what removal work is open, which profiles are
 * watched and what the sources have been doing. Block weight and
 * spacing fall off as the page moves from decision to reference.
 */
export default function DashboardOverviewPage() {
  return (
    <div className="flex min-w-0 flex-col">
      <PageIntro
        title={copy.dashboard.sections.overview}
        description={text.intro}
      />

      <div className="mt-6 sm:mt-8">
        <ExposureHeadline />
      </div>

      {/* Tight to the block above: these are the figures it reads. */}
      <div className="mt-5 sm:mt-6">
        <MetricStrip />
      </div>

      <div className="mt-10 sm:mt-14">
        <RecentDetections />
      </div>

      <div className="mt-10 grid gap-8 sm:mt-14 lg:grid-cols-[1fr_0.8fr] lg:gap-12">
        <ConfidenceSplit />
        <TakedownSummary />
      </div>

      <div className="mt-10 grid gap-8 sm:mt-14 lg:grid-cols-[1fr_0.62fr] lg:gap-12">
        <MonitoredProfiles />
        <SourceTimeline />
      </div>
    </div>
  );
}
