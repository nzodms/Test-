import type {
  ActivityEvent,
  Anomaly,
  AppNotification,
  Automation,
  AutomationRun,
  DailyPoint,
  Integration,
  Member,
  Report,
  Signal,
  SignalStatus,
  Severity,
  Trend,
  Workspace,
} from "./types";

/* ────────────────────────────────────────────────────────────────
   DEMO DATASET — single source of truth.

   Everything is deterministic and anchored to DEMO_NOW so server
   and client render identical output. Every figure shown anywhere
   in the product is either taken from these arrays or *derived*
   from them (see selectors at the bottom) — never duplicated by
   hand — so pages can't contradict each other.
   ──────────────────────────────────────────────────────────────── */

export const DEMO_NOW = "2026-07-24T16:30:00Z";

const DAY = 86_400_000;

/** Hours before DEMO_NOW → ISO string. */
function ago(hours: number): string {
  return new Date(new Date(DEMO_NOW).getTime() - hours * 3_600_000)
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");
}

/** Deterministic PRNG (mulberry32) so the dataset never shifts. */
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

/* ── Workspace & team ──────────────────────────────────────────── */

export const demoWorkspaces: Workspace[] = [
  { id: "ws-01", name: "Northwind Systems", plan: "pro", slug: "northwind" },
  { id: "ws-02", name: "Northwind Labs", plan: "starter", slug: "nw-labs" },
];

export const demoUser = {
  id: "m-01",
  name: "Sam Rivera",
  email: "sam@northwind.io",
  title: "Operations Lead",
};

export const demoMembers: Member[] = [
  {
    id: "m-01",
    name: "Sam Rivera",
    email: "sam@northwind.io",
    title: "Operations Lead",
    role: "owner",
    status: "active",
    joinedAt: "2025-02-11T09:00:00Z",
    lastActiveAt: ago(0.2),
  },
  {
    id: "m-02",
    name: "Amara Okafor",
    email: "amara@northwind.io",
    title: "Head of Operations",
    role: "admin",
    status: "active",
    joinedAt: "2025-02-11T09:30:00Z",
    lastActiveAt: ago(1.5),
  },
  {
    id: "m-03",
    name: "Jonas Lindqvist",
    email: "jonas@northwind.io",
    title: "Data Engineer",
    role: "member",
    status: "active",
    joinedAt: "2025-03-02T14:00:00Z",
    lastActiveAt: ago(3),
  },
  {
    id: "m-04",
    name: "Priya Sharma",
    email: "priya@northwind.io",
    title: "Finance Manager",
    role: "member",
    status: "active",
    joinedAt: "2025-04-18T10:00:00Z",
    lastActiveAt: ago(6),
  },
  {
    id: "m-05",
    name: "Tomás Herrera",
    email: "tomas@northwind.io",
    title: "Support Lead",
    role: "member",
    status: "active",
    joinedAt: "2025-05-07T08:00:00Z",
    lastActiveAt: ago(0.8),
  },
  {
    id: "m-06",
    name: "Elif Kaya",
    email: "elif@northwind.io",
    title: "Growth PM",
    role: "member",
    status: "active",
    joinedAt: "2025-06-23T11:00:00Z",
    lastActiveAt: ago(26),
  },
  {
    id: "m-07",
    name: "Marcus Chen",
    email: "marcus@northwind.io",
    title: "Platform Engineer",
    role: "admin",
    status: "active",
    joinedAt: "2025-08-14T09:00:00Z",
    lastActiveAt: ago(2.2),
  },
  {
    id: "m-08",
    name: "Ingrid Bauer",
    email: "ingrid@northwind.io",
    title: "Compliance Officer",
    role: "viewer",
    status: "active",
    joinedAt: "2025-11-03T13:00:00Z",
    lastActiveAt: ago(50),
  },
  {
    id: "m-09",
    name: "Noah Adeyemi",
    email: "noah@northwind.io",
    title: "Revenue Analyst",
    role: "member",
    status: "invited",
    joinedAt: ago(30),
    lastActiveAt: ago(30),
  },
];

/* ── Integrations (fictional connections) ──────────────────────── */

