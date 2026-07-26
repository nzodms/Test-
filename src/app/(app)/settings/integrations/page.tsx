"use client";

import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIntegrations } from "@/lib/data";
import type { Integration } from "@/lib/data";

export default function IntegrationsSettingsPage() {
  const [integrations, setIntegrations] = React.useState<Integration[]>(() =>
    getIntegrations().map((i) => ({ ...i }))
  );
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const connectedCount = integrations.filter((i) => i.connected).length;

  const toggle = (integration: Integration) => {
    setPendingId(integration.id);
    timer.current = setTimeout(() => {
      setPendingId(null);
      setIntegrations((list) =>
        list.map((i) =>
          i.id === integration.id ? { ...i, connected: !i.connected } : i
        )
      );
      toast.success(
        integration.connected
          ? `${integration.name} disconnected`
          : `${integration.name} connected`,
        {
          description: integration.connected
            ? "Existing signals from this source are kept."
            : "Halo will begin ingesting events within a few minutes.",
        }
      );
    }, 600);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="max-w-lg text-sm text-ink-secondary">
          Connected sources feed the signal engine. Disconnecting stops
          ingestion without deleting history.
        </p>
        <p className="tabular text-[13px] text-ink-muted">
          <span className="text-ink">{connectedCount}</span> of{" "}
          {integrations.length} connected
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="surface-card flex flex-col rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-ink">
                {integration.name}
              </p>
              <Badge variant="outline">{integration.category}</Badge>
            </div>
            <p className="mt-1 text-[13px] text-ink-muted">
              {integration.description}
            </p>
            <div className="mt-4 flex flex-1 items-end justify-between gap-3">
              {integration.connected ? (
                <Badge variant="positive" dot>
                  Connected
                </Badge>
              ) : (
                <span className="text-xs text-ink-faint">Not connected</span>
              )}
              {integration.connected ? (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={pendingId === integration.id}
                  onClick={() => toggle(integration)}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  loading={pendingId === integration.id}
                  onClick={() => toggle(integration)}
                >
                  Connect
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
