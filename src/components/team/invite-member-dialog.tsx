"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const inviteSchema = z.object({
  email: z.email("Enter a valid work email address."),
  role: z.enum(["admin", "member", "viewer"]),
  note: z.string().max(240, "Keep the note under 240 characters.").optional(),
});

export type InviteValues = z.infer<typeof inviteSchema>;
export type InviteRole = InviteValues["role"];

/** Assignable roles, shared by the invite form and the role menus. */
export const INVITE_ROLE_OPTIONS: {
  value: InviteRole;
  label: string;
  description: string;
}[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Manages members, automations, and workspace settings.",
  },
  {
    value: "member",
    label: "Member",
    description: "Triages signals and works the day-to-day queue.",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access to signals and reports.",
  },
];

/**
 * Controlled invite dialog. The page owns the open state (so the
 * ?invite=1 deep link can open it) and the member list; `onInvite`
 * returns false when the email already has access, which surfaces
 * as a field error instead of a duplicate row.
 */
export function InviteMemberDialog({
  open,
  onOpenChange,
  onInvite,
  workspaceName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (values: InviteValues) => boolean;
  workspaceName: string;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "member", note: "" },
  });

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };

  const submit = handleSubmit(async (values) => {
    // Simulated persistence latency for honest demo feedback.
    await new Promise((resolve) => setTimeout(resolve, 600));
    const ok = onInvite(values);
    if (!ok) {
      setError("email", {
        type: "manual",
        message: "This person already has access or a pending invitation.",
      });
      return;
    }
    reset();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            They will receive an email invitation to {workspaceName}. Access
            starts as soon as they accept.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field
            label="Email"
            htmlFor="invite-email"
            error={errors.email?.message}
          >
            <Input
              id="invite-email"
              type="email"
              inputMode="email"
              placeholder="name@company.com"
              autoComplete="off"
              aria-invalid={errors.email ? true : undefined}
              {...register("email")}
            />
          </Field>

          <Field label="Role" htmlFor="invite-role" error={errors.role?.message}>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v as InviteRole)}
                >
                  <SelectTrigger
                    id="invite-role"
                    aria-label="Role"
                    className="[&_[data-role-description]]:hidden"
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVITE_ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex flex-col gap-0.5 py-0.5">
                          <span className="text-[13px]">{option.label}</span>
                          <span
                            data-role-description
                            className="text-xs text-ink-muted"
                          >
                            {option.description}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            label="Note"
            htmlFor="invite-note"
            hint="Optional"
            error={errors.note?.message}
          >
            <Textarea
              id="invite-note"
              rows={3}
              placeholder="Add a line of context to the invitation email."
              aria-invalid={errors.note ? true : undefined}
              {...register("note")}
            />
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={isSubmitting}>
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
