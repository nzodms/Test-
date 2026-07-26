"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import {
  SettingsSection,
  useSimulatedSave,
} from "@/components/settings/section";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { getCurrentUser } from "@/lib/data";

const profileSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  title: z.string().min(2, "Add a short role title."),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const user = getCurrentUser();

  const [saved, setSaved, hydrated] = usePersistentState<ProfileValues>(
    "settings:profile",
    { fullName: user.name, title: user.title }
  );
  const [saving, runSave] = useSimulatedSave();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user.name, title: user.title },
  });

  // Apply the stored values once localStorage has been read.
  const appliedStored = React.useRef(false);
  React.useEffect(() => {
    if (hydrated && !appliedStored.current) {
      appliedStored.current = true;
      reset(saved);
    }
  }, [hydrated, saved, reset]);

  const previewName = watch("fullName") || user.name;

  const onSubmit = (values: ProfileValues) => {
    runSave(() => {
      setSaved(values);
      toast.success("Saved");
    });
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Profile"
        description="How you appear to teammates across signals, activity and reports."
        footer={
          <Button
            type="submit"
            form="profile-form"
            size="sm"
            loading={saving}
          >
            Save changes
          </Button>
        }
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex shrink-0 items-center gap-4 sm:w-44 sm:flex-col sm:items-start">
            <Avatar name={previewName} size="lg" />
            <p className="text-xs text-ink-muted sm:max-w-[10rem]">
              Your avatar is generated from your name and stays consistent
              everywhere.
            </p>
          </div>

          <form
            id="profile-form"
            onSubmit={handleSubmit(onSubmit)}
            className="min-w-0 flex-1 space-y-4"
            noValidate
          >
            <Field
              label="Full name"
              htmlFor="profile-name"
              error={errors.fullName?.message}
            >
              <Input
                id="profile-name"
                autoComplete="name"
                aria-invalid={errors.fullName ? true : undefined}
                {...register("fullName")}
              />
            </Field>

            <Field
              label="Role title"
              htmlFor="profile-title"
              error={errors.title?.message}
              hint="Shown next to your name"
            >
              <Input
                id="profile-title"
                autoComplete="organization-title"
                aria-invalid={errors.title ? true : undefined}
                {...register("title")}
              />
            </Field>

            <Field
              label="Email"
              htmlFor="profile-email"
              hint="Managed by your identity provider"
            >
              <Input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                readOnly
              />
            </Field>
          </form>
        </div>
      </SettingsSection>
    </div>
  );
}
