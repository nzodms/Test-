"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Card-style choice used across onboarding steps. Renders as a
 * real button with pressed state for keyboard and screen-reader
 * users; multi-select variants expose aria-pressed.
 */
export function SelectableCard({
  selected,
  onSelect,
  title,
  description,
  icon,
  className,
  compact = false,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group relative w-full rounded-lg border text-left transition-all duration-200",
        compact ? "p-3.5" : "p-4",
        selected
          ? "border-halo-500/50 bg-halo-500/[0.08] shadow-[0_0_0_1px_rgb(94_207_227/0.2)]"
          : "border-edge bg-raised/50 hover:border-edge-strong hover:bg-raised",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute right-3 top-3 flex size-4.5 items-center justify-center rounded-full border transition-all duration-200",
          selected
            ? "border-halo-400 bg-halo-500 text-[#04222b]"
            : "border-edge-strong bg-transparent text-transparent"
        )}
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
      {icon ? (
        <span
          className={cn(
            "mb-3 flex size-8 items-center justify-center rounded-md border transition-colors",
            selected
              ? "border-halo-500/40 bg-halo-500/15 text-halo-300"
              : "border-edge bg-void/40 text-ink-muted"
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="block pr-6 text-sm font-medium text-ink">{title}</span>
      {description ? (
        <span className="mt-1 block text-[13px] leading-snug text-ink-muted">
          {description}
        </span>
      ) : null}
    </button>
  );
}
