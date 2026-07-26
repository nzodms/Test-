import type { Metadata } from "next";

import { WorkspaceChrome } from "@/components/workspace/chrome";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: {
    default: "File library",
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  /* A workspace, not a public page. */
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceChrome>{children}</WorkspaceChrome>;
}
