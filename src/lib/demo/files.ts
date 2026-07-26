import type { DemoMatch } from "@/lib/scan/types";
import { DEMO_ANCHOR, demoMatches, sourceCoverage } from "./scan-data";

/* ════════════════════════════════════════════════════════════════
   THE FILE LIBRARY — demonstration data.

   The workspace is not a dashboard over a database; it is a shelf of
   protection files, one per creator profile. Everything below is
   deterministic so server and client render identically, and it is
   plainly demonstration material: no real scan is performed and no
   real address is stored.
   ════════════════════════════════════════════════════════════════ */

function ago(hours: number): string {
  return new Date(new Date(DEMO_ANCHOR).getTime() - hours * 3_600_000)
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");
}

export type FileGroup =
  | "active"
  | "priority"
  | "new"
  | "unverified"
  | "removal";

export const FILE_GROUPS: Array<{
  id: FileGroup;
  label: string;
  note: string;
}> = [
  {
    id: "active",
    label: "Active files",
    note: "Every profile file currently open in this workspace.",
  },
  {
    id: "priority",
    label: "Priority review",
    note: "High-confidence findings waiting on a decision.",
  },
  {
    id: "new",
    label: "New findings",
    note: "Detected since the last time the file was opened.",
  },
  {
    id: "unverified",
    label: "Awaiting verification",
    note: "Sealed until ownership of the profile is confirmed.",
  },
  {
    id: "removal",
    label: "Removal in progress",
    note: "Requests sent and awaiting a response from the source.",
  },
];

export type Exposure = "low" | "moderate" | "elevated" | "high";

export interface FileRecord {
  ref: string;
  /** URL segment — the reference, lowercased. */
  slug: string;
  username: string;
  platform: string;
  owner: string;
  opened: string;
  lastScan: string;
  verified: boolean;
  exposure: Exposure;
  exposureScore: number;
  findings: number;
  newFindings: number;
  highConfidence: number;
  sources: number;
  awaitingReview: number;
  removalsOpen: number;
  removed: number;
  monitoring: "weekly" | "daily" | "paused";
  standing: string;
}

const RECORDS: Array<Omit<FileRecord, "slug">> = [
  {
    ref: "ARG-20260724-3210",
    username: "mia.also",
    platform: "OnlyFans",
    owner: "Mia A.",
    opened: ago(1_440),
    lastScan: ago(4),
    verified: true,
    exposure: "elevated",
    exposureScore: 68,
    findings: 187,
    newFindings: 23,
    highConfidence: 41,
    sources: 34,
    awaitingReview: 12,
    removalsOpen: 3,
    removed: 18,
    monitoring: "daily",
    standing: "12 findings need a decision before removal can be requested.",
  },
  {
    ref: "ARG-20260722-4417",
    username: "lys.andre",
    platform: "Fansly",
    owner: "Lys A.",
    opened: ago(2_160),
    lastScan: ago(9),
    verified: true,
    exposure: "high",
    exposureScore: 81,
    findings: 96,
    newFindings: 8,
    highConfidence: 37,
    sources: 21,
    awaitingReview: 6,
    removalsOpen: 5,
    removed: 11,
    monitoring: "daily",
    standing: "Five removal requests are open, two past their response window.",
  },
  {
    ref: "ARG-20260719-8842",
    username: "mia.also",
    platform: "Fansly",
    owner: "Mia A.",
    opened: ago(1_440),
    lastScan: ago(4),
    verified: true,
    exposure: "moderate",
    exposureScore: 44,
    findings: 64,
    newFindings: 5,
    highConfidence: 14,
    sources: 12,
    awaitingReview: 2,
    removalsOpen: 2,
    removed: 9,
    monitoring: "weekly",
    standing: "Two requests acknowledged, awaiting confirmation of removal.",
  },
  {
    ref: "ARG-20260725-5063",
    username: "noor.vance",
    platform: "OnlyFans",
    owner: "Noor V.",
    opened: ago(20),
    lastScan: ago(20),
    verified: false,
    exposure: "elevated",
    exposureScore: 61,
    findings: 73,
    newFindings: 73,
    highConfidence: 19,
    sources: 17,
    awaitingReview: 0,
    removalsOpen: 0,
    removed: 0,
    monitoring: "paused",
    standing: "Sealed. Ownership of the profile has not been verified yet.",
  },
  {
    ref: "ARG-20260712-1174",
    username: "miaa_official",
    platform: "MYM",
    owner: "Mia A.",
    opened: ago(4_320),
    lastScan: ago(28),
    verified: true,
    exposure: "low",
    exposureScore: 18,
    findings: 21,
    newFindings: 2,
    highConfidence: 3,
    sources: 8,
    awaitingReview: 1,
    removalsOpen: 0,
    removed: 6,
    monitoring: "weekly",
    standing: "No new source has carried this profile in eleven days.",
  },
];

export const fileLibrary: FileRecord[] = RECORDS.map((r) => ({
  ...r,
  slug: r.ref.toLowerCase(),
}));

export function fileBySlug(slug: string): FileRecord | undefined {
  return fileLibrary.find((f) => f.slug === slug.toLowerCase());
}

