"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { ActivityChart } from "@/components/scanner/activity-chart";
import { Redacted, RedactedDomain } from "@/components/file/redacted";
import {
  ExposureStatus,
  FindingRow,
  primaryAction,
  quietAction,
} from "./primitives";
import { REPORT_SECTIONS } from "@/lib/scan/types";
import {
  DEMO_ANCHOR,
  activitySeries,
  demoMatches,
  exposureLevel,
  scanTotals,
  sourceCoverage,
} from "@/lib/demo/scan-data";
import { routes } from "@/config/navigation";
import { motionTokens } from "@/lib/motion";
import { formatDateUTC, formatLongDateUTC, cn } from "@/lib/utils";

/** Which sections a visitor may read before verifying ownership. */
const SEALED: Record<string, boolean> = {
  Summary: false,
  Sources: false,
  Findings: false,
  Timeline: false,
  Exposure: false,
  Actions: true,
};

/**
 * The report.
 *
 * It is the same surface the scan was running on — the figures above
 * it never moved. What changes is that the working panel becomes
 * readable: six sections, navigable, with the parts that would let
 * someone reach the content withheld rather than blurred.
 */
export function ScanReport({ onNewScan }: { onNewScan: () => void }) {
  const reduced = useReducedMotion();
  const [section, setSection] = React.useState<string>(REPORT_SECTIONS[0]);
  const tabsRef = React.useRef<(HTMLButtonElement | null)[]>([]);

  const move = (from: number, delta: number) => {
    const next =
      (from + delta + REPORT_SECTIONS.length) % REPORT_SECTIONS.length;
    setSection(REPORT_SECTIONS[next]!);
    tabsRef.current[next]?.focus();
  };

  return (
    <div>
      {/* ── Phones read the report straight through ────────────────
          A six-tab strip that scrolls sideways is a desktop control
          wearing a phone's clothes. On a phone the sections are simply
          stacked in reading order, each one titled. */}
      <div className="sm:hidden">
        {REPORT_SECTIONS.map((s, i) => (
          <section
            key={s}
            className="border-t border-edge pb-8 pt-7 first:border-t-0 first:pt-0"
          >
            <h2 className="flex items-baseline gap-3">
              <span className="font-mono text-[12.5px] tabular text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-title text-[19px] text-ink">{s}</span>
              {SEALED[s] ? (
                <Lock className="size-3.5 shrink-0 text-ink-faint" aria-hidden />
              ) : null}
            </h2>
            <div className="mt-5">
              <SectionBody name={s} />
            </div>
          </section>
        ))}
        <NextStep onNewScan={onNewScan} />
      </div>

      {/* ── Wider screens navigate it ──────────────────────────── */}
      <div className="hidden sm:block">
      <div
        role="tablist"
        aria-label="Report sections"
        className="-mx-1 flex gap-1 overflow-x-auto scrollbar-quiet border-b border-edge px-1"
      >
        {REPORT_SECTIONS.map((s, i) => {
          const active = s === section;
          return (
            <button
              key={s}
              ref={(n) => {
                tabsRef.current[i] = n;
              }}
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setSection(s)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  move(i, 1);
                }
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  move(i, -1);
                }
              }}
              className={cn(
                "relative shrink-0 px-3 pb-2.5 pt-1 text-[14.5px] transition-colors duration-150",
                active ? "text-ink" : "text-ink-soft hover:text-ink"
              )}
            >
              <span className="flex items-center gap-2">
                {s}
                {SEALED[s] ? (
                  <Lock className="size-3 shrink-0 text-ink-faint" aria-hidden />
                ) : null}
              </span>
              {active ? (
                <motion.span
                  layoutId={reduced ? undefined : "report-tab"}
                  transition={{ duration: 0.22, ease: motionTokens.ease.enter }}
                  className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-ink"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ── Section body ───────────────────────────────────────── */}
      <div className="min-h-[264px] pt-7">
        <motion.div
          key={section}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.base,
            ease: motionTokens.ease.enter,
          }}
        >
          <SectionBody name={section} />
        </motion.div>
      </div>

      <NextStep onNewScan={onNewScan} />
      </div>
    </div>
  );
}

/** One report section, wherever it is being read. */
function SectionBody({ name }: { name: string }) {
  switch (name) {
    case "Summary":
      return <SummarySection />;
    case "Sources":
      return <SourcesSection />;
    case "Findings":
      return <FindingsSection />;
    case "Timeline":
      return <TimelineSection />;
    case "Exposure":
      return <ExposureSection />;
    default:
      return <ActionsSection />;
  }
}

