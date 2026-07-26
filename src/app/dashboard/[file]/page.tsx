import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfileFile } from "@/components/workspace/file-view";
import { fileBySlug, fileLibrary } from "@/lib/demo/files";

/** The demo library is a fixed set, so every file can be prerendered. */
export function generateStaticParams() {
  return fileLibrary.map((f) => ({ file: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ file: string }>;
}): Promise<Metadata> {
  const { file } = await params;
  const record = fileBySlug(file);
  return { title: record ? `@${record.username}` : "File not found" };
}

export default async function FilePage({
  params,
}: {
  params: Promise<{ file: string }>;
}) {
  const { file } = await params;
  const record = fileBySlug(file);
  if (!record) notFound();
  return <ProfileFile file={record} />;
}
