import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignSystemContent } from "@/components/design-system/ds-content";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

/**
 * Internal reference for the Obsidian Halo design language.
 * Development only — returns a 404 in production builds.
 */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <DesignSystemContent />;
}
