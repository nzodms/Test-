import type { Metadata } from "next";

import { FileLibrary } from "@/components/workspace/library";

export const metadata: Metadata = {
  title: "File library",
};

export default function DashboardPage() {
  return <FileLibrary />;
}
