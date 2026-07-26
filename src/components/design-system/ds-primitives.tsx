import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Layout primitives for the /design-system reference page only.
 * Not part of the product UI kit — do not import elsewhere.
 */

export function DsSection({
  id,
  label,
  title,
  description,
  children,
}: {
  id: string;
  label: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <p className="text-label">{label}</p>
      <h2 id={`${id}-title`} className="text-title mt-2 text-xl text-ink">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
        {description}
      </p>
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}

/** A framed specimen block: title, optional note, and a live example area. */
export function Specimen({
  title,
  note,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-edge bg-surface", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-edge-faint px-5 py-3">
        <h3 className="text-[13px] font-medium text-ink">{title}</h3>
        {note ? <p className="text-2xs text-ink-muted">{note}</p> : null}
      </div>
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </div>
  );
}

/** One color token: swatch square, token name, raw value in mono. */
export function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="min-w-0">
      <div
        className="h-12 rounded-md border border-edge"
        style={{ background: value }}
        aria-hidden
      />
      <p className="mt-1.5 truncate text-xs text-ink-secondary">{name}</p>
      <p className="truncate font-mono text-2xs text-ink-muted">{value}</p>
    </div>
  );
}

export function SwatchGroup({
  label,
  tokens,
  cols = "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6",
}: {
  label: string;
  tokens: { name: string; value: string }[];
  cols?: string;
}) {
  return (
    <div>
      <p className="text-label">{label}</p>
      <div className={cn("mt-3 grid gap-3", cols)}>
        {tokens.map((t) => (
          <Swatch key={t.name} name={t.name} value={t.value} />
        ))}
      </div>
    </div>
  );
}

/** Left-labeled row used by the typography and motion sections. */
export function LabeledRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-edge-faint py-4 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-6">
      <p className="w-40 shrink-0 font-mono text-2xs text-ink-muted">{label}</p>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
