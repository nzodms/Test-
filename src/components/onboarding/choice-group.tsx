"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   ChoiceGroup — a real radiogroup with roving focus.
   Arrow keys move both selection and focus; only the selected
   option is in the tab order (or the first, when nothing is set).

   Visually these are entries on a record: ruled rows with the choice
   marked in the margin. Nothing is boxed — a decision written into a
   file does not arrive in a card.
   ════════════════════════════════════════════════════════════════ */

export type ChoiceOption<T extends string> = {
  value: T;
  title: string;
  body: string;
};

function SelectionMark({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-[0.3em] flex size-[17px] shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
        selected ? "border-accent bg-accent" : "border-edge-strong bg-transparent"
      )}
    >
      {selected ? <span className="size-[6px] rounded-full bg-page" /> : null}
    </span>
  );
}

export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
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

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex flex-col", className)}
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
              "group relative -mx-3 flex w-[calc(100%+1.5rem)] items-start gap-3.5 rounded-xs border-t border-edge px-3 py-4 text-left",
              "min-h-[3.75rem] transition-colors duration-200",
              selected ? "bg-page" : "hover:bg-page/60"
            )}
          >
            {/* The choice, marked in the margin of the rule */}
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-[-1px] h-px transition-all duration-200",
                selected ? "w-8 bg-accent" : "w-0 bg-transparent"
              )}
            />
            <SelectionMark selected={selected} />
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-[16px] text-ink transition-colors",
                  selected && "font-medium"
                )}
              >
                {option.title}
              </span>
              <span className="mt-1 block text-[14.5px] leading-relaxed text-ink-soft">
                {option.body}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
