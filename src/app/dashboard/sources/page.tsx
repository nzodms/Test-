import type { Metadata } from "next";

import { SourcesWorkspace } from "@/components/dashboard/findings/sources-workspace";
import { copy } from "@/config/product";

export const metadata: Metadata = {
  title: copy.dashboard.sections.sources,
};

export default function SourcesPage() {
  return <SourcesWorkspace />;
}
