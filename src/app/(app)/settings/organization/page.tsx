"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SettingsSection,
  useSimulatedSave,
} from "@/components/settings/section";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { getWorkspaces } from "@/lib/data";

const orgSchema = z.object({
  name: z.string().min(2, "Workspace name is required."),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only."),
});

type OrgFormValues = z.infer<typeof orgSchema>;

type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";
type Sensitivity = "conservative" | "balanced" | "eager";

interface OrgSettings extends OrgFormValues {
  companySize: CompanySize;
  sensitivity: Sensitivity;
}

const SIZE_OPTIONS: CompanySize[] = ["1-10", "11-50", "51-200", "201-500", "500+"];

const SENSITIVITY_OPTIONS: Array<{ value: Sensitivity; label: string; note: string }> = [
  {
    value: "conservative",
    label: "Conservative",
    note: "Fewer signals, high confidence only.",
  },
  {
    value: "balanced",
    label: "Balanced",
    note: "The default. Tuned for most operating teams.",
  },
  {
    value: "eager",
    label: "Eager",
    note: "Surfaces more, earlier — expect more noise.",
  },
];

export default function OrganizationSettingsPage() {
  const workspace = getWorkspaces()[0];
  const defaults: OrgSettings = {
    name: workspace?.name ?? "Northwind Systems",
    slug: workspace?.slug ?? "northwind",
    companySize: "51-200",
    sensitivity: "balanced",
  };

  const [saved, setSaved, hydrated] = usePersistentState<OrgSettings>(
    "settings:organization",
    defaults
  );
  const [saving, runSave] = useSimulatedSave();

  const [companySize, setCompanySize] = React.useState<CompanySize>(
    defaults.companySize
  );
  const [sensitivity, setSensitivity] = React.useState<Sensitivity>(
    defaults.sensitivity
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: { name: defaults.name, slug: defaults.slug },
  });

  const appliedStored = React.useRef(false);
  React.useEffect(() => {
    if (hydrated && !appliedStored.current) {
      appliedStored.current = true;
      reset({ name: saved.name, slug: saved.slug });
      setCompanySize(saved.companySize);
      setSensitivity(saved.sensitivity);
    }
  }, [hydrated, saved, reset]);

  const sensitivityNote = SENSITIVITY_OPTIONS.find(
    (o) => o.value === sensitivity
  )?.note;

  const onSubmit = (values: OrgFormValues) => {
    runSave(() => {
      setSaved({ ...values, companySize, sensitivity });
      toast.success("Saved");
    });
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Organization"
        description="Workspace identity and how aggressively Halo detects signals."
        footer={
          <Button type="submit" form="org-form" size="sm" loading={saving}>
            Save changes
          </Button>
        }
      >
        <form
          id="org-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <Field
            label="Workspace name"
            htmlFor="org-name"
            error={errors.name?.message}
          >
            <Input
              id="org-name"
              autoComplete="organization"
              aria-invalid={errors.name ? true : undefined}
              {...register("name")}
            />
          </Field>

          <Field
            label="Workspace URL"
            htmlFor="org-slug"
            error={errors.slug?.message}
          >
            <div className="flex">
              <span className="flex h-9 shrink-0 items-center rounded-l-md border border-r-0 border-edge bg-void/40 px-3 font-mono text-[13px] text-ink-muted">
                halo.app/
              </span>
              <Input
                id="org-slug"
                className="rounded-l-none font-mono"
                spellCheck={false}
                aria-invalid={errors.slug ? true : undefined}
                {...register("slug")}
              />
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company size" htmlFor="org-size">
              <Select
                value={companySize}
                onValueChange={(v) => setCompanySize(v as CompanySize)}
              >
                <SelectTrigger id="org-size" aria-label="Company size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} people
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Default signal sensitivity"
              htmlFor="org-sensitivity"
            >
              <Select
                value={sensitivity}
                onValueChange={(v) => setSensitivity(v as Sensitivity)}
              >
                <SelectTrigger
                  id="org-sensitivity"
                  aria-label="Default signal sensitivity"
                >
                  <SelectValue placeholder="Select sensitivity" />
                </SelectTrigger>
                <SelectContent>
                  {SENSITIVITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sensitivityNote ? (
                <p className="text-xs text-ink-muted">{sensitivityNote}</p>
              ) : null}
            </Field>
          </div>
        </form>
      </SettingsSection>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-edge-faint bg-surface px-5 py-3 text-[13px] text-ink-muted">
        <span className="inline-flex items-center gap-2">
          Plan
          <Badge variant="halo">Pro</Badge>
        </span>
        <span>Created Feb 2025</span>
        <span className="font-mono text-2xs text-ink-faint">ws-01</span>
      </div>
    </div>
  );
}
