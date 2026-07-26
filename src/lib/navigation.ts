import {
  Activity,
  BarChart3,
  Brain,
  FileText,
  LayoutDashboard,
  Radar,
  Settings,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** short description used by the command palette */
  hint: string;
}

export const appNav: NavItem[] = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard, hint: "Executive summary and KPIs" },
  { label: "Signals", href: "/signals", icon: Radar, hint: "Triage the signal queue" },
  { label: "Intelligence", href: "/intelligence", icon: Brain, hint: "Trends, anomalies and analysis" },
  { label: "Automations", href: "/automations", icon: Workflow, hint: "Automated responses and runs" },
  { label: "Reports", href: "/reports", icon: FileText, hint: "Generated reviews and exports" },
  { label: "Activity", href: "/activity", icon: Activity, hint: "Everything that happened, in order" },
  { label: "Team", href: "/team", icon: Users, hint: "Members, roles and invitations" },
];

export const settingsNav: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
  hint: "Profile, workspace and billing",
};

export const settingsSections = [
  { label: "Profile", href: "/settings" },
  { label: "Organization", href: "/settings/organization" },
  { label: "Appearance", href: "/settings/appearance" },
  { label: "Notifications", href: "/settings/notifications" },
  { label: "Security", href: "/settings/security" },
  { label: "Billing", href: "/settings/billing" },
  { label: "Integrations", href: "/settings/integrations" },
  { label: "Danger zone", href: "/settings/danger" },
] as const;

export { BarChart3 as _iconKeepAlive };