export const demoIntegrations: Integration[] = [
  { id: "int-stripe", name: "Stripe", description: "Payments, refunds and dispute events", category: "Revenue", connected: true },
  { id: "int-datadog", name: "Datadog", description: "Infrastructure monitors and APM alerts", category: "Engineering", connected: true },
  { id: "int-salesforce", name: "Salesforce", description: "Pipeline changes and account health", category: "Sales", connected: true },
  { id: "int-zendesk", name: "Zendesk", description: "Ticket volume, CSAT and escalations", category: "Support", connected: true },
  { id: "int-github", name: "GitHub", description: "Deploys, incidents and release activity", category: "Engineering", connected: true },
  { id: "int-snowflake", name: "Snowflake", description: "Warehouse jobs and data freshness", category: "Data", connected: true },
  { id: "int-slack", name: "Slack", description: "Notification delivery and digests", category: "Messaging", connected: true },
  { id: "int-hubspot", name: "HubSpot", description: "Marketing funnels and form conversions", category: "Marketing", connected: false },
  { id: "int-linear", name: "Linear", description: "Issue throughput and cycle health", category: "Engineering", connected: false },
  { id: "int-netsuite", name: "NetSuite", description: "Invoices, POs and ledger anomalies", category: "Finance", connected: false },
  { id: "int-pagerduty", name: "PagerDuty", description: "On-call schedules and incident sync", category: "Engineering", connected: false },
  { id: "int-looker", name: "Looker", description: "Dashboard usage and metric drift", category: "Data", connected: false },
];

/* ── Signals ───────────────────────────────────────────────────── */

let signalSeq = 1042;
function sig(
  partial: Omit<Signal, "id" | "updatedAt"> & { updatedAt?: string }
): Signal {
  signalSeq += 1;
  return {
    id: `SIG-${signalSeq}`,
    updatedAt: partial.updatedAt ?? partial.createdAt,
    ...partial,
  };
}

