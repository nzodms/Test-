import type { Metadata } from "next";

import { PageIntro } from "@/components/dashboard/page-intro";
import { SettingsAccount } from "@/components/dashboard/settings-account";
import { SettingsAppearance } from "@/components/dashboard/settings-appearance";
import { SettingsDanger } from "@/components/dashboard/settings-danger";
import { SettingsNotifications } from "@/components/dashboard/settings-notifications";
import { SettingsPrivacy } from "@/components/dashboard/settings-privacy";
import { SettingsSection } from "@/components/dashboard/settings-section";
import { Separator } from "@/components/ui/misc";
import { copy } from "@/config/product";

export const metadata: Metadata = {
  title: copy.dashboard.sections.settings,
};

const text = {
  intro:
    "Account, notifications and what happens to your data. Everything on this page is saved as you change it.",
  account: "Account",
  accountBody: "How you are identified inside this workspace.",
  notifications: "Notifications",
  notificationsBody:
    "Where alerts and summaries are delivered. Only what you choose.",
  appearance: "Appearance",
  appearanceBody: "How the workspace is presented.",
  privacy: "Privacy and data",
  privacyBody:
    "The rules the product operates under, and the documents that state them.",
  danger: "Danger zone",
  dangerBody:
    "Actions that take data out of the workspace, or take the workspace away.",
} as const;

/**
 * Settings.
 *
 * One page, five sections, hairlines between them — no sub-navigation
 * for a surface this size. Each section owns its own persistence, so
 * a change in one place never overwrites another.
 */
export default function SettingsPage() {
  return (
    <div className="flex min-w-0 max-w-4xl flex-col">
      <PageIntro
        title={copy.dashboard.sections.settings}
        description={text.intro}
      />

      <div className="mt-8 sm:mt-10">
        <SettingsSection title={text.account} description={text.accountBody}>
          <SettingsAccount />
        </SettingsSection>

        <Separator className="my-8 sm:my-10" />

        <SettingsSection
          title={text.notifications}
          description={text.notificationsBody}
        >
          <SettingsNotifications />
        </SettingsSection>

        <Separator className="my-8 sm:my-10" />

        <SettingsSection
          title={text.appearance}
          description={text.appearanceBody}
        >
          <SettingsAppearance />
        </SettingsSection>

        <Separator className="my-8 sm:my-10" />

        <SettingsSection title={text.privacy} description={text.privacyBody}>
          <SettingsPrivacy />
        </SettingsSection>

        <Separator className="my-8 sm:my-10" />

        <SettingsSection title={text.danger} description={text.dangerBody}>
          <SettingsDanger />
        </SettingsSection>
      </div>
    </div>
  );
}
