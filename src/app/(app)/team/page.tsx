"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  ChevronDown,
  Copy,
  Lock,
  MoreHorizontal,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/app/page-header";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HaloField } from "@/components/halo/halo-field";
import { Reveal } from "@/components/halo/reveal";
import {
  InviteMemberDialog,
  INVITE_ROLE_OPTIONS,
  type InviteRole,
  type InviteValues,
} from "@/components/team/invite-member-dialog";
import { PermissionsMatrix } from "@/components/team/permissions-matrix";
import { dataNow, getCurrentUser, getMembers, getWorkspaces } from "@/lib/data";
import type { Member, MemberRole } from "@/lib/data";
import { cn, formatRelative } from "@/lib/utils";

const ROLE_LABEL: Record<MemberRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

const roleBadgeButtonClasses = cn(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-edge bg-raised px-2.5 py-1",
  "text-2xs font-medium text-ink-secondary transition-colors",
  "hover:border-edge-strong hover:text-ink",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-halo-500/40"
);

/** "amara.okafor@northwind.io" → "Amara Okafor". */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._\-+]+/).filter(Boolean);
  if (parts.length === 0) return email;
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function nextMemberId(list: Member[]): string {
  let max = 0;
  for (const m of list) {
    const n = Number(m.id.slice(2));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `m-${String(max + 1).padStart(2, "0")}`;
}

function TeamWorkspace() {
  const currentUser = getCurrentUser();
  const workspaceName = getWorkspaces()[0]?.name ?? "this workspace";

  const [members, setMembers] = React.useState<Member[]>(() =>
    getMembers().map((m) => ({ ...m }))
  );
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [removeTarget, setRemoveTarget] = React.useState<Member | null>(null);
  const [removing, setRemoving] = React.useState(false);

  /* ── Deep link: /team?invite=1 opens the invite dialog once ───── */
  const searchParams = useSearchParams();
  const inviteParam = searchParams.get("invite");
  const consumedInvite = React.useRef(false);
  React.useEffect(() => {
    if (inviteParam === "1" && !consumedInvite.current) {
      consumedInvite.current = true;
      setInviteOpen(true);
    }
  }, [inviteParam]);

  const activeMembers = members.filter((m) => m.status === "active");
  const pendingInvites = members.filter((m) => m.status === "invited");

  const description =
    `Everyone with access to ${workspaceName} — ${activeMembers.length} member${activeMembers.length === 1 ? "" : "s"}` +
    (pendingInvites.length > 0
      ? ` · ${pendingInvites.length} pending invitation${pendingInvites.length === 1 ? "" : "s"}`
      : " · no pending invitations");

  /* ── Mutations (demo persistence: React state + toasts) ───────── */

  const handleInvite = (values: InviteValues): boolean => {
    const email = values.email.trim().toLowerCase();
    if (members.some((m) => m.email.toLowerCase() === email)) return false;
    setMembers((prev) => [
      ...prev,
      {
        id: nextMemberId(prev),
        name: nameFromEmail(email),
        email,
        title: "Pending invitation",
        role: values.role,
        status: "invited",
        joinedAt: dataNow,
        lastActiveAt: dataNow,
      },
    ]);
    toast.success("Invitation sent", { description: email });
    return true;
  };

  const changeRole = (member: Member, role: InviteRole) => {
    if (member.role === role) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, role } : m))
    );
    toast.success("Role updated", {
      description: `${member.name} is now ${ROLE_LABEL[role].toLowerCase()}.`,
    });
  };

  const copyEmail = (member: Member) => {
    if (!navigator.clipboard) {
      toast.error("Clipboard unavailable in this browser");
      return;
    }
    navigator.clipboard
      .writeText(member.email)
      .then(() => toast.success("Email copied", { description: member.email }))
      .catch(() => toast.error("Could not copy email"));
  };

  const confirmRemove = async () => {
    const target = removeTarget;
    if (!target) return;
    setRemoving(true);
    // Simulated persistence latency for honest demo feedback.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setMembers((prev) => prev.filter((m) => m.id !== target.id));
    setRemoving(false);
    setRemoveTarget(null);
    toast.success("Member removed", {
      description: `${target.name} no longer has access to ${workspaceName}.`,
    });
  };

  const resendInvite = (member: Member) => {
    toast.success("Invitation resent", {
      description: `A fresh invitation is on its way to ${member.email}.`,
    });
  };

  const revokeInvite = (member: Member) => {
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    toast.success("Invitation revoked", { description: member.email });
  };

  return (
    <PageContainer className="pb-16">
      <PageHeader
        title="Team"
        description={description}
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus aria-hidden />
            Invite member
          </Button>
        }
      />

      {/* ── Members ──────────────────────────────────────────────── */}
      <Reveal>
        <section className="surface-card relative mt-6 overflow-hidden">
          <HaloField x={88} y={-20} strength={0.1} tone="halo" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3 border-b border-edge px-4 py-3 sm:px-5">
              <h2 className="text-label">Members</h2>
              <span className="tabular text-xs text-ink-muted">
                {members.length} total
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead className="w-10 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isSelf = member.id === currentUser.id;
                  const isOwner = member.role === "owner";
                  const canRemove = !isSelf && !isOwner;
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar name={member.name} size="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium text-ink">
                                {member.name}
                              </span>
                              {isSelf ? (
                                <Badge variant="halo">You</Badge>
                              ) : null}
                            </div>
                            <p className="truncate text-xs text-ink-muted">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-[13px] text-ink-secondary">
                        {member.title}
                      </TableCell>
                      <TableCell>
                        {isOwner ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                aria-disabled="true"
                                aria-label="Owner role is locked"
                                className={cn(
                                  roleBadgeButtonClasses,
                                  "cursor-not-allowed hover:border-edge hover:text-ink-secondary"
                                )}
                              >
                                <Lock className="size-3 text-ink-muted" aria-hidden />
                                Owner
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Transfer ownership from the danger zone.
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                aria-label={`Change role for ${member.name} — currently ${ROLE_LABEL[member.role]}`}
                                className={roleBadgeButtonClasses}
                              >
                                {ROLE_LABEL[member.role]}
                                <ChevronDown
                                  className="size-3 text-ink-muted"
                                  aria-hidden
                                />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-64">
                              <DropdownMenuLabel>Change role</DropdownMenuLabel>
                              {INVITE_ROLE_OPTIONS.map((option) => (
                                <DropdownMenuItem
                                  key={option.value}
                                  onSelect={() => changeRole(member, option.value)}
                                >
                                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <span className="text-[13px] text-ink">
                                      {option.label}
                                    </span>
                                    <span className="text-xs text-ink-muted">
                                      {option.description}
                                    </span>
                                  </div>
                                  {member.role === option.value ? (
                                    <Check
                                      className="size-3.5 shrink-0 text-halo-400"
                                      aria-hidden
                                    />
                                  ) : null}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.status === "active" ? (
                          <Badge variant="positive" dot>
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="caution" dot>
                            Invited
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-[13px] text-ink-secondary">
                        {member.status === "invited" ? (
                          <span
                            className="text-ink-faint"
                            aria-label="Not active yet"
                          >
                            —
                          </span>
                        ) : (
                          formatRelative(member.lastActiveAt, dataNow)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Actions for ${member.name}`}
                            >
                              <MoreHorizontal aria-hidden />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => copyEmail(member)}>
                              <Copy aria-hidden />
                              Copy email
                            </DropdownMenuItem>
                            {canRemove ? (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  destructive
                                  onSelect={() => setRemoveTarget(member)}
                                >
                                  <UserMinus aria-hidden />
                                  Remove from workspace
                                </DropdownMenuItem>
                              </>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      </Reveal>

      {/* ── Pending invitations + roles overview ─────────────────── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {pendingInvites.length > 0 ? (
          <Reveal delay={0.05} className="lg:col-span-2">
            <section className="surface-card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-edge px-4 py-3 sm:px-5">
                <h2 className="text-label">Pending invitations</h2>
                <span className="tabular text-xs text-ink-muted">
                  {pendingInvites.length}
                </span>
              </div>
              <ul className="divide-y divide-edge-faint">
                {pendingInvites.map((invite) => (
                  <li
                    key={invite.id}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{invite.email}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        Invited as {ROLE_LABEL[invite.role].toLowerCase()} ·
                        awaiting acceptance
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resendInvite(invite)}
                      >
                        Resend
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-critical hover:bg-critical/10 hover:text-critical"
                        onClick={() => revokeInvite(invite)}
                      >
                        Revoke
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ) : null}
        <Reveal
          delay={0.1}
          className={pendingInvites.length > 0 ? "lg:col-span-3" : "lg:col-span-5"}
        >
          <PermissionsMatrix />
        </Reveal>
      </div>

      {/* ── Dialogs ──────────────────────────────────────────────── */}
      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
        workspaceName={workspaceName}
      />

      <Dialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open && !removing) setRemoveTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Remove {removeTarget?.name ?? "member"} from the workspace?
            </DialogTitle>
            <DialogDescription>
              {removeTarget
                ? `${removeTarget.name} (${removeTarget.email}) immediately loses access to ${workspaceName}, including signals, reports, and automations. You can invite them back at any time.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={removing}
              onClick={() => setRemoveTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={removing}
              onClick={confirmRemove}
            >
              Remove member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

export default function TeamPage() {
  return (
    <React.Suspense fallback={null}>
      <TeamWorkspace />
    </React.Suspense>
  );
}
