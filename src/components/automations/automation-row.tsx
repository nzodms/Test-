"use client";

import { Copy, History, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/misc";
import { Switch } from "@/components/ui/switch";
import { dataNow } from "@/lib/data";
import type { Automation } from "@/lib/data";
import { cn, formatNumber, formatRelative } from "@/lib/utils";

/** 0.995 → "99.5%", 1 → "100%" */
function formatRate(rate: number): string {
  const pct = rate * 100;
  return `${pct.toFixed(pct === 100 ? 0 : 1)}%`;
}

/**
 * One automation in the list: enable switch, identity, trigger pill,
 * and a compact metrics cluster with a row-level actions menu.
 */
export function AutomationRow({
  automation,
  onToggle,
  onViewHistory,
  onDuplicate,
  onDelete,
}: {
  automation: Automation;
  onToggle: (id: string, enabled: boolean) => void;
  onViewHistory: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const a = automation;
  const healthy = a.successRate >= 0.98;

  return (
    <li className="surface-card flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
      {/* Identity */}
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Switch
          checked={a.enabled}
          onCheckedChange={(next) => onToggle(a.id, next)}
          aria-label={`${a.enabled ? "Pause" : "Resume"} ${a.name}`}
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3
              className={cn(
                "truncate text-sm font-medium",
                a.enabled ? "text-ink" : "text-ink-secondary"
              )}
            >
              {a.name}
            </h3>
            <Badge variant="outline" className="capitalize">
              {a.category}
            </Badge>
          </div>
          <p className="mt-0.5 line-clamp-1 text-[13px] text-ink-muted max-sm:hidden">
            {a.description}
          </p>
          <div className="mt-2 flex min-w-0">
            <code className="surface-well inline-flex max-w-full items-center rounded-full px-2.5 py-1 font-mono text-2xs text-ink-secondary">
              <span className="truncate">{a.trigger}</span>
            </code>
          </div>
        </div>
      </div>

      {/* Metrics + actions */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pl-12 lg:shrink-0 lg:flex-nowrap lg:justify-end lg:pl-0">
        <div className="w-24">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xs text-ink-muted">Success</span>
            <span className="tabular text-xs text-ink">
              {formatRate(a.successRate)}
            </span>
          </div>
          <Progress
            className="mt-1"
            value={a.successRate * 100}
            tone={healthy ? "positive" : "ember"}
            aria-label={`Success rate ${formatRate(a.successRate)}`}
          />
        </div>
        <div className="min-w-12 text-right">
          <div className="tabular text-sm text-ink">
            {formatNumber(a.runsThisWeek)}
          </div>
          <div className="text-2xs text-ink-muted">runs</div>
        </div>
        <div className="min-w-16 text-right">
          <div className="text-xs text-ink-secondary">
            {a.lastRunAt ? formatRelative(a.lastRunAt, dataNow) : "never"}
          </div>
          <div className="text-2xs text-ink-muted">last run</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${a.name}`}
            >
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onViewHistory(a.id)}>
              <History aria-hidden />
              View history
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDuplicate(a.id)}>
              <Copy aria-hidden />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => onDelete(a.id)}>
              <Trash2 aria-hidden />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}
