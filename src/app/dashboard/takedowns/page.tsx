import type { Metadata } from "next";

import { TakedownsWorkspace } from "@/components/dashboard/takedowns-workspace";
import { copy } from "@/config/product";

export const metadata: Metadata = {
  title: copy.dashboard.sections.takedowns,
};

/**
 * Takedowns.
 *
 * The whole page is one interactive surface — the pipeline, the
 * heading counts and the request list all read the same state — so
 * the route is a thin server shell around it.
 */
export default function TakedownsPage() {
  return <TakedownsWorkspace />;
}
