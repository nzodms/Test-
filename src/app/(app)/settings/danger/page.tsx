"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSimulatedSave } from "@/components/settings/section";
import {
  dataNow,
  getAutomations,
  getCurrentUser,
  getMembers,
  getReports,
  getSignals,
  getWorkspaces,
} from "@/lib/data";
import { cn } from "@/lib/utils";

function DangerSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-critical/25 bg-raised shadow-card",
        className
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <h2 className="text-title text-[15px] text-ink">{title}</h2>
          <p className="mt-1 max-w-xl text-[13px] text-ink-secondary">
            {description}
          </p>
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    </section>
  );
}

export default function DangerZoneSettingsPage() {
  const workspaceName = getWorkspaces()[0]?.name ?? "Northwind Systems";
  const currentUser = getCurrentUser();

  /* ── Export ──────────────────────────────────────────────────── */
  const [exporting, runExport] = useSimulatedSave();
  const exportData = () => {
    runExport(() => {
      const payload = {
        workspace: workspaceName,
        exportedAt: dataNow,
        signals: getSignals(),
        automations: getAutomations(),
        reports: getReports(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "halo-export.json";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded", {
        description: "halo-export.json — signals, automations and reports.",
      });
    });
  };

  /* ── Transfer ownership ──────────────────────────────────────── */
  const eligibleMembers = getMembers().filter(
    (m) => m.status === "active" && m.role === "admin" && m.id !== currentUser.id
  );
  const [transferTarget, setTransferTarget] = React.useState("");
  const [transferring, runTransfer] = useSimulatedSave();
  const targetMember = eligibleMembers.find((m) => m.id === transferTarget);

  const requestTransfer = () => {
    if (!targetMember) return;
    const name = targetMember.name;
    runTransfer(() => {
      setTransferTarget("");
      toast.success("Transfer requested", {
        description: `${name} must accept within 72 hours. Simulated in demo.`,
      });
    });
  };

  /* ── Delete workspace ────────────────────────────────────────── */
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const [deleting, runDelete] = useSimulatedSave();

  const confirmDelete = () => {
    runDelete(() => {
      setDeleteOpen(false);
      setConfirmText("");
      toast("Deletion scheduled — simulated in demo");
    });
  };

  return (
    <div className="space-y-5">
      <p className="max-w-xl text-sm text-ink-secondary">
        These actions affect the entire workspace. Only owners can see this
        page.
      </p>

      <DangerSection
        title="Export workspace data"
        description="Download a JSON snapshot of all signals, automations and reports. Useful before any irreversible change."
      >
        <Button variant="secondary" size="sm" loading={exporting} onClick={exportData}>
          Export data
        </Button>
      </DangerSection>

      <DangerSection
        title="Transfer ownership"
        description="Hand the workspace to another owner-eligible member. You remain an admin after the transfer."
      >
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={transferTarget}
              onValueChange={setTransferTarget}
              disabled={eligibleMembers.length === 0}
            >
              <SelectTrigger
                aria-label="New owner"
                className="h-8 w-48 text-[13px]"
              >
                <SelectValue placeholder="Choose a member" />
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={
                eligibleMembers.length === 0 || !targetMember
                  ? true
                  : undefined
              }
              loading={transferring}
              onClick={requestTransfer}
            >
              Transfer
            </Button>
          </div>
          {eligibleMembers.length === 0 ? (
            <p className="text-xs text-ink-faint">
              Requires a second owner-eligible member.
            </p>
          ) : null}
        </div>
      </DangerSection>

      <DangerSection
        title="Delete workspace"
        description={`Permanently removes ${workspaceName}, including every signal, automation run and report. This cannot be undone.`}
      >
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          Delete workspace
        </Button>
      </DangerSection>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setConfirmText("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {workspaceName}</DialogTitle>
            <DialogDescription>
              All signals, automation history, reports and member access will
              be permanently removed after a 7-day grace period.
            </DialogDescription>
          </DialogHeader>

          <Field
            label={`Type "${workspaceName}" to confirm`}
            htmlFor="delete-confirm"
          >
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={workspaceName}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="danger"
              size="sm"
              disabled={confirmText !== workspaceName ? true : undefined}
              loading={deleting}
              onClick={confirmDelete}
            >
              Delete this workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
