import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/shell";
import { brand } from "@/config/brand";
import { copy } from "@/config/product";

export const metadata: Metadata = {
  title: {
    default: copy.dashboard.demoBadge,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  /* A workspace, not a public page. */
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}
