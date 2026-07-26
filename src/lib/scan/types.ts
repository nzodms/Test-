/**
 * Scan engine types.
 *
 * The visual engine runs on a stream of structured events plus a
 * derived frame, so a real backend can emit the same shapes and drive
 * the identical choreography. No component owns a timer and no
 * component recomputes a timing window.
 */

export type ScanPhase =
  | "idle"
  | "resolving_identity"
  | "checking_profiles"
  | "indexing_sources"
  | "matching_content"
  | "classifying_findings"
  | "calculating_exposure"
  | "building_report"
  | "complete"
  | "locked";

/**
 * The five stages a person actually sees. Phases are the machine's
 * business; stages are what the progress indicator shows, on desktop
 * as a rail and on a phone as "03 / 05".
 */
export const SCAN_STAGES = [
  { id: "identity", label: "Identity" },
  { id: "sources", label: "Sources" },
  { id: "findings", label: "Findings" },
  { id: "exposure", label: "Exposure" },
  { id: "report", label: "Report" },
] as const;

export type StageId = (typeof SCAN_STAGES)[number]["id"];

export const PHASE_STAGE: Record<ScanPhase, number> = {
  idle: -1,
  resolving_identity: 0,
  checking_profiles: 0,
  indexing_sources: 1,
  matching_content: 2,
  classifying_findings: 3,
  calculating_exposure: 3,
  building_report: 4,
  complete: 4,
  locked: 4,
};

export type EventStatus = "pending" | "active" | "complete" | "warning";

export interface ScanEvent {
  id: string;
  phase: ScanPhase;
  /** what the operation did */
  label: string;
  status: EventStatus;
  /** ms offset from scan start when this event fires */
  at: number;
  /** optional value the operation produced, shown at the line's end */
  value?: string;
}

/** The six sections of the report, assembled in this order. */
export const REPORT_SECTIONS = [
  "Summary",
  "Sources",
  "Findings",
  "Timeline",
  "Exposure",
  "Actions",
] as const;

/**
 * Everything the interface needs for one painted frame. Derived once,
 * in the controller, from elapsed time.
 */
export interface ScanFrame {
  phase: ScanPhase;
  /** index into SCAN_STAGES, -1 before the scan starts */
  stage: number;
  /** 0–1 within the current stage */
  stageProgress: number;
  elapsed: number;
  events: ScanEvent[];

  /* Counters — driven by the phase that produces them, never by a
     single fake 0→100 progress value. */
  matches: number;
  sources: number;
  /** how many source kinds have been reached, 0–5 */
  sourcesOpen: number;
  /** running count per source kind */
  sourceCounts: number[];
  highConfidence: number;
  /** confidence split, filled during classification */
  confidenceSplit: { high: number; likely: number; possible: number };
  /** how many featured findings have been inserted so far */
  findingsShown: number;
  /** 0–100, climbs during calculating_exposure */
  exposureScore: number;
  /** how many report sections have been assembled, 0–6 */
  reportSections: number;

  isRunning: boolean;
  isComplete: boolean;
  isLocked: boolean;
}

export type SourceKind = "website" | "forum" | "mirror" | "channel" | "archive";
export type Confidence = "high" | "medium" | "low";
export type MatchState = "possible" | "review" | "confirmed";

export interface SourceCoverage {
  kind: SourceKind;
  label: string;
  count: number;
}

/**
 * What a redacted domain sends to the client: the visible head and
 * tail, plus the LENGTH of what is withheld. The withheld characters
 * are never transmitted, so the redaction cannot be lifted in the
 * browser — it is a protection, not a visual effect.
 */
export interface DomainRedaction {
  head: string;
  tail: string;
  hidden: number;
}

export interface DemoMatch {
  id: string;
  /** compact masked form, for tight contexts */
  domainMasked: string;
  /** the form a real backend sends while ownership is unverified */
  redaction: DomainRedaction;
  /** full domain, only shown to verified owners */
  domainFull: string;
  sourceKind: SourceKind;
  matchType: string;
  detectedAt: string; // ISO
  confidence: Confidence;
  confidenceScore: number; // 0–100
  state: MatchState;
  /** abstract thumbnail seed — never real imagery */
  thumbSeed: number;
}

export interface ActivityPoint {
  week: string; // "W-7" … "W0"
  detections: number;
  recurrences: number;
}
