"use client";

import * as React from "react";
import { MoreHorizontal, Plus, UserRound } from "lucide-react";
import { toast } from "sonner";

import { PageIntro } from "@/components/dashboard/page-intro";
import { ExposureMeter } from "@/components/primitives/exposure-meter";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/states";
import { copy } from "@/config/product";
import { DEMO_ANCHOR, demoProfiles } from "@/lib/demo/scan-data";
import type { DemoProfile } from "@/lib/demo/scan-data";
import { formatNumber, formatRelative } from "@/lib/utils";
import { platformLabels } from "@/lib/validation";

import { ProfilesAddDialog, type NewProfile } from "./profiles-add-dialog";
import { ProfilesVerifyDialog } from "./profiles-verify-dialog";
import { exposureMeta, exposureScore } from "./workspace-meta";

interface WorkspaceProfile {
  id: string;
  username: string;
  /** Display label, e.g. "OnlyFans" */
  platform: string;
  matches: number;
  newThisWeek: number;
  exposure: DemoProfile["exposure"] | null;
  lastScan: string | null;
  verified: boolean;
  paused: boolean;
}

const text = {
  intro:
    "The public profiles Argus watches for you. Figures are read per profile and never summed across them.",
  add: "Add profile",
  matches: "matches",
  fresh: "new this week",
  lastScan: (relative: string) => `Last scan ${relative}`,
  awaiting: "Awaiting first scan",
  awaitingBody: "The first pass runs on your next scheduled scan.",
  verified: "Ownership verified",
  verifiedBody:
    "Full detection detail and removal requests are unlocked for this profile.",
  pending: "Verification pending",
  pendingBody:
    "Totals are visible. Full detail unlocks once ownership is verified.",
  verify: "Verify",
  paused: "Paused",
  actions: (username: string) => `Actions for ${username}`,
  scanNow: "Scan now",
  pause: "Pause monitoring",
  resume: "Resume monitoring",
  remove: "Remove",
  removeTitle: "Remove profile",
  removeBody: (username: string) =>
    `${username} will stop being monitored. Findings already recorded stay in the workspace.`,
  cancel: "Cancel",
  demoNote: "Simulated in the demo workspace.",
  scanToast: (username: string) => `Scan queued for ${username}`,
  pausedToast: (username: string) => `Monitoring paused for ${username}`,
  resumedToast: (username: string) => `Monitoring resumed for ${username}`,
  removedToast: (username: string) => `${username} is no longer monitored`,
  addedToast: (username: string) => `${username} added`,
  addedBody: "The first pass runs on your next scheduled scan.",
  emptyTitle: "No profiles monitored",
  emptyBody:
    "Add a public username to start watching for republished content.",
} as const;

function seedProfiles(): WorkspaceProfile[] {
  return demoProfiles.map((profile, index) => ({
    id: profile.id,
    username: profile.username,
    platform: profile.platform,
    matches: profile.matches,
    newThisWeek: profile.newThisWeek,
    exposure: profile.exposure,
    lastScan: profile.lastScan,
    /* In the demo only the first profile has completed verification. */
    verified: index === 0,
    paused: false,
  }));
}

/**
 * Profiles.
 *
 * A register, not a card grid: each entry carries its own reading —
 * identity, volume, exposure and where its verification stands — so
 * one row is enough to know whether that profile needs attention.
 */
