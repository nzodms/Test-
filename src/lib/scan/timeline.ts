import type { ScanEvent, ScanPhase } from "./types";
import { sourceCoverage, scanTotals, featuredMatches } from "@/lib/demo/scan-data";

/**
 * The scan choreography.
 *
 * One ordered event stream plus the phase windows and the curves that
 * drive every counter. Nothing here touches the DOM or a timer — the
 * controller samples it. A real backend emitting ScanEvents on the
 * same phases would drive exactly this interface.
 *
 * Total ≈ 8.9s: long enough to read as work, short enough that nobody
 * waits for it.
 */

/* ── Phase windows (ms) ────────────────────────────────────────── */

export const PHASE_WINDOWS: Array<{
  phase: Exclude<ScanPhase, "idle">;
  from: number;
  to: number;
}> = [
  { phase: "resolving_identity", from: 0, to: 900 },
  { phase: "checking_profiles", from: 900, to: 1620 },
  { phase: "indexing_sources", from: 1620, to: 3180 },
  { phase: "matching_content", from: 3180, to: 5400 },
  { phase: "classifying_findings", from: 5400, to: 6480 },
  { phase: "calculating_exposure", from: 6480, to: 7320 },
  { phase: "building_report", from: 7320, to: 8500 },
  { phase: "complete", from: 8500, to: 8900 },
  { phase: "locked", from: 8900, to: 8900 },
];

export const SCAN_DURATION_MS = 8900;

export function phaseAt(elapsed: number): Exclude<ScanPhase, "idle"> {
  for (let i = PHASE_WINDOWS.length - 1; i >= 0; i--) {
    const w = PHASE_WINDOWS[i]!;
    if (elapsed >= w.from) return w.phase;
  }
  return "resolving_identity";
}

export function windowFor(phase: ScanPhase) {
  return PHASE_WINDOWS.find((w) => w.phase === phase);
}

/* ── Counter curves ────────────────────────────────────────────── */

/**
 * The match counter does not run linearly to 187. It finds a couple,
 * stalls, then a source opens up and it jumps — the shape of a real
 * crawl. Control points are (progress 0–1, value).
 */
const MATCH_CURVE: Array<[number, number]> = [
  [0, 0],
  [0.06, 2],
  [0.14, 5],
  [0.22, 11],
  [0.31, 18],
  [0.42, 34],
  [0.54, 57],
  [0.66, 89],
  [0.78, 126],
  [0.88, 154],
  [0.95, 173],
  [1, scanTotals.matches],
];

/** Piecewise-linear read of a curve, rounded to an integer. */
function readCurve(curve: Array<[number, number]>, t: number): number {
  const p = Math.max(0, Math.min(1, t));
  for (let i = 1; i < curve.length; i++) {
    const [t1, v1] = curve[i]!;
    if (p <= t1) {
      const [t0, v0] = curve[i - 1]!;
      const span = t1 - t0 || 1;
      return Math.round(v0 + ((p - t0) / span) * (v1 - v0));
    }
  }
  return curve[curve.length - 1]![1];
}

export function matchesAt(elapsed: number): number {
  const w = windowFor("matching_content")!;
  if (elapsed < w.from) return 0;
  if (elapsed >= w.to) return scanTotals.matches;
  return readCurve(MATCH_CURVE, (elapsed - w.from) / (w.to - w.from));
}

/**
 * Sources are not counted up — they are *detected*. Each kind lands at
 * its own moment, and its count fills in over the ~200ms after it.
 */
const SOURCE_STAGGER = 280;
const SOURCE_FILL = 220;

export function sourcesOpenAt(elapsed: number): number {
  const w = windowFor("indexing_sources")!;
  if (elapsed < w.from) return 0;
  return Math.min(
    sourceCoverage.length,
    Math.floor((elapsed - w.from) / SOURCE_STAGGER) + 1
  );
}

export function sourceCountsAt(elapsed: number): number[] {
  const w = windowFor("indexing_sources")!;
  return sourceCoverage.map((s, i) => {
    const lands = w.from + i * SOURCE_STAGGER;
    if (elapsed < lands) return 0;
    const fill = Math.min(1, (elapsed - lands) / SOURCE_FILL);
    return Math.round(s.count * fill);
  });
}

export function sourcesAt(elapsed: number): number {
  return sourceCountsAt(elapsed).reduce((a, b) => a + b, 0);
}

