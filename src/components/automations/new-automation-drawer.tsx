"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Automation } from "@/lib/data";

export const TRIGGER_OPTIONS = [
  "Signal created",
  "Severity crosses threshold",
  "Schedule — hourly",
  "Schedule — daily",
  "Payment failed",
  "Queue projection breach",
] as const;

export const ACTION_OPTIONS = [
  "Notify Slack channel",
  "Page on-call",
  "Create signal",
  "Generate report",
  "Run retry sequence",
] as const;

export const CATEGORY_OPTIONS = [
  "alerting",
  "triage",
  "revenue",
  "compliance",
  "reporting",
] as const satisfies readonly Automation["category"][];

const newAutomationSchema = z.object({
  name: z
    .string()
    .min(4, "Give the automation a name of at least 4 characters."),
  trigger: z.string().min(1, "Choose what starts this automation."),
  action: z.string().min(1, "Choose what it should do."),
  category: z.enum(CATEGORY_OPTIONS),
  description: z.string().optional(),
  requireApproval: z.boolean(),
});

export type NewAutomationInput = z.infer<typeof newAutomationSchema>;

/**
 * "New automation" drawer: react-hook-form + zod. The parent owns
 * the automation list and receives validated values via onCreate.
 */
export function NewAutomationDrawer({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: NewAutomationInput) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewAutomationInput>({
    resolver: zodResolver(newAutomationSchema),
    defaultValues: {
      name: "",
      trigger: "",
      action: "",
      category: "alerting",
      description: "",
      requireApproval: true,
    },
  });

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };

  const submit = handleSubmit(async (values) => {
    // Simulated persistence latency for honest demo feedback.
    await new Promise((resolve) => setTimeout(resolve, 650));
    onCreate(values);
    reset();
    onOpenChange(false);
  });

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent side="right" widthClassName="max-w-lg">
        <DrawerHeader>
          <DrawerTitle className="text-title text-base text-ink">
            New automation
          </DrawerTitle>
          <DrawerDescription className="mt-1 text-sm text-ink-secondary">
            Pair a trigger with an action. Halo arms it immediately and logs
            every run.
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={submit}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <DrawerBody className="space-y-4">
            <Field
              label="Name"
              htmlFor="new-automation-name"
              error={errors.name?.message}
            >
              <Input
                id="new-automation-name"
                placeholder="e.g. Escalate failed renewals"
                autoComplete="off"
                aria-invalid={errors.name ? true : undefined}
                {...register("name")}
              />
            </Field>

            <Field
              label="Trigger"
              htmlFor="new-automation-trigger"
              error={errors.trigger?.message}
            >
              <Controller
                control={control}
                name="trigger"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="new-automation-trigger"
                      aria-label="Trigger"
                    >
                      <SelectValue placeholder="When should it run?" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGER_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field
              label="Action"
              htmlFor="new-automation-action"
              error={errors.action?.message}
            >
              <Controller
                control={control}
                name="action"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="new-automation-action"
                      aria-label="Action"
                    >
                      <SelectValue placeholder="What should it do?" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field
              label="Category"
              htmlFor="new-automation-category"
              error={errors.category?.message}
            >
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) =>
                      field.onChange(v as Automation["category"])
                    }
                  >
                    <SelectTrigger
                      id="new-automation-category"
                      aria-label="Category"
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem
                          key={option}
                          value={option}
                          className="capitalize"
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field
              label="Description"
              htmlFor="new-automation-description"
              hint="Optional"
            >
              <Textarea
                id="new-automation-description"
                rows={3}
                placeholder="What this handles, and why it exists."
                {...register("description")}
              />
            </Field>

            <div className="flex items-center justify-between gap-4 rounded-md border border-edge bg-raised/60 p-3.5">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink-secondary">
                  Require approval before external actions
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                  A teammate confirms before Halo pages anyone or posts outside
                  the workspace.
                </p>
              </div>
              <Controller
                control={control}
                name="requireApproval"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Require approval before external actions"
                  />
                )}
              />
            </div>
          </DrawerBody>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" loading={isSubmitting}>
              Create automation
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
