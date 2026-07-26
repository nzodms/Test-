import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { SettingsNav } from "@/components/settings/settings-nav";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer className="pb-16">
      <PageHeader
        title="Settings"
        description="Your profile, workspace preferences, billing and integrations for Northwind Systems."
      />
      <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[200px_1fr] lg:items-start lg:gap-10">
        <SettingsNav />
        <div className="mt-5 min-w-0 lg:mt-0">{children}</div>
      </div>
    </PageContainer>
  );
}