/** Findings drop into the register one at a time while matching runs. */
export function findingsShownAt(elapsed: number): number {
  const w = windowFor("matching_content")!;
  if (elapsed < w.from + 240) return 0;
  const step = (w.to - w.from - 240) / featuredMatches.length;
  return Math.min(
    featuredMatches.length,
    Math.floor((elapsed - w.from - 240) / step) + 1
  );
}

/** Classification splits the findings three ways as it runs. */
export function confidenceSplitAt(elapsed: number) {
  const w = windowFor("classifying_findings")!;
  const t = Math.max(0, Math.min(1, (elapsed - w.from) / (w.to - w.from)));
  const total = scanTotals.matches;
  return {
    high: Math.round(scanTotals.highConfidence * t),
    likely: Math.round(62 * t),
    possible: Math.round((total - scanTotals.highConfidence - 62) * t),
  };
}

export function highConfidenceAt(elapsed: number): number {
  return confidenceSplitAt(elapsed).high;
}

/** Exposure settles rather than counting: fast, then eased into place. */
export function exposureAt(elapsed: number, target: number): number {
  const w = windowFor("calculating_exposure")!;
  if (elapsed < w.from) return 0;
  if (elapsed >= w.to) return target;
  const t = (elapsed - w.from) / (w.to - w.from);
  const eased = 1 - Math.pow(1 - t, 3);
  return Math.round(target * eased);
}

/** Report sections are laid in one after another. */
export function reportSectionsAt(elapsed: number, total: number): number {
  const w = windowFor("building_report")!;
  if (elapsed < w.from) return 0;
  if (elapsed >= w.to) return total;
  const step = (w.to - w.from) / total;
  return Math.min(total, Math.floor((elapsed - w.from) / step) + 1);
}

/* ── The operations stream ─────────────────────────────────────── */

let seq = 0;
function ev(
  e: Omit<ScanEvent, "id" | "status"> & { status?: ScanEvent["status"] }
): ScanEvent {
  seq += 1;
  return { id: `ev-${seq}`, status: e.status ?? "complete", ...e };
}

export function buildScanTimeline(username: string): ScanEvent[] {
  seq = 0;
  const events: ScanEvent[] = [];

  events.push(
    ev({ phase: "resolving_identity", at: 140, label: `Resolving @${username}` })
  );
  events.push(
    ev({
      phase: "resolving_identity",
      at: 620,
      label: "Reading public profile",
      value: "found",
    })
  );
  events.push(
    ev({ phase: "checking_profiles", at: 980, label: "Checking profile variations" })
  );
  events.push(
    ev({
      phase: "checking_profiles",
      at: 1340,
      label: "Matching connected usernames",
      value: "3 linked",
    })
  );

  const sourcesFrom = windowFor("indexing_sources")!.from;
  sourceCoverage.forEach((src, i) => {
    events.push(
      ev({
        phase: "indexing_sources",
        at: sourcesFrom + i * SOURCE_STAGGER + 60,
        label: `Indexing ${src.label.toLowerCase()}`,
        value: `${src.count}`,
      })
    );
  });

  const matchFrom = windowFor("matching_content")!.from;
  featuredMatches.slice(0, 6).forEach((m, i) => {
    events.push(
      ev({
        phase: "matching_content",
        at: matchFrom + 300 + i * 320,
        status: m.confidence === "high" ? "warning" : "active",
        label: `Match on ${m.domainMasked}`,
        value: m.confidence === "high" ? "high" : "possible",
      })
    );
  });

  events.push(
    ev({ phase: "classifying_findings", at: 5560, label: "Grading match confidence" })
  );
  events.push(
    ev({
      phase: "classifying_findings",
      at: 6120,
      label: "Grouping duplicates by source",
      value: "34 groups",
    })
  );
  events.push(
    ev({
      phase: "calculating_exposure",
      at: 6620,
      status: "warning",
      label: "Weighting exposure",
    })
  );
  events.push(
    ev({
      phase: "calculating_exposure",
      at: 7040,
      label: "Correlating recurrences",
      value: "6",
    })
  );
  events.push(
    ev({ phase: "building_report", at: 7420, label: "Assembling report" })
  );
  events.push(
    ev({
      phase: "building_report",
      at: 8080,
      status: "warning",
      label: "Withholding exact sources",
    })
  );
  events.push(ev({ phase: "complete", at: 8560, label: "Scan complete" }));

  return events;
}
