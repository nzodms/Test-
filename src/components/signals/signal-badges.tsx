import { Badge } from "@/components/ui/badge";
import type { Severity, SignalStatus } from "@/lib/data";

/**
 * Severity / status presentation shared by the Signals table, drawer
 * and creation dialog so every surface renders identically.
 */

const SEVERITY_META: Record<
  Severity,
  { label: string; variant: "critical" | "caution" | "halo" | "neutral" }
> = {
  critical: { label: "Critical", variant: "critical" },
  high: { label: "High", variant: "caution" },
  medium: { label: "Medium", variant: "halo" },
  low: { label: "Low", variant: "neutral" },
};

const STATUS_META: Record<
  SignalStatus,
  { label: string; variant: "halo" | "caution" | "neutral" | "positive" }
> = {
  new: { label: "New", variant: "halo" },
  investigating: { label: "Investigating", variant: "caution" },
  monitoring: { label: "Monitoring", variant: "neutral" },
  resolved: { label: "Resolved", variant: "positive" },
};

export const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];
export const STATUS_ORDER: SignalStatus[] = [
  "new",
  "investigating",
  "monitoring",
  "resolved",
];

export function severityLabel(severity: Severity): string {
  return SEVERITY_META[severity].label;
}

export function statusLabel(status: SignalStatus): string {
  return STATUS_META[status].label;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity];
  return (
    <Badge variant={meta.variant} dot>
      {meta.label}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: SignalStatus }) {
  const meta = STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