/** Curated, story-carrying signals — these surface first everywhere. */
const curatedSignals: Signal[] = [
  sig({
    title: "Checkout error rate 4.1% on EU cluster",
    description:
      "Card authorizations against the EU payment cluster began failing at 09:12 UTC. The error rate is 3.4σ above the 28-day baseline and correlates with the v2.61 gateway deploy.",
    severity: "critical",
    status: "investigating",
    source: "Stripe",
    tags: ["payments", "eu-west", "regression"],
    assigneeId: "m-07",
    impact: 92,
    createdAt: ago(7),
    updatedAt: ago(1),
  }),
  sig({
    title: "Enterprise renewal at risk — Meridian Group",
    description:
      "Usage across the Meridian Group account dropped 41% over three weeks and their champion has not logged in for 12 days. Renewal is due in 26 days at $86k ARR.",
    severity: "critical",
    status: "investigating",
    source: "Salesforce",
    tags: ["churn-risk", "enterprise", "arr"],
    assigneeId: "m-06",
    impact: 88,
    createdAt: ago(30),
    updatedAt: ago(4),
  }),
  sig({
    title: "Warehouse sync 6h behind schedule",
    description:
      "The nightly Snowflake ingestion for billing events has been running long for three consecutive nights. Downstream revenue dashboards are stale after 08:00 UTC.",
    severity: "critical",
    status: "monitoring",
    source: "Snowflake",
    tags: ["data-freshness", "billing"],
    assigneeId: "m-03",
    impact: 81,
    createdAt: ago(54),
    updatedAt: ago(9),
  }),
  sig({
    title: "Support backlog past SLA in APAC queue",
    description:
      "42 tickets in the APAC queue exceed the 8-hour first-response SLA. Volume is up 58% week-over-week following the mobile release.",
    severity: "critical",
    status: "new",
    source: "Zendesk",
    tags: ["sla", "support", "apac"],
    assigneeId: "m-05",
    impact: 79,
    createdAt: ago(3),
  }),
  sig({
    title: "Refund volume trending 2.3× baseline",
    description:
      "Refund requests referencing order duplication have accelerated since Tuesday. Pattern matches a double-submit bug in the checkout retry logic.",
    severity: "high",
    status: "investigating",
    source: "Stripe",
    tags: ["refunds", "checkout"],
    assigneeId: "m-04",
    impact: 74,
    createdAt: ago(52),
    updatedAt: ago(20),
  }),
  sig({
    title: "API p95 latency degraded to 840ms",
    description:
      "Latency on the public API has degraded 31% since the connection-pool change on Jul 21. Two enterprise customers have opened tickets referencing timeouts.",
    severity: "high",
    status: "investigating",
    source: "Datadog",
    tags: ["latency", "api", "enterprise"],
    assigneeId: "m-07",
    impact: 71,
    createdAt: ago(76),
    updatedAt: ago(12),
  }),
  sig({
    title: "Expansion opportunity — Atlas Freight seats",
    description:
      "Atlas Freight has 34 pending seat invitations against a 25-seat plan and hit usage limits twice this month. Strong candidate for a Scale-tier conversation.",
    severity: "high",
    status: "new",
    source: "Salesforce",
    tags: ["opportunity", "expansion"],
    assigneeId: "m-06",
    impact: 68,
    createdAt: ago(28),
  }),
  sig({
    title: "Deploy frequency down 40% in platform repo",
    description:
      "Weekly deploys to the platform monorepo fell from 32 to 19. Cycle time on review is the widening stage — median review wait grew from 4h to 11h.",
    severity: "medium",
    status: "monitoring",
    source: "GitHub",
    tags: ["velocity", "engineering"],
    assigneeId: "m-07",
    impact: 55,
    createdAt: ago(120),
    updatedAt: ago(70),
  }),
  sig({
    title: "CSAT dipped to 4.31 after pricing email",
    description:
      "Customer satisfaction fell 0.22 points in the 48 hours following the July pricing announcement. Negative verbatims cluster around annual-plan proration.",
    severity: "medium",
    status: "monitoring",
    source: "Zendesk",
    tags: ["csat", "pricing"],
    assigneeId: "m-05",
    impact: 52,
    createdAt: ago(96),
    updatedAt: ago(40),
  }),
  sig({
    title: "Duplicate vendor invoices flagged — €12.4k",
    description:
      "Three invoice pairs from the same vendor share amounts and PO references within a 48-hour window. Likely double-billing rather than fraud, but worth a hold.",
    severity: "high",
    status: "new",
    source: "NetSuite",
    tags: ["finance", "anomaly"],
    assigneeId: "m-04",
    impact: 64,
    createdAt: ago(10),
  }),
  sig({
    title: "Trial-to-paid conversion up 3.1 pts",
    description:
      "The June onboarding rework is compounding: trial cohorts now convert at 19.4%. The largest lift is in self-serve teams of 5–20 seats.",
    severity: "low",
    status: "monitoring",
    source: "HubSpot",
    tags: ["opportunity", "growth"],
    assigneeId: "m-06",
    impact: 45,
    createdAt: ago(200),
    updatedAt: ago(30),
  }),
  sig({
    title: "SSO certificate expires in 11 days",
    description:
      "The SAML signing certificate for the Okta integration expires Aug 4. Two enterprise tenants authenticate through this path.",
    severity: "medium",
    status: "new",
    source: "Datadog",
    tags: ["security", "certificates"],
    assigneeId: "m-07",
    impact: 58,
    createdAt: ago(16),
  }),
  sig({
    title: "Payroll variance 4.8% over forecast",
    description:
      "July payroll landed above forecast on contractor hours in the data team. Recurring pattern in month-end sprints — worth a budget line review.",
    severity: "low",
    status: "new",
    source: "NetSuite",
    tags: ["finance", "forecast"],
    assigneeId: "m-04",
    impact: 38,
    createdAt: ago(60),
  }),
  sig({
    title: "New security advisory affects node-forge",
    description:
      "A high-severity CVE affects a transitive dependency in two services. No exploit path confirmed in our usage, patch available upstream.",
    severity: "medium",
    status: "investigating",
    source: "GitHub",
    tags: ["security", "dependencies"],
    assigneeId: "m-07",
    impact: 61,
    createdAt: ago(22),
    updatedAt: ago(5),
  }),
  sig({
    title: "Checkout error spike resolved — US cluster",
    description:
      "The Jul 21 elevated 5xx rate on US checkout was traced to a cache stampede after the CDN purge and fully mitigated by 14:20 UTC the same day.",
    severity: "critical",
    status: "resolved",
    source: "Datadog",
    tags: ["payments", "us-east", "postmortem"],
    assigneeId: "m-07",
    impact: 85,
    createdAt: ago(78),
    updatedAt: ago(70),
  }),
  sig({
    title: "Dispute rate normalized after 3D Secure fix",
    description:
      "Chargeback rate returned to 0.34% following the 3DS enforcement change. Monitoring window closed with no residual elevation.",
    severity: "high",
    status: "resolved",
    source: "Stripe",
    tags: ["payments", "disputes"],
    assigneeId: "m-04",
    impact: 60,
    createdAt: ago(210),
    updatedAt: ago(140),
  }),
];

/**
 * Template pool used to fill the dataset to realistic volume while
 * keeping every row credible. Combined with rotating sources,
 * severities and ages via the seeded PRNG.
 */
