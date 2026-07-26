import { DEMO_ANCHOR } from "@/lib/demo/scan-data";

/**
 * A case reference is derived, never random: the same subject always
 * produces the same reference, so a file can be cited and found
 * again. Deterministic also keeps server and client output identical.
 */
export function caseReference(subject: string | null): string {
  const d = new Date(DEMO_ANCHOR);
  const stamp = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;

  if (!subject) return `ARG-${stamp}-••••`;

  let h = 0;
  for (let i = 0; i < subject.length; i++) {
    h = (h * 31 + subject.charCodeAt(i)) >>> 0;
  }
  return `ARG-${stamp}-${String(h % 10000).padStart(4, "0")}`;
}

/** The five sections every protection file contains, in order. */
export const FILE_SECTIONS = [
  { id: "identity", label: "Identity" },
  { id: "sources", label: "Sources" },
  { id: "findings", label: "Findings" },
  { id: "exposure", label: "Exposure" },
  { id: "report", label: "Report" },
] as const;

export type FileSectionId = (typeof FILE_SECTIONS)[number]["id"];