/** Which files belong in a given shelf of the library. */
export function filesInGroup(group: FileGroup): FileRecord[] {
  switch (group) {
    case "active":
      return fileLibrary;
    case "priority":
      return fileLibrary.filter((f) => f.verified && f.awaitingReview > 0);
    case "new":
      return fileLibrary.filter((f) => f.newFindings > 0);
    case "unverified":
      return fileLibrary.filter((f) => !f.verified);
    case "removal":
      return fileLibrary.filter((f) => f.removalsOpen > 0);
  }
}

/* ── Contents of a single file ─────────────────────────────────── */

/**
 * Findings are drawn from the shared match set so the workspace and
 * the public scan never disagree about what was detected. Each file
 * takes a stable slice keyed off its reference.
 */
export function findingsFor(file: FileRecord): DemoMatch[] {
  const seed = Number(file.ref.slice(-4)) % demoMatches.length;
  const take = Math.min(14, Math.max(6, Math.round(file.findings / 12)));
  const out: DemoMatch[] = [];
  for (let i = 0; i < take; i++) {
    out.push(demoMatches[(seed + i * 3) % demoMatches.length]!);
  }
  return out;
}

export interface FileSourceEntry {
  kind: string;
  label: string;
  count: number;
  removed: number;
  recurring: number;
}

export function sourcesFor(file: FileRecord): FileSourceEntry[] {
  const total = sourceCoverage.reduce((a, s) => a + s.count, 0);
  return sourceCoverage.map((s, i) => {
    const count = Math.max(1, Math.round((s.count / total) * file.sources));
    return {
      kind: s.kind,
      label: s.label,
      count,
      removed: Math.min(count, Math.round(file.removed / (i + 3))),
      recurring: i === 2 ? Math.min(count, 2) : i === 0 ? 1 : 0,
    };
  });
}

export interface FileEvent {
  id: string;
  at: string;
  title: string;
  detail?: string;
}

export function timelineFor(file: FileRecord): FileEvent[] {
  const base: FileEvent[] = [
    {
      id: "e1",
      at: file.opened,
      title: "File opened",
      detail: `Public profile @${file.username} added to the workspace.`,
    },
  ];

  if (file.verified) {
    base.push({
      id: "e2",
      at: ago(hoursSince(file.opened) - 6),
      title: "Ownership verified",
      detail: "Profile confirmed by the account holder. Full file unsealed.",
    });
    base.push({
      id: "e3",
      at: ago(hoursSince(file.lastScan) + 168),
      title: "Monitoring started",
      detail:
        file.monitoring === "daily"
          ? "Daily comparison against indexed public sources."
          : "Weekly comparison against indexed public sources.",
    });
  }

  if (file.removed > 0) {
    base.push({
      id: "e4",
      at: ago(hoursSince(file.lastScan) + 62),
      title: `${file.removed} findings confirmed removed`,
      detail: "Sources responded and the material is no longer reachable.",
    });
  }

  if (file.removalsOpen > 0) {
    base.push({
      id: "e5",
      at: ago(hoursSince(file.lastScan) + 20),
      title: `${file.removalsOpen} removal requests sent`,
      detail: "Awaiting a response from each source.",
    });
  }

  base.push({
    id: "e6",
    at: file.lastScan,
    title: `Scan completed — ${file.newFindings} new findings`,
    detail: `${file.sources} indexed public sources compared.`,
  });

  return base.sort((a, b) => (a.at < b.at ? 1 : -1));
}

function hoursSince(iso: string): number {
  return Math.round(
    (new Date(DEMO_ANCHOR).getTime() - new Date(iso).getTime()) / 3_600_000
  );
}

export type ActionState =
  | "drafted"
  | "sent"
  | "acknowledged"
  | "removed"
  | "declined";

export interface FileAction {
  id: string;
  redaction: DemoMatch["redaction"];
  state: ActionState;
  sentAt: string | null;
  updatedAt: string;
  route: string;
}

export const actionStateLabels: Record<ActionState, string> = {
  drafted: "Drafted",
  sent: "Request sent",
  acknowledged: "Acknowledged",
  removed: "Removed",
  declined: "Declined",
};

export function actionsFor(file: FileRecord): FileAction[] {
  const order: ActionState[] = [
    "removed",
    "acknowledged",
    "sent",
    "drafted",
    "declined",
  ];
  const routes = [
    "Host abuse contact",
    "Registrar complaint",
    "Platform reporting form",
    "Search de-indexing",
    "Host abuse contact",
  ];
  const findings = findingsFor(file);
  const count = Math.min(
    findings.length,
    file.removalsOpen + Math.min(3, file.removed > 0 ? 2 : 0)
  );
  return Array.from({ length: count }, (_, i) => {
    const m = findings[i]!;
    const state = order[i % order.length]!;
    return {
      id: `${file.ref}-A${String(i + 1).padStart(2, "0")}`,
      redaction: m.redaction,
      state,
      sentAt: state === "drafted" ? null : ago(72 + i * 26),
      updatedAt: ago(6 + i * 14),
      route: routes[i % routes.length]!,
    };
  });
}

/* ── Workspace-level facts ─────────────────────────────────────── */

export const workspace = {
  name: "Studio Vela",
  kind: "Agency workspace",
  seats: 4,
  filesOpen: fileLibrary.length,
} as const;

export const exposureLabels: Record<Exposure, string> = {
  low: "Low",
  moderate: "Moderate",
  elevated: "Elevated",
  high: "High",
};