const fillerTemplates: Array<{
  title: string;
  description: string;
  source: string;
  tags: string[];
}> = [
  { title: "Elevated 429s from partner API", description: "Rate-limit responses from the logistics partner API doubled over 24 hours. Retry queue depth is stable but worth watching.", source: "Datadog", tags: ["api", "partners"] },
  { title: "Ticket reopens above threshold", description: "Reopen rate on billing tickets crossed 12% this week, suggesting first responses are resolving symptoms rather than causes.", source: "Zendesk", tags: ["support", "quality"] },
  { title: "Stale opportunity — no activity 14 days", description: "A qualified mid-market opportunity has had no logged activity for two weeks and the close date is this quarter.", source: "Salesforce", tags: ["pipeline", "hygiene"] },
  { title: "Failed payment retries clustering", description: "Involuntary churn risk: retry failures cluster on cards issued by a single regional bank.", source: "Stripe", tags: ["payments", "churn-risk"] },
  { title: "Nightly job runtime creeping up", description: "The reconciliation job runtime grew 18% over two weeks as event volume scales. Still inside its window.", source: "Snowflake", tags: ["data", "capacity"] },
  { title: "Review latency rising in API repo", description: "Median time-to-first-review rose to 9 hours. Two reviewers absorbed 70% of the load.", source: "GitHub", tags: ["velocity"] },
  { title: "NPS verbatims mention onboarding friction", description: "A recurring phrase cluster in this month's NPS verbatims points at confusion during workspace setup.", source: "Zendesk", tags: ["nps", "onboarding"] },
  { title: "Unusual login pattern flagged", description: "A service account authenticated from a new ASN. MFA passed; flagged for confirmation per policy.", source: "Datadog", tags: ["security"] },
  { title: "Usage approaching plan limit — 3 accounts", description: "Three self-serve workspaces are above 85% of their monthly automation quota. Expansion candidates.", source: "HubSpot", tags: ["opportunity", "expansion"] },
  { title: "Invoice aging bucket 60+ grew", description: "Receivables in the 60+ day bucket grew by $18k, concentrated in two accounts with open support escalations.", source: "NetSuite", tags: ["finance", "receivables"] },
  { title: "Error budget 62% consumed", description: "The checkout service consumed most of its monthly error budget in one incident. Release pace review suggested.", source: "Datadog", tags: ["slo", "reliability"] },
  { title: "Docs search null-results rising", description: "Search queries returning no results rose 22%, led by terms around the new permissions model.", source: "HubSpot", tags: ["docs", "self-serve"] },
];

function buildFillerSignals(): Signal[] {
  const rand = mulberry32(20260724);
  const out: Signal[] = [];
  // Distribution chosen so ACTIVE totals land exactly at:
  // critical 4 (all curated), high 13, medium 19, low 11 → 47 active.
  // Curated active: critical 4, high 4, medium 4, low 2.
  const quota: Array<[Severity, SignalStatus, number]> = [
    ["high", "new", 3],
    ["high", "investigating", 3],
    ["high", "monitoring", 3],
    ["medium", "new", 6],
    ["medium", "investigating", 4],
    ["medium", "monitoring", 5],
    ["low", "new", 4],
    ["low", "monitoring", 5],
    ["high", "resolved", 4],
    ["medium", "resolved", 5],
    ["low", "resolved", 3],
  ];
  const assignees = ["m-02", "m-03", "m-04", "m-05", "m-06", "m-07", null];
  let t = 0;
  for (const [severity, status, count] of quota) {
    for (let i = 0; i < count; i++) {
      const tpl = fillerTemplates[t % fillerTemplates.length]!;
      t += 1;
      const ageH = 6 + Math.floor(rand() * 300);
      const impactBase =
        severity === "high" ? 60 : severity === "medium" ? 42 : 25;
      out.push(
        sig({
          title: tpl.title,
          description: tpl.description,
          severity,
          status,
          source: tpl.source,
          tags: tpl.tags,
          assigneeId: assignees[Math.floor(rand() * assignees.length)] ?? null,
          impact: impactBase + Math.floor(rand() * 15),
          createdAt: ago(ageH),
          updatedAt: ago(Math.max(1, ageH - Math.floor(rand() * 48))),
        })
      );
    }
  }
  return out;
}

export const demoSignals: Signal[] = [...curatedSignals, ...buildFillerSignals()]
  .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

/* ── Time series — 8 weeks of daily activity ───────────────────── */

function buildDailySeries(): DailyPoint[] {
  const rand = mulberry32(777);
  const out: DailyPoint[] = [];
  const end = new Date("2026-07-24T00:00:00Z").getTime();
  for (let i = 55; i >= 0; i--) {
    const d = new Date(end - i * DAY);
    const dow = d.getUTCDay();
    const weekend = dow === 0 || dow === 6;
    // Gentle upward trend across the window + weekday rhythm.
    const trend = (55 - i) * 0.06;
    const base = weekend ? 5 : 10.5;
    let detected = Math.round(base + trend + rand() * 4);
    // The Jul 21 incident shows up as a real spike.
    const iso = d.toISOString().slice(0, 10);
    if (iso === "2026-07-21") detected += 9;
    const resolved = Math.max(
      2,
      Math.round(detected * (0.82 + rand() * 0.14) - (weekend ? 1 : 0))
    );
    const automationRuns = Math.round(
      (weekend ? 96 : 168) + trend * 6 + rand() * 26
    );
    // Median response time slowly improving: 4.6h → ~3.1h.
    const responseHours =
      Math.round((4.6 - (55 - i) * 0.026 + rand() * 0.5) * 10) / 10;
    out.push({ date: iso, detected, resolved, automationRuns, responseHours });
  }
  return out;
}

