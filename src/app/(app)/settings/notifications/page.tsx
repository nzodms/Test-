"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  SettingRow,
  SettingsSection,
  useSimulatedSave,
} from "@/components/settings/section";
import { usePersistentState } from "@/hooks/use-persistent-state";

type DigestDay = "monday" | "friday";

interface NotificationSettings {
  criticalPage: boolean;
  criticalEmail: boolean;
  assignments: boolean;
  automationFailures: boolean;
  weeklyDigest: boolean;
  digestDay: DigestDay;
  reportReady: boolean;
  mentions: boolean;
}

const DEFAULTS: NotificationSettings = {
  criticalPage: true,
  criticalEmail: true,
  assignments: true,
  automationFailures: true,
  weeklyDigest: true,
  digestDay: "monday",
  reportReady: true,
  mentions: true,
};

export default function NotificationSettingsPage() {
  const [saved, setSaved, hydrated] =
    usePersistentState<NotificationSettings>("settings:notifications", DEFAULTS);
  const [saving, runSave] = useSimulatedSave();
  const [draft, setDraft] = React.useState<NotificationSettings>(DEFAULTS);

  const appliedStored = React.useRef(false);
  React.useEffect(() => {
    if (hydrated && !appliedStored.current) {
      appliedStored.current = true;
      setDraft(saved);
    }
  }, [hydrated, saved]);

  const patch = (partial: Partial<NotificationSettings>) =>
    setDraft((d) => ({ ...d, ...partial }));

  const save = () => {
    runSave(() => {
      setSaved(draft);
      toast.success("Saved");
    });
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Notifications"
        description="What Halo sends you, and where. Critical alerts always reach the on-call owner."
        footer={
          <Button size="sm" loading={saving} onClick={save}>
            Save changes
          </Button>
        }
      >
        <div className="divide-y divide-edge-faint">
          <SettingRow
            label="Critical signals"
            description="The moment a critical signal opens. Delivered in-app and by email."
            control={
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 text-xs text-ink-muted">
                  <Switch
                    checked={draft.criticalPage}
                    onCheckedChange={(checked) =>
                      patch({ criticalPage: checked })
                    }
                    aria-label="Critical signals, in-app"
                  />
                  In-app
                </label>
                <label className="flex items-center gap-2 text-xs text-ink-muted">
                  <Switch
                    checked={draft.criticalEmail}
                    onCheckedChange={(checked) =>
                      patch({ criticalEmail: checked })
                    }
                    aria-label="Critical signals, email"
                  />
                  Email
                </label>
              </div>
            }
          />

          <SettingRow
            label="Signal assignments"
            description="When a signal is assigned to you or reassigned away."
            control={
              <Switch
                checked={draft.assignments}
                onCheckedChange={(checked) => patch({ assignments: checked })}
                aria-label="Signal assignments"
              />
            }
          />

          <SettingRow
            label="Automation failures"
            description="When an automation run fails or is skipped repeatedly."
            control={
              <Switch
                checked={draft.automationFailures}
                onCheckedChange={(checked) =>
                  patch({ automationFailures: checked })
                }
                aria-label="Automation failures"
              />
            }
          />

          <SettingRow
            label="Weekly digest"
            description="A summary of detections, resolutions and automation activity."
            control={
              <div className="flex items-center gap-3">
                <Select
                  value={draft.digestDay}
                  onValueChange={(v) => patch({ digestDay: v as DigestDay })}
                  disabled={!draft.weeklyDigest}
                >
                  <SelectTrigger
                    aria-label="Digest day"
                    className="h-8 w-32 text-[13px]"
                  >
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
                <Switch
                  checked={draft.weeklyDigest}
                  onCheckedChange={(checked) =>
                    patch({ weeklyDigest: checked })
                  }
                  aria-label="Weekly digest"
                />
              </div>
            }
          />

          <SettingRow
            label="Report ready"
            description="When a scheduled report finishes generating."
            control={
              <Switch
                checked={draft.reportReady}
                onCheckedChange={(checked) => patch({ reportReady: checked })}
                aria-label="Report ready"
              />
            }
          />

          <SettingRow
            label="Mentions"
            description="When a teammate mentions you in a note or comment."
            control={
              <Switch
                checked={draft.mentions}
                onCheckedChange={(checked) => patch({ mentions: checked })}
                aria-label="Mentions"
              />
            }
          />
        </div>
      </SettingsSection>
    </div>
  );
}
