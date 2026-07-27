import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Surface — the base container primitive.
 *
 * `tone` picks the environment: the light working surfaces, or the
 * black-glass scanner. Nothing here casts a shadow by default: a
 * region that is not floating above the page has no reason to
 * pretend it is, and stacking drop shadows is how an interface turns
 * into a pile of cards. Callers choose radius and padding, so the
 * product does not end up with one uniform box everywhere.
 *
 * `elevated` exists for the genuine exceptions — something that
 * really does sit above the page and has to be read as separate.
 */
export function Surface({
  tone = "paper",
  className,
  children,
  reflection = false,
  elevated = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  tone?: "page" | "paper" | "mineral" | "scanner" | "scanner-raised";
  reflection?: boolean;
  elevated?: boolean;
}) {
  return (
    <div
      className={cn(
        tone === "page" && "border border-edge bg-page",
        tone === "paper" && "border border-edge bg-paper",
        tone === "mineral" && "surface-mineral",
        tone === "scanner" && "surface-scanner",
        tone === "scanner-raised" &&
          "border border-scan-edge bg-scan-raised text-scan-ink",
        elevated && "shadow-[0_10px_30px_-18px_rgb(22_23_26/0.45)]",
        reflection && "scanner-reflection",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