export const demoDailySeries: DailyPoint[] = buildDailySeries();

/* ── Automations ───────────────────────────────────────────────── */

function runs(seed: number, count: number, failEvery = 0): AutomationRun[] {
  const rand = mulberry32(seed);
  const out: AutomationRun[] = [];
  for (let i = 0; i < count; i++) {
    const failed = failEvery > 0 && i % failEvery === failEvery - 1;
    out.push({
      id: `run-${seed}-${i}`,
      startedAt: ago(2 + i * 7 + Math.floor(rand() * 4)),
      durationMs: 400 + Math.floor(rand() * 2200),
      status: failed ? "failure" : "success",
      note: failed
        ? "Slack API returned 503 — retried and delivered on second attempt"
        : "Completed",
    });
  }
  return out;
}

export const demoAutomations: Automation[] = [
  {
    id: "auto-01",
    name: "Escalate critical payment signals",
    description: "Pages the on-call revenue engineer and opens a war-room channel when a payment signal crosses the critical threshold.",
    trigger: "Signal created · severity = critical · source = Stripe",
    action: "Page on-call + create #inc channel in Slack",
    enabled: true,
    lastRunAt: ago(7),
    successRate: 1,
    runsThisWeek: 3,
    category: "alerting",
    history: runs(11, 6),
  },
  {
    id: "auto-02",
    name: "Auto-assign signals by source",
    description: "Routes new signals to the owning team based on source system and tags, so nothing sits unowned.",
    trigger: "Signal created",
    action: "Set assignee from routing table",
    enabled: true,
    lastRunAt: ago(3),
    successRate: 0.995,
    runsThisWeek: 214,
    category: "triage",
    history: runs(12, 6),
  },
  {
    id: "auto-03",
    name: "SLA breach guard",
    description: "Warns the support lead 90 minutes before any ticket queue breaches its first-response SLA.",
    trigger: "Queue projection > SLA − 90min",
    action: "Notify support lead + suggest reinforcements",
    enabled: true,
    lastRunAt: ago(5),
    successRate: 0.982,
    runsThisWeek: 41,
    category: "alerting",
    history: runs(13, 6, 4),
  },
  {
    id: "auto-04",
    name: "Churn-risk scoring",
    description: "Recomputes account health nightly from usage, support and billing signals; opens a signal when a score drops two bands.",
    trigger: "Nightly at 02:00 UTC",
    action: "Score accounts + create churn-risk signals",
    enabled: true,
    lastRunAt: ago(14),
    successRate: 0.988,
    runsThisWeek: 7,
    category: "revenue",
    history: runs(14, 6),
  },
  {
    id: "auto-05",
    name: "Refund anomaly watcher",
    description: "Compares refund velocity to a 28-day baseline every hour and flags sustained deviations above 2σ.",
    trigger: "Hourly",
    action: "Create signal + attach evidence bundle",
    enabled: true,
    lastRunAt: ago(1),
    successRate: 0.996,
    runsThisWeek: 168,
    category: "revenue",
    history: runs(15, 6),
  },
  {
    id: "auto-06",
    name: "Weekly operations digest",
    description: "Compiles the week's signals, resolutions and automation activity into a digest for the leadership channel.",
    trigger: "Fridays at 15:00 UTC",
    action: "Generate digest + post to #leadership",
    enabled: true,
    lastRunAt: ago(1.5),
    successRate: 1,
    runsThisWeek: 1,
    category: "reporting",
    history: runs(16, 6),
  },
  {
    id: "auto-07",
    name: "Invoice retry sequencer",
    description: "Retries failed invoice payments on an optimized schedule and pauses dunning when a support escalation is open.",
    trigger: "Payment failed",
    action: "Schedule smart retries + sync dunning state",
    enabled: true,
    lastRunAt: ago(9),
    successRate: 0.961,
    runsThisWeek: 57,
    category: "revenue",
    history: runs(17, 6, 5),
  },
  {
    id: "auto-08",
    name: "Access review reminder",
    description: "Opens quarterly access-review tasks for system owners and chases sign-off until complete.",
    trigger: "Quarterly · first Monday",
    action: "Create review tasks + weekly reminders",
    enabled: false,
    lastRunAt: ago(640),
    successRate: 1,
    runsThisWeek: 0,
    category: "compliance",
    history: runs(18, 4),
  },
  {
    id: "auto-09",
    name: "Incident postmortem scheduler",
    description: "After any critical signal resolves, books the postmortem, prepares the doc from a template and invites responders.",
    trigger: "Critical signal resolved",
    action: "Schedule postmortem + draft doc",
    enabled: true,
    lastRunAt: ago(70),
    successRate: 0.978,
    runsThisWeek: 2,
    category: "reporting",
    history: runs(19, 5),
  },
];

