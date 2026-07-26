"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   ChoiceGroup — a real radiogroup with roving focus.
   Arrow keys move both selection and focus; only the selected
   option is in the tab order (or the first, when nothing is set).
   Two densities: `cards` for the account decision, `rows` for
   settings inside a step.
   ════════════════════════════════════════════════════════════════ */

export type ChoiceOption<T extends string> = {
  value: T;
  title: string;
  body: string;
  icon?: React.ReactNode;
};

function SelectionMark({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors",
        selected ? "border-accent bg-accent" : "border-edge-strong bg-paper"
      )}
    >
      {selected ? (
        <svg viewBox="0 0 10 10" className="size-2.5 text-[#f4fbfb]">
          <path
            d="M1.6 5.2 3.9 7.4 8.4 2.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  layout = "rows",
  className,
}: {
  label: string;
  options: readonly ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  layout?: "cards" | "rows";
  className?: string;
}) {
  const buttons = React.useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);

  const focusIndex = (index: number) => {
    const count = options.length;
    if (count === 0) return;
    const wrapped = ((index % count) + count) % count;
    const option = options[wrapped];
    if (!option) return;
    onChange(option.value);
    buttons.current[wrapped]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const from = selectedIndex === -1 ? index : selectedIndex;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusIndex(from + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusIndex(from - 1);
        break;
      case "Home":
        event.preventDefault();
        focusIndex(0);
        break;
      case "End":
        event.preventDefault();
        focusIndex(options.length - 1);
        break;
      default:
        break;
    }
  };

  const cards = layout === "cards";

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        cards ? "grid gap-3 sm:grid-cols-2" : "flex flex-col gap-2",
        className
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        const tabIndex =
          selectedIndex === -1 ? (index === 0 ? 0 : -1) : selected ? 0 : -1;
        return (
          <button
            key={option.value}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={tabIndex}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "group relative w-full text-left transition-colors duration-150",
              cards
                ? "flex min-h-[168px] flex-col rounded-lg border p-5"
                : "flex min-h-11 items-start gap-3 rounded-md border p-4",
              selected
                ? "border-accent bg-accent-tint"
                : "border-edge bg-paper hover:border-edge-strong hover:bg-mineral/60"
            )}
          >
            {cards ? (
              <>
                <span className="flex w-full items-start justify-between gap-3">
                  <span
                    className={cn(
                      "block transition-colors",
                      selected ? "text-accent" : "text-ink-soft"
                    )}
                  >
                    {option.icon}
                  </span>
                  <SelectionMark selected={selected} />
                </span>
                <span className="mt-auto block pt-6">
                  <span className="block text-title text-[17px] text-ink">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-ink-soft">
                    {option.body}
                  </span>
                </span>
              </>
            ) : (
              <>
                <SelectionMark selected={selected} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-ink">
                    {option.title}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-soft">
                    {option.body}
                  </span>
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
