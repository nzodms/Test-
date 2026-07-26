/**
 * Plan definitions shared by the marketing pricing section and the
 * in-app billing settings, so the two can never drift apart.
 */

export interface Plan {
  id: "starter" | "pro" | "scale";
  name: string;
  tagline: string;
  monthly: number; // USD per seat / month
  annual: number; // USD per seat / month, billed annually
  highlight: boolean;
  cta: string;
  features: string[];
}

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For small teams getting their first signals under control.",
    monthly: 0,
    annual: 0,
    highlight: false,
    cta: "Start for free",
    features: [
      "Up to 3 members",
      "2 data sources",
      "200 tracked signals / month",
      "3 active automations",
      "7-day activity history",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For operating teams that need full coverage and automation.",
    monthly: 24,
    annual: 19,
    highlight: true,
    cta: "Start 14-day trial",
    features: [
      "Unlimited members",
      "12 data sources",
      "Unlimited signals",
      "25 active automations",
      "Anomaly detection & trends",
      "Weekly reports & exports",
      "90-day activity history",
      "Priority support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For companies running critical operations on Halo.",
    monthly: 49,
    annual: 39,
    highlight: false,
    cta: "Talk to sales",
    features: [
      "Everything in Pro",
      "Unlimited data sources & automations",
      "SSO / SAML & SCIM provisioning",
      "Custom roles & audit log",
      "Unlimited history & data residency",
      "99.9% uptime SLA",
      "Dedicated success engineer",
    ],
  },
];

/** Feature comparison table rows for the pricing section. */
export const planComparison: Array<{
  group: string;
  rows: Array<{ label: string; values: [string, string, string] }>;
}> = [
  {
    group: "Workspace",
    rows: [
      { label: "Members", values: ["3", "Unlimited", "Unlimited"] },
      { label: "Data sources", values: ["2", "12", "Unlimited"] },
      { label: "Tracked signals", values: ["200 / mo", "Unlimited", "Unlimited"] },
      { label: "Activity history", values: ["7 days", "90 days", "Unlimited"] },
    ],
  },
  {
    group: "Intelligence",
    rows: [
      { label: "Anomaly detection", values: ["—", "Included", "Included"] },
      { label: "Trends & comparisons", values: ["Basic", "Included", "Included"] },
      { label: "Executive reports", values: ["—", "Weekly", "Custom cadence"] },
    ],
  },
  {
    group: "Automation",
    rows: [
      { label: "Active automations", values: ["3", "25", "Unlimited"] },
      { label: "Run history", values: ["24 h", "30 days", "Unlimited"] },
      { label: "Approval steps", values: ["—", "Included", "Included"] },
    ],
  },
  {
    group: "Security & support",
    rows: [
      { label: "SSO / SAML", values: ["—", "—", "Included"] },
      { label: "Audit log", values: ["—", "30 days", "Unlimited"] },
      { label: "Support", values: ["Community", "Priority", "Dedicated engineer"] },
      { label: "Uptime SLA", values: ["—", "—", "99.9%"] },
    ],
  },
];
