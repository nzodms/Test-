"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { refNumber, type SectionId } from "./parts";

export interface IndexTab {
  id: SectionId;
  label: string;
  locked: boolean;
}

/**
 * The index printed along the top of a file.
 *
 * On a wide screen it is a set of tabs joined to the page beneath —
 * the join is what makes it read as a file rather than a segmented
 * control. On a phone the same strip scrolls, so it carries a rule
 * underneath that reports how far along the index the reader is;
 * without that, a strip that runs off the edge just looks clipped.
 *
 * Locked sections stay printed in the index — a reader should see
 * that the file has more in it — but they are aria-disabled and do
 * not respond to click or to the arrow keys.
 */
export function FileIndex({
  tabs,
  active,
  onSelect,
  className,
}: {
  tabs: IndexTab[];
  active: SectionId;
  onSelect: (id: SectionId) => void;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const scroller = React.useRef<HTMLDivElement | null>(null);
  const buttons = React.useRef(new Map<string, HTMLButtonElement>());
  const [scroll, setScroll] = React.useState({ ratio: 0, overflowing: false });

  const measure = React.useCallback(() => {
    const box = scroller.current;
    if (!box) return;
    const max = box.scrollWidth - box.clientWidth;
    setScroll({
      ratio: max > 4 ? Math.min(1, Math.max(0, box.scrollLeft / max)) : 0,
      overflowing: max > 4,
    });
  }, []);

  React.useEffect(() => {
    measure();
    const box = scroller.current;
    if (!box || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [measure]);

  /* Keep the open section inside the strip, horizontally only — the
     page itself must never move because a tab changed. */
  React.useEffect(() => {
    const box = scroller.current;
    const el = buttons.current.get(active);
    if (!box || !el) return;
    const left = el.offsetLeft;
    const right = left + el.offsetWidth;
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    if (left < box.scrollLeft) {
      box.scrollTo({ left: Math.max(0, left - 16), behavior });
    } else if (right > box.scrollLeft + box.clientWidth) {
      box.scrollTo({ left: right - box.clientWidth + 16, behavior });
    }
  }, [active, reduced]);

  const openable = tabs.filter((t) => !t.locked);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const at = openable.findIndex((t) => t.id === active);
    let next = at;
    if (e.key === "ArrowRight") next = (at + 1) % openable.length;
    if (e.key === "ArrowLeft") next = (at - 1 + openable.length) % openable.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = openable.length - 1;
    const target = openable[next];
    if (!target) return;
    onSelect(target.id);
    buttons.current.get(target.id)?.focus();
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scroller}
        onScroll={measure}
        onKeyDown={onKeyDown}
        role="tablist"
        aria-label="File sections"
        className={cn(
          "flex items-end gap-0.5 overflow-x-auto",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {tabs.map((tab, i) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                if (node) buttons.current.set(tab.id, node);
                else buttons.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              id={`file-tab-${tab.id}`}
              aria-controls={`file-panel-${tab.id}`}
              aria-selected={isActive}
              aria-disabled={tab.locked || undefined}
              tabIndex={isActive ? 0 : -1}
              onClick={() => {
                if (!tab.locked) onSelect(tab.id);
              }}
              className={cn(
                "relative flex min-h-[46px] shrink-0 items-center gap-2 whitespace-nowrap px-3.5",
                "text-[14.5px] transition-colors duration-150",
                /* wide: a tab joined to the page below it.
                   phone: no border at all — the open section is marked
                   on the index rule itself. */
                "sm:min-h-0 sm:rounded-t-[5px] sm:border sm:border-b-0 sm:px-4 sm:pb-2.5 sm:pt-2",
                isActive
                  ? "text-ink sm:z-10 sm:border-edge sm:bg-page"
                  : tab.locked
                    ? "cursor-default text-ink-faint sm:border-transparent sm:bg-transparent"
                    : "text-ink-soft hover:text-ink sm:border-transparent sm:bg-mineral/60 sm:hover:bg-mineral sm:hover:text-ink"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "font-mono text-[12.5px] tabular",
                  isActive ? "text-ink-soft" : "text-ink-faint"
                )}
              >
                {refNumber(i)}
              </span>
              {tab.label}
              {tab.locked ? (
                <>
                  <Lock className="size-3.5 shrink-0" aria-hidden />
                  <span className="sr-only">
                    — sealed until ownership is verified
                  </span>
                </>
              ) : null}
              {/* Phone: the open section marked straight onto the rule.
                  Wide: hides the page border under the open tab. */}
              {isActive ? (
                <>
                  <span
                    aria-hidden
                    className="absolute inset-x-2 bottom-0 h-[2px] bg-ink sm:hidden"
                  />
                  {/* Sits inside the strip, never outside it: the strip
                      scrolls, and anything hanging past its edge would be
                      clipped by that. The page below is pulled up by the
                      same pixel to meet it. */}
                  <span
                    aria-hidden
                    className="absolute inset-x-px bottom-0 hidden h-px bg-page sm:block"
                  />
                </>
              ) : null}
            </button>
          );
        })}
        <span aria-hidden className="hidden h-px flex-1 self-end bg-edge sm:block" />
      </div>

      {/* The index rule. On a phone it doubles as the report of how far
          along a strip that runs past the edge the reader has come. */}
      <div aria-hidden className="h-px bg-edge sm:hidden">
        {scroll.overflowing ? (
          <span
            className="block h-px w-1/3 bg-graphite transition-transform duration-100 ease-linear"
            style={{ transform: `translateX(${scroll.ratio * 200}%)` }}
          />
        ) : null}
      </div>
    </div>
  );
}
