import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Surface — the base container primitive. `tone` picks the
 * environment: porcelain paper/mineral in the light world, or the
 * black-glass scanner. Radius and padding are chosen by callers so
 * the interface isn't one uniform card everywhere.
 */
export function Surface({
  tone = "paper",
  className,
  children,
  reflection = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  tone?: "paper" | "mineral" | "scanner" | "scanner-raised";
  reflection?: boolean;
}) {
  return (
    <div
      className={cn(
        tone === "paper" && "surface-paper",
        tone === "mineral" && "surface-mineral",
        tone === "scanner" && "surface-scanner",
        tone === "scanner-raised" &&
          "border border-scan-edge bg-scan-raised text-scan-ink",
        reflection && "scanner-reflection",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
