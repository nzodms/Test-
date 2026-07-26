import type {
  ActivityPoint,
  DemoMatch,
  SourceCoverage,
} from "@/lib/scan/types";

/* ════════════════════════════════════════════════════════════════
   DEMO SCAN DATA — single source of truth.

   The headline figures (187 matches, 34 sources, 41 high-confidence)
   are consumed by the landing scanner AND the dashboard, so the two
   never disagree. Everything is deterministic (seeded), so server
   and client render identically and re-scans are stable.

   This is clearly demonstration data: no real scan is performed.
   ════════════════════════════════════════════════════════════════ */

export const DEMO_ANCHOR = "2026-07-24T16:30:00Z";

export const scanTotals = {
  matches: 187,
  sources: 34,
  highConfidence: 41,
  activeThisWeek: 12,
  newThisWeek: 23,
  recurrences: 6,
} as const;

export const exposureLevel = {
  key: "elevated" as const,
  /** 0–100, drives the exposure meter */
  score: 68,
};

/** Deterministic PRNG so the dataset never shifts between renders. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ago(hours: number): string {
  return new Date(new Date(DEMO_ANCHOR).getTime() - hours * 3_600_000)
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");
}

/* ── Source coverage — sums to 34 ──────────────────────────────── */

export const sourceCoverage: SourceCoverage[] = [
  { kind: "website", label: "Public websites", count: 12 },
  { kind: "forum", label: "Forums", count: 7 },
  { kind: "mirror", label: "Indexed mirrors", count: 8 },
  { kind: "channel", label: "Public channels", count: 4 },
  { kind: "archive", label: "Archived pages", count: 3 },
];

/* ── The KPI count-up target sequences (irregular, scan-like) ──── */

export const counterSequences = {
  matches: [0, 4, 11, 27, 58, 96, 143, 168, 187],
  sources: [0, 3, 9, 16, 23, 29, 32, 34],
  highConfidence: [0, 2, 7, 15, 24, 33, 39, 41],
  activeThisWeek: [0, 1, 4, 7, 10, 12],
} as const;

/* ── Detection activity, 8 weeks ───────────────────────────────── */

export const activitySeries: ActivityPoint[] = (() => {
  const rand = mulberry32(4718);
  const out: ActivityPoint[] = [];
  for (let i = 7; i >= 0; i--) {
    const base = 14 + (7 - i) * 2.4;
    out.push({
      week: i === 0 ? "W0" : `W-${i}`,
      detections: Math.round(base + rand() * 8),
      recurrences: Math.round(2 + rand() * 4),
    });
  }
  return out;
})();

/* ── Matches ───────────────────────────────────────────────────── */

const MATCH_TEMPLATES: Array<{
  domainFull: string;
  domainMasked: string;
  sourceKind: DemoMatch["sourceKind"];
  matchType: string;
}> = [
  { domainFull: "repost-hub.to", domainMasked: "re•••••••.to", sourceKind: "website", matchType: "Full gallery repost" },
  { domainFull: "leakboard.forum", domainMasked: "le•••••••.forum", sourceKind: "forum", matchType: "Thread with attachments" },
  { domainFull: "mirror-cache.io", domainMasked: "mi••••••••.io", sourceKind: "mirror", matchType: "Indexed mirror copy" },
  { domainFull: "archive-store.net", domainMasked: "ar•••••••••.net", sourceKind: "archive", matchType: "Archived snapshot" },
  { domainFull: "openchannel.app", domainMasked: "op••••••••.app", sourceKind: "channel", matchType: "Public channel post" },
  { domainFull: "gallery-dump.cc", domainMasked: "ga•••••••.cc", sourceKind: "website", matchType: "Image set" },
  { domainFull: "board-index.org", domainMasked: "bo••••••••.org", sourceKind: "forum", matchType: "Cross-posted thread" },
  { domainFull: "cache-view.ru", domainMasked: "ca••••••.ru", sourceKind: "mirror", matchType: "Cached page" },
  { domainFull: "reupload-site.xyz", domainMasked: "re••••••••••.xyz", sourceKind: "website", matchType: "Reupload" },
  { domainFull: "snapshot-web.io", domainMasked: "sn•••••••••.io", sourceKind: "archive", matchType: "Wayback-style copy" },
  { domainFull: "feed-mirror.to", domainMasked: "fe•••••••.to", sourceKind: "channel", matchType: "Mirrored feed" },
  { domainFull: "content-vault.net", domainMasked: "co••••••••••.net", sourceKind: "website", matchType: "Paywalled repost" },
];

const CONFIDENCE_BY_SCORE = (score: number): DemoMatch["confidence"] =>
  score >= 82 ? "high" : score >= 55 ? "medium" : "low";

/**
 * Full match list. The first 8 are curated (shown during the scan
 * choreography and at the top of the dashboard); the rest fill to a
 * realistic volume. High-confidence count is tuned to 41.
 */
