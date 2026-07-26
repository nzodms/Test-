import type { Metadata } from "next";

import { ProfilesWorkspace } from "@/components/dashboard/profiles-workspace";
import { copy } from "@/config/product";

export const metadata: Metadata = {
  title: copy.dashboard.sections.profiles,
};

/**
 * Profiles.
 *
 * Adding, pausing and removing all mutate the same register, so the
 * route hands the whole page to one interactive surface.
 */
export default function ProfilesPage() {
  return <ProfilesWorkspace />;
}
