import type { Metadata } from "next";

import { FindingsWorkspace } from "@/components/dashboard/findings/findings-workspace";
import { copy } from "@/config/product";

export const metadata: Metadata = {
  title: copy.dashboard.sections.findings,
};

export default function FindingsPage() {
  return <FindingsWorkspace />;
}