export function ProfilesWorkspace() {
  const [profiles, setProfiles] = React.useState<WorkspaceProfile[]>(seedProfiles);
  const [addOpen, setAddOpen] = React.useState(false);
  const [verifyFor, setVerifyFor] = React.useState<string | null>(null);
  const [removeId, setRemoveId] = React.useState<string | null>(null);
  const nextId = React.useRef(1);

  const removing = profiles.find((profile) => profile.id === removeId) ?? null;

  const add = React.useCallback((profile: NewProfile) => {
    const id = `PRF-N${nextId.current}`;
    nextId.current += 1;
    setProfiles((prev) => [
      ...prev,
      {
        id,
        username: profile.username,
        platform: platformLabels[profile.platform],
        matches: 0,
        newThisWeek: 0,
        exposure: null,
        lastScan: null,
        verified: false,
        paused: false,
      },
    ]);
    toast.success(text.addedToast(profile.username), {
      description: text.addedBody,
    });
  }, []);

  const togglePause = React.useCallback((profile: WorkspaceProfile) => {
    setProfiles((prev) =>
      prev.map((entry) =>
        entry.id === profile.id ? { ...entry, paused: !entry.paused } : entry
      )
    );
    toast.success(
      profile.paused
        ? text.resumedToast(profile.username)
        : text.pausedToast(profile.username),
      { description: text.demoNote }
    );
  }, []);

  const remove = React.useCallback((profile: WorkspaceProfile) => {
    setProfiles((prev) => prev.filter((entry) => entry.id !== profile.id));
    setRemoveId(null);
    toast.success(text.removedToast(profile.username), {
      description: text.demoNote,
    });
  }, []);

  return (
    <div className="flex min-w-0 flex-col">
      <PageIntro
        title={copy.dashboard.sections.profiles}
        description={text.intro}
        actions={
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full sm:h-9 sm:w-auto sm:px-4 sm:text-sm"
            onClick={() => setAddOpen(true)}
          >
            <Plus aria-hidden />
            {text.add}
          </Button>
        }
      />

      <div className="mt-6 sm:mt-8">
        {profiles.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title={text.emptyTitle}
            description={text.emptyBody}
            action={
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAddOpen(true)}
              >
                {text.add}
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-edge overflow-hidden rounded-lg border border-edge bg-paper">
            {profiles.map((profile) => {
              const exposure =
                profile.exposure === null ? null : exposureMeta[profile.exposure];
              return (
                <li key={profile.id} className="px-4 py-4 sm:px-5 sm:py-5">
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={profile.username}
                      size="md"
                      className="mt-0.5"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="grid gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <span className="truncate text-sm font-medium text-ink">
                              {profile.username}
                            </span>
                            <Badge variant="outline">{profile.platform}</Badge>
                            {profile.paused ? (
                              <Badge variant="neutral" dot>
                                {text.paused}
                              </Badge>
                            ) : null}
                          </div>

                          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-ink-soft">
                            {profile.lastScan === null ? (
                              <span>{text.awaiting}</span>
                            ) : (
                              <>
                                <span>
                                  <span className="tabular text-ink">
                                    {formatNumber(profile.matches)}
                                  </span>{" "}
                                  {text.matches}
                                </span>
                                <span aria-hidden>·</span>
                                <span>
                                  <span className="tabular text-ink">
                                    {formatNumber(profile.newThisWeek)}
                                  </span>{" "}
                                  {text.fresh}
                                </span>
                                <span aria-hidden>·</span>
                                <span>
                                  {text.lastScan(
                                    formatRelative(profile.lastScan, DEMO_ANCHOR)
                                  )}
                                </span>
                              </>
                            )}
                            {exposure ? (
                              <Badge variant={exposure.variant}>
                                {exposure.label}
                              </Badge>
                            ) : null}
                          </p>
                        </div>

                        <div className="min-w-0 lg:max-w-[220px]">
                          {profile.exposure === null ? (
                            <p className="text-2xs leading-relaxed text-ink-soft">
                              {text.awaitingBody}
                            </p>
                          ) : (
                            <ExposureMeter
                              score={exposureScore[profile.exposure]}
                              reveal
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={text.actions(profile.username)}
                          className="-mt-1 size-11 shrink-0 sm:size-9"
                        >
                          <MoreHorizontal aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            toast.success(text.scanToast(profile.username), {
                              description: text.demoNote,
                            })
                          }
                        >
                          {text.scanNow}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => togglePause(profile)}
                        >
                          {profile.paused ? text.resume : text.pause}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          destructive
                          onSelect={() => setRemoveId(profile.id)}
                        >
                          {text.remove}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md bg-mineral px-3 py-2 sm:ml-11">
                    <Badge variant={profile.verified ? "ok" : "warn"} dot>
                      {profile.verified ? text.verified : text.pending}
                    </Badge>
                    <p className="min-w-0 flex-1 text-2xs leading-relaxed text-ink-soft">
                      {profile.verified ? text.verifiedBody : text.pendingBody}
                    </p>
                    {profile.verified ? null : (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-11 px-4 sm:h-8 sm:px-3"
                        onClick={() => setVerifyFor(profile.username)}
                      >
                        {text.verify}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ProfilesAddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        existing={profiles}
        onAdd={add}
      />

      <ProfilesVerifyDialog
        username={verifyFor}
        onOpenChange={(open) => {
          if (!open) setVerifyFor(null);
        }}
      />

      <Dialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveId(null);
        }}
      >
        <DialogContent className="max-w-md">
          {removing ? (
            <>
              <DialogHeader>
                <DialogTitle>{text.removeTitle}</DialogTitle>
                <DialogDescription>
                  {text.removeBody(removing.username)}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="sm:h-9 sm:px-4 sm:text-sm"
                  onClick={() => setRemoveId(null)}
                >
                  {text.cancel}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="lg"
                  className="sm:h-9 sm:px-4 sm:text-sm"
                  onClick={() => remove(removing)}
                >
                  {text.remove}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