/* ── Reports ───────────────────────────────────────────────────── */

export const demoReports: Report[] = [
  {
    id: "rep-01",
    title: "Weekly Operations Review — W30",
    period: "Jul 20 – Jul 24",
    status: "generating",
    createdAt: ago(0.4),
    pages: 12,
    highlights: [],
    format: "PDF",
  },
  {
    id: "rep-02",
    title: "Weekly Operations Review — W29",
    period: "Jul 13 – Jul 19",
    status: "ready",
    createdAt: ago(112),
    pages: 14,
    highlights: [
      "Median response time improved 11% week-over-week",
      "Two critical signals traced to the same gateway deploy",
      "Automation coverage reached 78% of recurring workflows",
    ],
    format: "PDF",
  },
  {
    id: "rep-03",
    title: "Weekly Operations Review — W28",
    period: "Jul 6 – Jul 12",
    status: "ready",
    createdAt: ago(280),
    pages: 13,
    highlights: [
      "Support volume normalized after the mobile release spike",
      "Refund anomaly watcher prevented an estimated $9.2k in duplicate refunds",
    ],
    format: "PDF",
  },
  {
    id: "rep-04",
    title: "Q2 Risk Assessment",
    period: "Apr 1 – Jun 30",
    status: "ready",
    createdAt: ago(500),
    pages: 28,
    highlights: [
      "Top recurring risk class: data freshness on billing pipelines",
      "Mean time to detection improved from 6.1h to 3.4h across the quarter",
    ],
    format: "PDF",
  },
  {
    id: "rep-05",
    title: "Automation ROI — June",
    period: "Jun 1 – Jun 30",
    status: "ready",
    createdAt: ago(560),
    pages: 9,
    highlights: [
      "5,312 automated runs replaced an estimated 340 manual hours",
      "Highest-leverage automation: invoice retry sequencer (4.2% recovered revenue)",
    ],
    format: "PDF",
  },
  {
    id: "rep-06",
    title: "Signals export — July",
    period: "Jul 1 – Jul 24",
    status: "scheduled",
    createdAt: ago(2),
    pages: 0,
    highlights: [],
    format: "CSV",
  },
];

/* ── Activity feed ─────────────────────────────────────────────── */