function buildMatches(): DemoMatch[] {
  const rand = mulberry32(90210);
  const out: DemoMatch[] = [];
  const featured: Array<[number, number, DemoMatch["state"]]> = [
    [0, 94, "review"],
    [1, 88, "possible"],
    [2, 91, "confirmed"],
    [3, 71, "possible"],
    [4, 63, "possible"],
    [5, 86, "review"],
    [6, 58, "possible"],
    [7, 79, "review"],
  ];
  featured.forEach(([tpl, score, state], i) => {
    const t = MATCH_TEMPLATES[tpl]!;
    out.push({
      id: `MATCH-${1000 + i}`,
      domainMasked: t.domainMasked,
      domainFull: t.domainFull,
      sourceKind: t.sourceKind,
      matchType: t.matchType,
      detectedAt: ago(2 + i * 5),
      confidence: CONFIDENCE_BY_SCORE(score),
      confidenceScore: score,
      state,
      thumbSeed: 100 + i,
    });
  });

  // Fill to a fuller list for the dashboard tables. We keep the
  // count modest (not literally 187 rows) but never claim a
  // contradicting total — 187 is the detected figure, this is the
  // reviewable slice shown in the workspace.
  let highCount = out.filter((m) => m.confidence === "high").length;
  for (let i = 8; i < 46; i++) {
    const t = MATCH_TEMPLATES[Math.floor(rand() * MATCH_TEMPLATES.length)]!;
    // Steer toward reaching 41 high-confidence overall across the
    // narrative (dashboard shows the proportion, not all 187).
    const wantHigh = highCount < 20 && rand() > 0.45;
    const score = wantHigh
      ? 82 + Math.floor(rand() * 16)
      : 40 + Math.floor(rand() * 44);
    const confidence = CONFIDENCE_BY_SCORE(score);
    if (confidence === "high") highCount++;
    out.push({
      id: `MATCH-${1000 + i}`,
      domainMasked: t.domainMasked,
      domainFull: t.domainFull,
      sourceKind: t.sourceKind,
      matchType: t.matchType,
      detectedAt: ago(6 + i * 7 + Math.floor(rand() * 5)),
      confidence,
      confidenceScore: score,
      state: rand() > 0.7 ? "review" : "possible",
      thumbSeed: 100 + i,
    });
  }
  return out;
}

export const demoMatches: DemoMatch[] = buildMatches();

/** The 8 curated matches surfaced during the live scan. */
export const featuredMatches: DemoMatch[] = demoMatches.slice(0, 8);

/* ── Takedowns (dashboard) ─────────────────────────────────────── */

export type TakedownStatus =
  | "drafted"
  | "submitted"
  | "acknowledged"
  | "removed"
  | "rejected";

export interface DemoTakedown {
  id: string;
  domainMasked: string;
  sourceKind: DemoMatch["sourceKind"];
  status: TakedownStatus;
  submittedAt: string | null;
  updatedAt: string;
  matchId: string;
}

export const demoTakedowns: DemoTakedown[] = [
  { id: "TD-2041", domainMasked: "mi••••••••.io", sourceKind: "mirror", status: "removed", submittedAt: ago(190), updatedAt: ago(40), matchId: "MATCH-1002" },
  { id: "TD-2042", domainMasked: "re•••••••.to", sourceKind: "website", status: "acknowledged", submittedAt: ago(70), updatedAt: ago(12), matchId: "MATCH-1000" },
  { id: "TD-2043", domainMasked: "le•••••••.forum", sourceKind: "forum", status: "submitted", submittedAt: ago(20), updatedAt: ago(20), matchId: "MATCH-1001" },
  { id: "TD-2044", domainMasked: "ga•••••••.cc", sourceKind: "website", status: "drafted", submittedAt: null, updatedAt: ago(4), matchId: "MATCH-1005" },
  { id: "TD-2045", domainMasked: "ca••••••.ru", sourceKind: "mirror", status: "rejected", submittedAt: ago(140), updatedAt: ago(96), matchId: "MATCH-1007" },
];

/* ── Monitored profiles (dashboard) ────────────────────────────── */

export interface DemoProfile {
  id: string;
  username: string;
  platform: string;
  matches: number;
  newThisWeek: number;
  exposure: "low" | "moderate" | "elevated" | "high";
  lastScan: string;
}

export const demoProfiles: DemoProfile[] = [
  { id: "PRF-01", username: "mia.also", platform: "OnlyFans", matches: 187, newThisWeek: 23, exposure: "elevated", lastScan: ago(4) },
  { id: "PRF-02", username: "mia.also", platform: "Fansly", matches: 64, newThisWeek: 5, exposure: "moderate", lastScan: ago(4) },
  { id: "PRF-03", username: "miaa_official", platform: "MYM", matches: 21, newThisWeek: 2, exposure: "low", lastScan: ago(28) },
];

/* ── Recent source activity (dashboard) ────────────────────────── */

export interface SourceActivity {
  id: string;
  domainMasked: string;
  sourceKind: DemoMatch["sourceKind"];
  event: string;
  at: string;
}

export const sourceActivity: SourceActivity[] = [
  { id: "SA-1", domainMasked: "re•••••••.to", sourceKind: "website", event: "3 new matches indexed", at: ago(3) },
  { id: "SA-2", domainMasked: "mi••••••••.io", sourceKind: "mirror", event: "Content confirmed removed", at: ago(40) },
  { id: "SA-3", domainMasked: "le•••••••.forum", sourceKind: "forum", event: "Thread updated with reposts", at: ago(9) },
  { id: "SA-4", domainMasked: "op••••••••.app", sourceKind: "channel", event: "New public channel detected", at: ago(15) },
  { id: "SA-5", domainMasked: "ca••••••.ru", sourceKind: "mirror", event: "Recurrence after removal", at: ago(52) },
];
