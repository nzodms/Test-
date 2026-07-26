/**
 * Domain types shared by the demo dataset and the (future) Supabase
 * provider. UI components only ever consume these shapes, so swapping
 * the data source never touches a page.
 */

export type Severity = "critical" | "high" | "medium" | "low";
export type SignalStatus = "new" | "investigating" | "monitoring" | "resolved";

export interface Signal {
  id: string; // e.g. "SIG-1042"
  title: string;
  description: string;
  severity: Severity;
  status: SignalStatus;
  source: string; // integration name, e.g. "Stripe"
  tags: string[];
  assigneeId: string | null;
  impact: number; // 0–100 composite impact score
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type MemberRole = "owner" | "admin" | "member" | "viewer";
export type MemberStatus = "active" | "invited";

export interface Member {
  id: string;
  name: string;
  email: string;
  title: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  lastActiveAt: string;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastRunAt: string | null;
  successRate: number; // 0–1 over the window
  runsThisWeek: number;
  category: "alerting" | "triage" | "revenue" | "compliance" | "reporting";
  history: AutomationRun[];
}

export interface AutomationRun {
  id: string;
  startedAt: string;
  durationMs: number;
  status: "success" | "failure" | "skipped";
  note: string;
}

export type ReportStatus = "ready" | "generating" | "scheduled";

export interface Report {
  id: string;
  title: string;
  period: string; // e.g. "Jul 14 – Jul 20"
  status: ReportStatus;
  createdAt: string;
  pages: number;
  highlights: string[];
  format: "PDF" | "CSV";
}

export type ActivityKind =
  | "signal"
  | "automation"
  | "member"
  | "report"
  | "settings"
  | "alert";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  actor: string; // member name or "Halo"
  action: string; // sentence fragment, e.g. "resolved signal"
  target: string; // e.g. "SIG-1029 · Checkout error spike"
  at: string; // ISO
  detail?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  kind: "signal" | "automation" | "report" | "team";
  href: string;
}

export interface DailyPoint {
  date: string; // "2026-07-24"
  detected: number;
  resolved: number;
  automationRuns: number;
  responseHours: number; // median time-to-response that day
}

export interface Trend {
  id: string;
  title: string;
  direction: "up" | "down" | "flat";
  change: string; // human-readable, e.g. "+18% over 4 weeks"
  summary: string;
  tone: "positive" | "negative" | "neutral";
}

export interface Anomaly {
  id: string;
  title: string;
  detectedAt: string;
  severity: Severity;
  metric: string;
  deviation: string; // e.g. "3.4σ above baseline"
  explanation: string;
  recommendation: string;
  relatedSignalId: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  plan: "starter" | "pro" | "scale";
  slug: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
}