export const demoActivity: ActivityEvent[] = [
  { id: "act-01", kind: "signal", actor: "Marcus Chen", action: "acknowledged", target: "SIG-1043 · Checkout error rate 4.1% on EU cluster", at: ago(1), detail: "Rolled gateway v2.61 back on two of six pods to compare error rates." },
  { id: "act-02", kind: "automation", actor: "Halo", action: "executed", target: "Escalate critical payment signals", at: ago(1.1), detail: "Paged on-call and opened #inc-eu-checkout." },
  { id: "act-03", kind: "signal", actor: "Halo", action: "detected", target: "SIG-1046 · Support backlog past SLA in APAC queue", at: ago(3) },
  { id: "act-04", kind: "member", actor: "Sam Rivera", action: "invited", target: "Noah Adeyemi as Member", at: ago(30) },
  { id: "act-05", kind: "signal", actor: "Elif Kaya", action: "commented on", target: "SIG-1044 · Enterprise renewal at risk — Meridian Group", at: ago(4), detail: "Exec sponsor call booked for Monday. Preparing usage recovery plan." },
  { id: "act-06", kind: "report", actor: "Halo", action: "started generating", target: "Weekly Operations Review — W30", at: ago(0.4) },
  { id: "act-07", kind: "automation", actor: "Priya Sharma", action: "paused", target: "Access review reminder", at: ago(660), detail: "Paused until Q3 cycle opens." },
  { id: "act-08", kind: "signal", actor: "Marcus Chen", action: "resolved", target: "SIG-1057 · Checkout error spike resolved — US cluster", at: ago(70), detail: "Root cause: cache stampede after CDN purge. Postmortem scheduled." },
  { id: "act-09", kind: "alert", actor: "Halo", action: "raised anomaly", target: "Refund volume 2.3× baseline", at: ago(52) },
  { id: "act-10", kind: "settings", actor: "Sam Rivera", action: "updated", target: "notification rules for critical signals", at: ago(75) },
  { id: "act-11", kind: "signal", actor: "Tomás Herrera", action: "reassigned", target: "SIG-1051 · CSAT dipped to 4.31 after pricing email", at: ago(40), detail: "Moved to support quality review." },
  { id: "act-12", kind: "automation", actor: "Halo", action: "executed", target: "Weekly operations digest", at: ago(1.5), detail: "Digest delivered to #leadership." },
  { id: "act-13", kind: "report", actor: "Amara Okafor", action: "exported", target: "Weekly Operations Review — W29", at: ago(100) },
  { id: "act-14", kind: "signal", actor: "Jonas Lindqvist", action: "linked", target: "SIG-1045 · Warehouse sync 6h behind schedule", at: ago(9), detail: "Linked to Snowflake job run history for evidence." },
  { id: "act-15", kind: "member", actor: "Amara Okafor", action: "changed role for", target: "Ingrid Bauer to Viewer", at: ago(220) },
  { id: "act-16", kind: "automation", actor: "Marcus Chen", action: "created", target: "Incident postmortem scheduler", at: ago(400) },
  { id: "act-17", kind: "alert", actor: "Halo", action: "cleared anomaly", target: "Dispute rate normalized after 3D Secure fix", at: ago(140) },
  { id: "act-18", kind: "signal", actor: "Priya Sharma", action: "flagged", target: "SIG-1052 · Duplicate vendor invoices flagged — €12.4k", at: ago(10), detail: "Payment hold placed pending vendor confirmation." },
  { id: "act-19", kind: "settings", actor: "Marcus Chen", action: "connected", target: "Snowflake integration", at: ago(760) },
  { id: "act-20", kind: "report", actor: "Halo", action: "generated", target: "Automation ROI — June", at: ago(560) },
];

/* ── Notifications ─────────────────────────────────────────────── */

export const demoNotifications: AppNotification[] = [
  { id: "ntf-01", title: "Critical signal escalated", body: "Checkout error rate on the EU cluster crossed the critical threshold. On-call has been paged.", at: ago(1), read: false, kind: "signal", href: "/signals" },
  { id: "ntf-02", title: "Renewal risk needs an owner decision", body: "Meridian Group usage is down 41% with renewal in 26 days. A recovery plan draft is ready for review.", at: ago(4), read: false, kind: "signal", href: "/signals" },
  { id: "ntf-03", title: "W30 report is generating", body: "The Weekly Operations Review for Jul 20–24 will be ready in a few minutes.", at: ago(0.4), read: false, kind: "report", href: "/reports" },
  { id: "ntf-04", title: "Digest delivered", body: "The weekly operations digest was posted to #leadership.", at: ago(1.5), read: true, kind: "automation", href: "/automations" },
  { id: "ntf-05", title: "Invitation pending", body: "Noah Adeyemi hasn't accepted their invitation yet. It expires in 5 days.", at: ago(26), read: true, kind: "team", href: "/team" },
  { id: "ntf-06", title: "SLA guard fired", body: "The APAC support queue was projected to breach SLA. Reinforcement suggestions were sent to Tomás.", at: ago(5), read: true, kind: "automation", href: "/automations" },
  { id: "ntf-07", title: "Postmortem scheduled", body: "US checkout spike postmortem booked for Jul 28, 14:00 UTC with four responders.", at: ago(66), read: true, kind: "report", href: "/activity" },
  { id: "ntf-08", title: "Certificate expiry approaching", body: "The Okta SAML signing certificate expires in 11 days. Two tenants are affected.", at: ago(16), read: true, kind: "signal", href: "/signals" },
];

/* ── Intelligence: trends & anomalies ──────────────────────────── */

export const demoTrends: Trend[] = [
  {
    id: "tr-01",
    title: "Median response time",
    direction: "down",
    change: "−18.4% over 4 weeks",
    summary:
      "Response times keep improving as auto-assignment removes the triage queue. The largest gains are on payment and data signals, which now route directly to owners.",
    tone: "positive",
  },
  {
    id: "tr-02",
    title: "Signal volume",
    direction: "up",
    change: "+14.6% week-over-week",
    summary:
      "Detection volume is rising as the Snowflake and GitHub connectors mature. Most of the increase is medium-severity operational drift, not incidents.",
    tone: "neutral",
  },
  {
    id: "tr-03",
    title: "Automation coverage",
    direction: "up",
    change: "78% of recurring workflows",
    summary:
      "Seven of nine automations ran without intervention this week. Invoice retries and SLA guarding remain the highest-leverage flows by hours saved.",
    tone: "positive",
  },
  {
    id: "tr-04",
    title: "Support pressure",
    direction: "up",
    change: "+58% APAC volume",
    summary:
      "The mobile release drove sustained APAC ticket growth. If the pattern holds through Monday, staffing the early shift is the cheapest mitigation.",
    tone: "negative",
  },
];

