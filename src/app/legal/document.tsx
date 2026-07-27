import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   The legal documents' own type system.

   These pages are neither marketing nor a simulated sheet of paper.
   They are what they say they are: readable documents. One measure,
   a generous line height, hierarchy carried by size and space, and
   mono reserved for the two things here that are genuinely data —
   the revision date and the clause numbers you would cite.
   ════════════════════════════════════════════════════════════════ */

/** The opening block: what kind of document, its name, what it is
 *  for, and when it was last revised. */
export function DocHead({
  kind,
  title,
  lead,
  updated,
}: {
  kind: string;
  title: string;
  lead: string;
  updated: string;
}) {
  return (
    <header>
      <p className="text-[14px] font-medium text-ink-soft">{kind}</p>
      <h1 className="text-display mt-4 text-[38px] text-ink sm:text-[46px]">
        {title}
      </h1>
      <p className="mt-6 max-w-[54ch] text-[18px] leading-[1.6] text-graphite">
        {lead}
      </p>
      <p className="mt-8 font-mono text-[12.5px] text-ink-faint">{updated}</p>
    </header>
  );
}

/** The one-paragraph version, for a reader who will not read the
 *  rest. Set apart by a rule and slightly larger type — not a box. */
export function DocSummary({
  label = "In short",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={label}
      className="mt-10 border-y border-edge py-8 sm:py-9"
    >
      <p className="text-[14px] font-medium text-ink-soft">{label}</p>
      <div className="mt-4 space-y-3 text-[16.5px] leading-[1.65] text-ink">
        {children}
      </div>
    </section>
  );
}

/** The standing disclosure that this product is a demonstration. */
export function DocNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-8 border-l-2 border-edge-strong pl-4 text-[14px] leading-[1.7] text-ink-soft">
      {children}
    </p>
  );
}

/**
 * A section of the document. The number hangs in the left margin on
 * wide screens so it is citable without interrupting the text, and
 * sits above the heading on narrow ones.
 */
export function DocSection({
  index,
  title,
  children,
  className,
}: {
  index: number;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const number = String(index).padStart(2, "0");
  const id = `s${number}`;
  return (
    <section
      id={id}
      className={cn("relative mt-14 scroll-mt-24 sm:mt-16", className)}
    >
      <span
        aria-hidden
        className="font-mono text-[12.5px] tabular text-ink-faint lg:absolute lg:-left-16 lg:top-[0.35rem]"
      >
        {number}
      </span>
      <h2 className="text-title mt-1.5 text-[21px] text-ink lg:mt-0">{title}</h2>
      <div className="mt-4 space-y-4 text-[16px] leading-[1.75] text-graphite">
        {children}
      </div>
    </section>
  );
}

/** A defined term inside a section: the name carries the weight, the
 *  definition runs on in the same paragraph. */
export function DocTerm({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <p>
      <span className="text-subject text-ink">{name}</span>
      <span aria-hidden className="px-1.5 text-ink-faint">
        —
      </span>
      {children}
    </p>
  );
}

/** An enumerated list of named items — source categories, case
 *  states. Hairlines between rows, no bullets, no badges. */
export function DocDefinitions({
  items,
  className,
}: {
  items: ReadonlyArray<{ term: string; definition: string; note?: string }>;
  className?: string;
}) {
  return (
    <dl className={cn("mt-6 border-t border-edge", className)}>
      {items.map((item) => (
        <div
          key={item.term}
          className="grid gap-x-8 gap-y-1 border-b border-edge-faint py-4 sm:grid-cols-[10rem_minmax(0,1fr)]"
        >
          <dt className="text-subject text-[16px] text-ink">
            {item.term}
            {item.note ? (
              <span className="ml-2 font-mono text-[12.5px] text-ink-faint">
                {item.note}
              </span>
            ) : null}
          </dt>
          <dd className="text-[16px] leading-[1.7] text-graphite">
            {item.definition}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** An address the reader is meant to write to. It is a reference, so
 *  it is set in mono. */
export function DocMail({ address }: { address: string }) {
  return (
    <a
      href={`mailto:${address}`}
      className="rounded-xs font-mono text-[14px] text-accent underline decoration-accent/35 underline-offset-4 transition-colors hover:decoration-accent"
    >
      {address}
    </a>
  );
}