/** What happens next — stated once, at the end of the report. */
function NextStep({ onNewScan }: { onNewScan: () => void }) {
  return (
    <div className="mt-9 border-t border-edge pt-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <p className="text-title text-[19px] text-ink">
            Your report is ready
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            Verify ownership to reveal exact sources, evidence and removal
            options, and to keep this scan running weekly.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Link href={routes.onboardingDemo} className={primaryAction}>
            Claim this profile
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <button type="button" onClick={onNewScan} className={quietAction}>
            Run another scan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Summary ───────────────────────────────────────────────────── */

function SummarySection() {
  const last = activitySeries[activitySeries.length - 1]!;
  const prev = activitySeries[activitySeries.length - 2]!;

  return (
    <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:gap-12">
      <div className="min-w-0">
        <p className="max-w-lg text-[16px] leading-relaxed text-ink">
          {scanTotals.matches} potential matches were found across{" "}
          {scanTotals.sources} indexed public sources.{" "}
          {scanTotals.highConfidence} of them are high confidence and would be
          the first put forward for removal.
        </p>

        <dl className="mt-7 grid gap-x-10 sm:grid-cols-2">
          <SummaryFact label="Scan run" value={formatLongDateUTC(DEMO_ANCHOR)} />
          <SummaryFact
            label="Detections this week"
            value={`${last.detections}, up from ${prev.detections}`}
          />
          <SummaryFact
            label="Recurrences after removal"
            value={`${scanTotals.recurrences}`}
          />
          <SummaryFact label="Monitoring" value="Not started" muted />
        </dl>

        <div className="mt-8 border-t border-edge pt-5">
          <p className="text-[14px] text-ink-soft">Withheld until verified</p>
          <ul className="mt-2.5 flex flex-wrap gap-x-7 gap-y-1.5">
            {[
              "Exact source addresses",
              "Evidence previews",
              "Full findings register",
              "Removal requests",
            ].map((item) => (
              <li
                key={item}
                className="flex items-baseline gap-2 text-[14.5px] text-ink-soft"
              >
                <Lock
                  className="size-3 shrink-0 translate-y-[2px]"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The one analytic panel in the report keeps the environment of
          the instrument that produced it — the reading is light, the
          measurement stays deep. */}
      <AnalysisPanel />
    </div>
  );
}

/**
 * A measurement, still on the instrument's surface.
 *
 * Not a dark card for contrast's sake: exposure and the curve are the
 * two things here that were *computed* rather than counted, and they
 * keep the environment they were computed in.
 */
function AnalysisPanel() {
  return (
    <div className="surface-active min-w-0 rounded-[10px] px-5 py-6 shadow-lift">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[14px] text-ink-soft">Exposure status</p>
        <p className="font-mono text-[12.5px] tabular text-ink-faint">
          {exposureLevel.score}/100
        </p>
      </div>

      <div className="mt-4">
        <ExposureStatus score={exposureLevel.score} />
      </div>

      <div className="mt-7">
        <p className="text-[13.5px] text-ink-soft">Detection activity</p>
        <div className="mt-2.5 h-[92px]">
          <ActivityChart data={activitySeries} draw tone="scan" height={92} />
        </div>
      </div>

      <p className="mt-4 border-t border-edge pt-4 text-[13.5px] leading-relaxed text-ink-soft">
        Rising: the material is reaching new sources faster than it is being
        removed.
      </p>
    </div>
  );
}

function SummaryFact({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-edge py-3">
      <dt className="text-[14.5px] text-ink-soft">{label}</dt>
      <dd
        className={cn(
          "text-right text-[15px]",
          muted ? "text-ink-faint" : "text-ink"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/* ── Sources ───────────────────────────────────────────────────── */

function SourcesSection() {
  const max = Math.max(...sourceCoverage.map((s) => s.count));
  return (
    <div>
      <p className="max-w-lg text-[15.5px] leading-relaxed text-ink-soft">
        Where the matches sit. Counts are shown in full; the addresses
        themselves stay withheld until the profile is verified.
      </p>
      <dl className="mt-6 grid gap-x-12 sm:grid-cols-2">
        {sourceCoverage.map((s) => (
          <div key={s.kind} className="border-t border-edge py-3.5">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[15px] text-ink">{s.label}</dt>
              <dd className="font-mono text-[13.5px] tabular text-ink">
                {s.count}
              </dd>
            </div>
            <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-mineral">
              <div
                className="h-full rounded-full bg-graphite"
                style={{ width: `${(s.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ── Findings ──────────────────────────────────────────────────── */

function FindingsSection() {
  const rows = demoMatches.slice(0, 6);
  const [open, setOpen] = React.useState<string | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-[15.5px] text-ink">
          Showing 6 of{" "}
          <span className="tabular">{scanTotals.matches}</span> findings
        </p>
        <p className="font-mono text-[12.5px] text-ink-soft">
          addresses partially withheld
        </p>
      </div>

      <ul className="mt-5">
        {rows.map((m, i) => (
          <React.Fragment key={m.id}>
            <FindingRow
              index={i + 1}
              subject={m.matchType}
              confidence={m.confidence}
              meta={formatDateUTC(m.detectedAt)}
              selected={open === m.id}
              onClick={() => setOpen(open === m.id ? null : m.id)}
              source={
                <RedactedDomain
                  head={m.redaction.head}
                  tail={m.redaction.tail}
                  hiddenChars={m.redaction.hidden}
                  className="text-[13.5px] text-ink-soft"
                />
              }
            />
            {open === m.id ? <FindingDetail /> : null}
          </React.Fragment>
        ))}
      </ul>

      <p className="mt-5 flex items-baseline gap-2.5 text-[14.5px] text-ink-soft">
        <Lock className="size-3 shrink-0 translate-y-[2px]" aria-hidden />
        {scanTotals.matches - 6} further findings, their addresses and evidence
        stay sealed.
      </p>
    </div>
  );
}

/** What one finding holds — with the operative parts withheld. */
function FindingDetail() {
  const reduced = useReducedMotion();
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{
        duration: motionTokens.duration.base,
        ease: motionTokens.ease.enter,
      }}
      className="-mx-3 list-none overflow-hidden bg-page"
    >
      <dl className="grid gap-x-12 gap-y-1 px-3 pb-4 pl-[3.5rem] pt-1 sm:grid-cols-2">
        {[
          ["Full address", 22],
          ["Page title", 18],
          ["First seen at", 12],
          ["Evidence", 15],
        ].map(([label, chars]) => (
          <div key={label as string} className="flex items-baseline gap-4 py-1">
            <dt className="w-[7.5rem] shrink-0 text-[14px] text-ink-soft">
              {label}
            </dt>
            <dd className="min-w-0">
              <Redacted chars={chars as number} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="px-3 pb-4 pl-[3.5rem] text-[13.5px] text-ink-soft">
        Withheld at the source — these characters are never sent to this page.
      </p>
    </motion.li>
  );
}

/* ── Timeline ──────────────────────────────────────────────────── */

function TimelineSection() {
  const rows = demoMatches.slice(0, 7);
  return (
    <div>
      <p className="max-w-lg text-[15.5px] leading-relaxed text-ink-soft">
        When each finding was first detected. Dates are shown; what was found
        at each one is not.
      </p>
      <ol className="mt-6">
        {rows.map((m) => (
          <li
            key={m.id}
            className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-5 border-t border-edge py-3 sm:grid-cols-[6rem_minmax(0,1fr)_auto]"
          >
            <span className="font-mono text-[12.5px] tabular text-ink-faint">
              {formatDateUTC(m.detectedAt)}
            </span>
            <span className="min-w-0 truncate text-[15px] text-ink">
              {m.matchType}
            </span>
            <span className="col-span-2 mt-1 sm:col-span-1 sm:mt-0 sm:text-right">
              <RedactedDomain
                head={m.redaction.head}
                tail={m.redaction.tail}
                hiddenChars={m.redaction.hidden}
                className="text-[13.5px] text-ink-soft"
              />
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── Exposure ──────────────────────────────────────────────────── */

function ExposureSection() {
  return (
    <div>
      <div className="surface-active rounded-[10px] px-6 py-7 shadow-lift sm:px-8 sm:py-8">
        <div className="grid gap-9 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] sm:gap-12">
          <ExposureStatus
            score={exposureLevel.score}
            size="lead"
            note="Weighted from match volume, confidence, and how many separate sources carry the content."
          />
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[14px] text-ink-soft">Detection activity</p>
              <p className="font-mono text-[12.5px] tabular text-ink-faint">
                8 weeks
              </p>
            </div>
            <div className="mt-3 h-[132px]">
              <ActivityChart
                data={activitySeries}
                draw
                tone="scan"
                height={132}
              />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink">
        Exposure rises when the same material reaches new sources faster than
        it is removed. Monitoring keeps this figure current instead of leaving
        you with one reading.
      </p>
    </div>
  );
}

/* ── Actions — sealed ──────────────────────────────────────────── */

function ActionsSection() {
  return (
    <div className="max-w-xl">
      <p className="flex items-center gap-2.5 text-[16px] text-ink">
        <Lock className="size-4 shrink-0" aria-hidden />
        Removal actions require ownership verification
      </p>
      <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">
        Argus only prepares a removal request on behalf of the person who owns
        the profile. Until that is confirmed, no request can be raised and no
        exact address is released.
      </p>

      <ul className="mt-7">
        {["Host abuse contact", "Registrar complaint", "Search de-indexing"].map(
          (route) => (
            <li
              key={route}
              className="flex items-baseline justify-between gap-4 border-t border-edge py-3"
            >
              <span className="text-[15px] text-ink-soft">{route}</span>
              <Redacted chars={9} className="opacity-60" />
            </li>
          )
        )}
      </ul>

      <Link href={routes.onboardingDemo} className={cn(primaryAction, "mt-7")}>
        Claim this profile
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
