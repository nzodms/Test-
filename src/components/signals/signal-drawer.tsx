"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Field } from "@/components/ui/label";
import { Progress } from "@/components/ui/misc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dataNow, getMemberById, getMembers } from "@/lib/data";
import type { Signal, SignalStatus } from "@/lib/data";
import { formatDateTime, formatRelative } from "@/lib/utils";
import {
  STATUS_ORDER,
  SeverityBadge,
  StatusBadge,
  statusLabel,
} from "./signal-badges";

const activeMembers = getMembers().filter((m) => m.status === "active");
const UNASSIGNED = "unassigned";

function MetaItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-label text-ink-faint">{label}</p>
      <div className="mt-1.5 text-sm text-ink">{children}</div>
    </div>
  );
}

/**
 * Right-hand detail drawer for a single signal. All mutations are
 * delegated to the parent, which owns the signal list.
 */
export function SignalDrawer({
  signal,
  open,
  onOpenChange,
  onChangeStatus,
  onAssign,
}: {
  signal: Signal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeStatus: (id: string, status: SignalStatus) => void;
  onAssign: (id: string, memberId: string | null) => void;
}) {
  // The parent keeps its focus id set while the drawer closes, so
  // content stays put through the exit animation — no retention
  // logic needed here.
  const s = signal;
  if (!s) return null;

  const assignee = getMemberById(s.assigneeId);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent widthClassName="max-w-xl">
        <DrawerHeader>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-2xs text-ink-muted">{s.id}</span>
            <SeverityBadge severity={s.severity} />
            <StatusBadge status={s.status} />
          </div>
          <DrawerTitle className="text-title mt-2 text-lg leading-snug text-ink">
            {s.title}
          </DrawerTitle>
          <DrawerDescription className="mt-1 text-[13px] text-ink-muted">
            Detected via {s.source} · updated{" "}
            {formatRelative(s.updatedAt, dataNow)}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="space-y-6">
          <section>
            <p className="text-label text-ink-faint">Summary</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              {s.description}
            </p>
          </section>

          <section className="grid grid-cols-2 gap-x-4 gap-y-5">
            <MetaItem label="Source">{s.source}</MetaItem>
            <MetaItem label="Impact">
              <div className="flex items-center gap-2.5">
                <span className="tabular font-medium">{s.impact}</span>
                <Progress
                  value={s.impact}
                  className="w-20"
                  aria-label={`Impact ${s.impact} of 100`}
                />
              </div>
            </MetaItem>
            <MetaItem label="Created">{formatDateTime(s.createdAt)}</MetaItem>
            <MetaItem label="Updated">{formatDateTime(s.updatedAt)}</MetaItem>
            <MetaItem label="Assignee">
              {assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar name={assignee.name} size="xs" />
                  <span>{assignee.name}</span>
                </div>
              ) : (
                <span className="text-ink-muted">Unassigned</span>
              )}
            </MetaItem>
          </section>

          {s.tags.length > 0 ? (
            <section>
              <p className="text-label text-ink-faint">Tags</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 border-t border-edge pt-5 sm:grid-cols-2">
            <Field label="Status" htmlFor="signal-drawer-status">
              <Select
                value={s.status}
                onValueChange={(v) => onChangeStatus(s.id, v as SignalStatus)}
              >
                <SelectTrigger
                  id="signal-drawer-status"
                  aria-label="Change status"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Assignee" htmlFor="signal-drawer-assignee">
              <Select
                value={s.assigneeId ?? UNASSIGNED}
                onValueChange={(v) =>
                  onAssign(s.id, v === UNASSIGNED ? null : v)
                }
              >
                <SelectTrigger
                  id="signal-drawer-assignee"
                  aria-label="Change assignee"
                >
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {activeMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </section>
        </DrawerBody>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="ghost">Close</Button>
          </DrawerClose>
          {s.status !== "resolved" ? (
            <Button
              variant="danger"
              onClick={() => onChangeStatus(s.id, "resolved")}
            >
              <CheckCircle2 aria-hidden />
              Resolve
            </Button>
          ) : null}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
