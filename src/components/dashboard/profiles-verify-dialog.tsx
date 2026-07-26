"use client";

import { Badge } from "@/components/ui/badge";
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
import { copy } from "@/config/product";

const methods = copy.onboarding.steps.ownership.methods;

const text = {
  title: "Verify ownership",
  description: (username: string) =>
    `Verification unlocks full detection detail and removal requests for ${username}. One of these methods will be used.`,
  unavailable: "Unavailable in demo",
  note: copy.onboarding.steps.ownership.demoNote,
  close: "Close",
} as const;

/**
 * The same four methods stated during onboarding, repeated verbatim
 * here so the promise never shifts between the setup flow and the
 * workspace. In the demo none of them run.
 */
export function ProfilesVerifyDialog({
  username,
  onOpenChange,
}: {
  username: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={username !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {username ? (
          <>
            <DialogHeader>
              <DialogTitle>{text.title}</DialogTitle>
              <DialogDescription>
                {text.description(username)}
              </DialogDescription>
            </DialogHeader>

            <ol className="border-t border-edge">
              {methods.map((method, index) => (
                <li
                  key={method.name}
                  className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2 border-b border-edge py-3.5 sm:grid-cols-[1.75rem_minmax(0,1fr)_auto]"
                >
                  <span
                    aria-hidden
                    className="text-data pt-0.5 text-ink-faint"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-title text-[14px] text-ink">
                      {method.name}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">
                      {method.body}
                    </p>
                  </div>
                  <div className="col-start-2 sm:col-start-3 sm:pt-0.5">
                    <Badge variant="outline">{text.unavailable}</Badge>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
              {text.note}
            </p>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="sm:h-9 sm:px-4 sm:text-sm"
                >
                  {text.close}
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
