"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { brand } from "@/config/brand";
import {
  DEMO_ANCHOR,
  demoMatches,
  demoProfiles,
  demoTakedowns,
  scanTotals,
} from "@/lib/demo/scan-data";

const FILE_NAME = "argus-export.json";
const CONFIRM_PHRASE = "delete workspace";
const REVOKE_DELAY = 1_000;

const text = {
  exportTitle: "Export workspace data",
  exportBody:
    "Downloads every finding, request and profile in this workspace as a single JSON file.",
  exportAction: "Export data",
  exportDone: "Export ready",
  exportDoneBody: `Saved as ${FILE_NAME}`,
  exportFailed: "The export could not be prepared",
  deleteTitle: "Delete workspace",
  deleteBody:
    "Removes the workspace, its findings and its removal history. This cannot be undone.",
  deleteAction: "Delete workspace",
  confirmTitle: "Delete this workspace",
  confirmBody:
    "Everything in the workspace goes: findings, removal requests, monitored profiles and their history.",
  confirmLabel: `Type ${CONFIRM_PHRASE} to confirm`,
  confirmHint: "Exact text",
  cancel: "Cancel",
  deleted: "Deletion is simulated",
  deletedBody: "Nothing was removed from the demo workspace.",
  exportNote:
    "Demonstration data. No real scan was performed and no personal data is included.",
} as const;

/**
 * Irreversible actions, kept apart and outlined in the critical
 * tone. The export is real — it writes an actual file — while
 * deletion states plainly that the demo simulates it.
 */
export function SettingsDanger() {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [phrase, setPhrase] = React.useState("");
  const revokeTimer = React.useRef<number | null>(null);

  React.useEffect(
    () => () => {
      if (revokeTimer.current !== null) {
        window.clearTimeout(revokeTimer.current);
      }
    },
    []
  );

  const exportData = React.useCallback(() => {
    try {
      const payload = {
        workspace: brand.name,
        exportedAt: DEMO_ANCHOR,
        note: text.exportNote,
        totals: scanTotals,
        profiles: demoProfiles,
        matches: demoMatches,
        takedowns: demoTakedowns,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = FILE_NAME;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      if (revokeTimer.current !== null) {
        window.clearTimeout(revokeTimer.current);
      }
      revokeTimer.current = window.setTimeout(() => {
        URL.revokeObjectURL(url);
        revokeTimer.current = null;
      }, REVOKE_DELAY);

      toast.success(text.exportDone, { description: text.exportDoneBody });
    } catch {
      toast.error(text.exportFailed);
    }
  }, []);

  const confirmed = phrase.trim().toLowerCase() === CONFIRM_PHRASE;

  const confirmDelete = () => {
    if (!confirmed) return;
    setConfirmOpen(false);
    setPhrase("");
    toast.success(text.deleted, { description: text.deletedBody });
  };

  return (
    <div className="rounded-lg border border-crit/25 bg-crit/[0.02] px-4 py-1 sm:px-5">
      <div className="flex flex-col gap-3 border-b border-crit/15 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-ink">{text.exportTitle}</p>
          <p className="mt-0.5 max-w-[52ch] text-[13px] leading-relaxed text-ink-soft">
            {text.exportBody}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full shrink-0 sm:h-9 sm:w-auto sm:px-4 sm:text-sm"
          onClick={exportData}
        >
          <Download aria-hidden />
          {text.exportAction}
        </Button>
      </div>

      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-ink">{text.deleteTitle}</p>
          <p className="mt-0.5 max-w-[52ch] text-[13px] leading-relaxed text-ink-soft">
            {text.deleteBody}
          </p>
        </div>
        <Button
          type="button"
          variant="danger"
          size="lg"
          className="w-full shrink-0 sm:h-9 sm:w-auto sm:px-4 sm:text-sm"
          onClick={() => setConfirmOpen(true)}
        >
          {text.deleteAction}
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setPhrase("");
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{text.confirmTitle}</DialogTitle>
            <DialogDescription>{text.confirmBody}</DialogDescription>
          </DialogHeader>

          <Field
            label={text.confirmLabel}
            htmlFor="delete-workspace-confirm"
            hint={text.confirmHint}
          >
            <Input
              id="delete-workspace-confirm"
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              placeholder={CONFIRM_PHRASE}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className="h-11 sm:h-9"
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="sm:h-9 sm:px-4 sm:text-sm"
              onClick={() => setConfirmOpen(false)}
            >
              {text.cancel}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="lg"
              disabled={!confirmed}
              className="sm:h-9 sm:px-4 sm:text-sm"
              onClick={confirmDelete}
            >
              {text.deleteAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
