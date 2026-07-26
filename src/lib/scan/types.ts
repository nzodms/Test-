/**
 * Scan engine types. The visual engine runs on a stream of
 * structured events, so a real backend can later emit the same
 * ScanEvent shape and drive the identical choreography.
 */

export type ScanPhase =
  | "idle"
  | "initializing"
  | "identity"
  | "sources"
  | "matching"
  | "analysis"
  | "assembling"
  | "complete"
  | "locked";

/** Ordered phases the controller advances through. */
export const SCAN_PHASES: ScanPhase[] = [
  "initializing",
  "identity",
  "sources",
  "matching",
  "analysis",
  "assembling",
  "complete",
  "locked",
];

export type EventStatus = "pending" | "active" | "complete" | "warning";

export interface ScanEvent {
  id: string;
  phase: ScanPhase;
  /** what the event does, in the operations registry */
  label: string;
  status: EventStatus;
  /** ms offset from scan start when this event fires */
  at: number;
  /** structured attachment interpreted by the UI (source, match, kpi) */
  payload?: Record<string, unknown>;
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