export const demoAnomalies: Anomaly[] = [
  {
    id: "an-01",
    title: "EU checkout authorization failures",
    detectedAt: ago(7),
    severity: "critical",
    metric: "payment_auth_error_rate",
    deviation: "3.4σ above 28-day baseline",
    explanation:
      "Failures began minutes after the v2.61 gateway deploy and only affect the EU cluster. The error mix is dominated by timeout-class responses, consistent with connection-pool exhaustion rather than issuer declines.",
    recommendation:
      "Keep the partial rollback in place, compare error rates across pod groups for 2 hours, then either complete the rollback or ship the pool-size fix.",
    relatedSignalId: "SIG-1043",
  },
  {
    id: "an-02",
    title: "Refund velocity deviation",
    detectedAt: ago(52),
    severity: "high",
    metric: "refunds_per_hour",
    deviation: "2.3× baseline for 36h",
    explanation:
      "Refund requests referencing duplicate orders accelerated after Tuesday's checkout retry change. The affected orders share a double-submit pattern within 800ms windows.",
    recommendation:
      "Ship the idempotency-key fix behind a flag and reconcile affected orders; the watcher will close this anomaly after 24 quiet hours.",
    relatedSignalId: "SIG-1047",
  },
  {
    id: "an-03",
    title: "Warehouse ingestion drift",
    detectedAt: ago(54),
    severity: "high",
    metric: "sync_lag_minutes",
    deviation: "Job runtime +48% over 3 nights",
    explanation:
      "The billing-events ingestion is scanning an unpartitioned staging table that doubled in size after the event-schema migration. Growth, not failure — but the trend line crosses the SLA within two weeks.",
    recommendation:
      "Partition the staging table on event_date and backfill compaction; estimated to return runtime to the 40-minute band.",
    relatedSignalId: "SIG-1045",
  },
];

/* ── Derived metrics — the only place KPIs are computed ────────── */

export function severityRank(s: Severity): number {
  return { critical: 0, high: 1, medium: 2, low: 3 }[s];
}

const active = demoSignals.filter((s) => s.status !== "resolved");
const last7 = demoDailySeries.slice(-7);
const prev7 = demoDailySeries.slice(-14, -7);
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export const demoMetrics = {
  activeSignals: active.length,
  activeSignalsPrev: 41,
  criticalOpen: active.filter((s) => s.severity === "critical").length,
  medianResponseHours: Math.round(avg(last7.map((d) => d.responseHours)) * 10) / 10,
  medianResponseHoursPrev:
    Math.round(avg(prev7.map((d) => d.responseHours)) * 10) / 10,
  automationRunsThisWeek: demoAutomations.reduce((a, b) => a + b.runsThisWeek, 0),
  automationSuccessRate:
    Math.round(
      (demoAutomations
        .filter((a) => a.enabled)
        .reduce((acc, a) => acc + a.successRate * a.runsThisWeek, 0) /
        Math.max(
          1,
          demoAutomations
            .filter((a) => a.enabled)
            .reduce((acc, a) => acc + a.runsThisWeek, 0)
        )) *
        1000
    ) / 10,
  automationsEnabled: demoAutomations.filter((a) => a.enabled).length,
  automationsTotal: demoAutomations.length,
  opportunityValue: 482_000,
  opportunityValuePrev: 433_000,
  detectedThisWeek: last7.reduce((a, d) => a + d.detected, 0),
  resolvedThisWeek: last7.reduce((a, d) => a + d.resolved, 0),
  detectedPrevWeek: prev7.reduce((a, d) => a + d.detected, 0),
  resolvedPrevWeek: prev7.reduce((a, d) => a + d.resolved, 0),
  unreadNotifications: demoNotifications.filter((n) => !n.read).length,
} as const;

/** Signals ranked for "needs attention" modules. */
export const prioritySignals = [...demoSignals]
  .filter((s) => s.status === "new" || s.status === "investigating")
  .sort(
    (a, b) => severityRank(a.severity) - severityRank(b.severity) || b.impact - a.impact
  )
  .slice(0, 5);

export function memberById(id: string | null): Member | undefined {
  return demoMembers.find((m) => m.id === id);
}
