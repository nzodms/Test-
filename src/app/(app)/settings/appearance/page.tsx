"use client";

import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/misc";
import {
  SettingRow,
  SettingsSection,
  useSimulatedSave,
} from "@/components/settings/section";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { cn } from "@/lib/utils";

type Density = "comfortable" | "compact";

interface AppearanceSettings {
  density: Density;
  reduceMotion: boolean;
  showHaloFields: boolean;
}

const DEFAULTS: AppearanceSettings = {
  density: "comfortable",
  reduceMotion: false,
  showHaloFields: true,
};

function RadioCard({
  checked,
  disabled,
  onSelect,
  title,
  caption,
  badge,
  preview,
}: {
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  caption: string;
  badge?: React.ReactNode;
  preview?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "rounded-md border p-4 text-left transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-halo-500",
        checked
          ? "border-halo-500/40 bg-halo-500/[0.06]"
          : "border-edge bg-void/20 hover:border-edge-strong hover:bg-raised",
        disabled && "cursor-not-allowed opacity-55 hover:border-edge hover:bg-void/20"
      )}
    >
      {preview}
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={cn(
            "flex size-3.5 shrink-0 items-center justify-center rounded-full border",
            checked ? "border-halo-400" : "border-edge-strong"
          )}
        >
          {checked ? (
            <span className="size-1.5 rounded-full bg-halo-400" />
          ) : null}
        </span>
        <span className="text-sm font-medium text-ink">{title}</span>
        {badge}
      </div>
      <p className="mt-1 pl-[22px] text-[13px] text-ink-muted">{caption}</p>
    </button>
  );
}

export default function AppearanceSettingsPage() {
  const [saved, setSaved, hydrated] = usePersistentState<AppearanceSettings>(
    "settings:appearance",
    DEFAULTS
  );
  const [saving, runSave] = useSimulatedSave();
  const [draft, setDraft] = React.useState<AppearanceSettings>(DEFAULTS);

  const appliedStored = React.useRef(false);
  React.useEffect(() => {
    if (hydrated && !appliedStored.current) {
      appliedStored.current = true;
      setDraft(saved);
    }
  }, [hydrated, saved]);

  const save = () => {
    runSave(() => {
      setSaved(draft);
      toast.success("Saved");
    });
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Interface"
        description="Theme, information density and motion across the workspace."
        footer={
          <Button size="sm" loading={saving} onClick={save}>
            Save changes
          </Button>
        }
      >
        <div className="space-y-6">
          <div>
            <p className="text-label mb-3">Theme</p>
            <div role="radiogroup" aria-label="Theme" className="grid gap-3 sm:grid-cols-2">
              <RadioCard
                checked
                onSelect={() => undefined}
                title="Obsidian"
                caption="Deep-space dark. The native Halo look."
                preview={
                  <div
                    aria-hidden
                    className="mb-3 flex h-10 items-end gap-1 rounded-sm border border-edge bg-[#0b0e15] p-2"
                  >
                    <span className="h-2 w-8 rounded-full bg-halo-500/60" />
                    <span className="h-2 w-5 rounded-full bg-[#2a3245]" />
                    <span className="h-2 w-6 rounded-full bg-[#1b2130]" />
                  </div>
                }
              />
              <RadioCard
                checked={false}
                disabled
                onSelect={() => undefined}
                title="Daylight"
                caption="A calm light theme for bright rooms."
                badge={<Badge variant="outline">Planned</Badge>}
                preview={
                  <div
                    aria-hidden
                    className="mb-3 flex h-10 items-end gap-1 rounded-sm border border-edge bg-[#dfe4ec] p-2"
                  >
                    <span className="h-2 w-8 rounded-full bg-[#8fb9c4]" />
                    <span className="h-2 w-5 rounded-full bg-[#b9c2d1]" />
                    <span className="h-2 w-6 rounded-full bg-[#cad2de]" />
                  </div>
                }
              />
            </div>
          </div>

          <div>
            <p className="text-label mb-3">Density</p>
            <div
              role="radiogroup"
              aria-label="Density"
              className="grid gap-3 sm:grid-cols-2"
            >
              <RadioCard
                checked={draft.density === "comfortable"}
                onSelect={() =>
                  setDraft((d) => ({ ...d, density: "comfortable" }))
                }
                title="Comfortable"
                caption="Generous spacing. Best for review and reading."
              />
              <RadioCard
                checked={draft.density === "compact"}
                onSelect={() => setDraft((d) => ({ ...d, density: "compact" }))}
                title="Compact"
                caption="Tighter rows. Fits more signals per screen."
              />
            </div>
          </div>

          <Separator />

          <div className="divide-y divide-edge-faint">
            <SettingRow
              label="Reduce motion"
              description="Disables entrance animations and ambient drift. Also respects your system setting."
              control={
                <Switch
                  checked={draft.reduceMotion}
                  onCheckedChange={(checked) =>
                    setDraft((d) => ({ ...d, reduceMotion: checked }))
                  }
                  aria-label="Reduce motion"
                />
              }
            />
            <SettingRow
              label="Show Halo Fields"
              description="Ambient light blooms behind key moments in the interface."
              control={
                <Switch
                  checked={draft.showHaloFields}
                  onCheckedChange={(checked) =>
                    setDraft((d) => ({ ...d, showHaloFields: checked }))
                  }
                  aria-label="Show Halo Fields"
                />
              }
            />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
