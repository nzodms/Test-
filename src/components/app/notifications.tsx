"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck, FileText, Radar, Users, Workflow } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { getNotifications, dataNow, type AppNotification } from "@/lib/data";
import { cn, formatRelative } from "@/lib/utils";

const kindIcon = {
  signal: Radar,
  automation: Workflow,
  report: FileText,
  team: Users,
} as const;

export function NotificationsMenu() {
  const [items, setItems] = React.useState<AppNotification[]>(() =>
    getNotifications()
  );
  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative rounded-md p-2 text-ink-muted transition-colors hover:bg-raised hover:text-ink"
          aria-label={`Notifications — ${unread} unread`}
        >
          <Bell className="size-4.5" aria-hidden />
          {unread > 0 ? (
            <span
              aria-hidden
              className="absolute right-1.5 top-1.5 flex size-2 items-center justify-center"
            >
              <span className="absolute size-2 rounded-full bg-ember-400 motion-safe:animate-pulse-soft" />
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between border-b border-edge px-4 py-3">
          <p className="text-sm font-medium text-ink">Notifications</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            disabled={unread === 0}
            className="h-7 gap-1.5 px-2 text-xs"
          >
            <CheckCheck className="size-3.5" aria-hidden />
            Mark all read
          </Button>
        </div>
        <ul className="max-h-96 overflow-y-auto scrollbar-quiet">
          {items.map((n) => {
            const Icon = kindIcon[n.kind];
            return (
              <li key={n.id} className="border-b border-edge-faint last:border-0">
                <Link
                  href={n.href}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "flex gap-3 px-4 py-3.5 transition-colors hover:bg-raised/70",
                    !n.read && "bg-halo-500/[0.04]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border",
                      n.read
                        ? "border-edge bg-raised text-ink-muted"
                        : "border-halo-500/30 bg-halo-500/10 text-halo-300"
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span
                        className={cn(
                          "truncate text-[13px] font-medium",
                          n.read ? "text-ink-secondary" : "text-ink"
                        )}
                      >
                        {n.title}
                      </span>
                      <span className="shrink-0 text-2xs text-ink-faint">
                        {formatRelative(n.at, dataNow)}
                      </span>
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-ink-muted">
                      {n.body}
                    </span>
                  </span>
                  {!n.read ? (
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-halo-400"
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
