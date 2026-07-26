"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getIntegrations } from "@/lib/data";
import type { Severity } from "@/lib/data";
import { SEVERITY_ORDER, severityLabel } from "./signal-badges";

const newSignalSchema = z.object({
  title: z
    .string()
    .min(4, "Give the signal a title of at least 4 characters."),
  severity: z.enum(["critical", "high", "medium", "low"]),
  source: z.string().min(1, "Choose the source integration."),
  description: z
    .string()
    .min(10, "Add at least 10 characters so the team has context."),
});

export type NewSignalInput = z.infer<typeof newSignalSchema>;

const connectedSources = getIntegrations().filter((i) => i.connected);

/**
 * "New signal" action: primary trigger button + modal form.
 * Validation via react-hook-form + zod; the parent owns list state.
 */
export function NewSignalDialog({
  onCreate,
}: {
  onCreate: (values: NewSignalInput) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewSignalInput>({
    resolver: zodResolver(newSignalSchema),
    defaultValues: {
      title: "",
      severity: "medium",
      source: "",
      description: "",
    },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const submit = handleSubmit(async (values) => {
    // Simulated persistence latency for honest demo feedback.
    await new Promise((resolve) => setTimeout(resolve, 650));
    onCreate(values);
    reset();
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden />
          New signal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New signal</DialogTitle>
          <DialogDescription>
            Log something the detectors have not caught yet. It lands in the
            stream as a new signal, unassigned.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field
            label="Title"
            htmlFor="new-signal-title"
            error={errors.title?.message}
          >
            <Input
              id="new-signal-title"
              placeholder="e.g. Refund spike on annual plans"
              autoComplete="off"
              aria-invalid={errors.title ? true : undefined}
              {...register("title")}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Severity"
              htmlFor="new-signal-severity"
              error={errors.severity?.message}
            >
              <Controller
                control={control}
                name="severity"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as Severity)}
                  >
                    <SelectTrigger
                      id="new-signal-severity"
                      aria-label="Severity"
                    >
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITY_ORDER.map((severity) => (
                        <SelectItem key={severity} value={severity}>
                          {severityLabel(severity)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field
              label="Source"
              htmlFor="new-signal-source"
              error={errors.source?.message}
            >
              <Controller
                control={control}
                name="source"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="new-signal-source" aria-label="Source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {connectedSources.map((integration) => (
                        <SelectItem
                          key={integration.id}
                          value={integration.name}
                        >
                          {integration.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <Field
            label="Description"
            htmlFor="new-signal-description"
            error={errors.description?.message}
            hint="What was observed, and why it matters"
          >
            <Textarea
              id="new-signal-description"
              rows={4}
              placeholder="Describe the pattern, the affected surface, and any early numbers."
              aria-invalid={errors.description ? true : undefined}
              {...register("description")}
            />
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={isSubmitting}>
              Create signal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
