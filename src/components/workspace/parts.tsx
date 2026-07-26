import * as React from "react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   WORKSPACE BUILDING BLOCKS

   Local to the internal product. Nothing here is a card: a measure
   is a label and a figure sharing a rule, a panel head is an index
   and a title, a footnote is a line under a rule. Hierarchy comes
   from size, weight and position — one dominant element per screen,
   then the secondary reading, then the data.
   ════════════════════════════════════════════════════════════════ */

/* ── The file's own index ──────────────────────────────────────── */

export const FILE_SECTIONS = [
  { id: "profile", label: "Profile file", sealable: false },
  { id: "status", label: "Status", sealable: false },
  { id: "findings", label: "Findings", sealable: true },
  { id: "sources", label: "Sources", sealable: true },
  { id: "timeline", label: "Timeline", sealable: false },
  { id: "actions", label: "Actions", sealable: true },
] as const;

export type SectionId = (typeof FILE_SECTIONS)[number]["id"];

export type OpenSection = (id: SectionId) => void;

export function refNumber(i: number): string {
  return String(i + 1).padStart(2, "0");
}

/* ── Tone ──────────────────────────────────────────────────────── */

const TONE = {
  ink: "text-ink",
  soft: "text-ink-soft",
  faint: "text-ink-faint",
  warn: "text-warn",
  ok: "text-ok",
  accent: "text-accent",
} as const;

export type Tone = keyof typeof TONE;

/* ── Figure — a measurement, read as a number ──────────────────── */

export function Figure({
  value,
  suffix,
  tone = "ink",
  className,
}: {
  value: React.ReactNode;
  /** A unit that rides along at half size: "/100", "new". */
  suffix?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={cn("text-figure", TONE[tone], className)}>
      {value}
      {suffix ? (
        <span className="ml-[0.16em] text-[0.46em] font-medium tracking-normal text-ink-soft">
          {suffix}
        </span>
      ) : null}
    </span>
  );
}

/* ── Measure — a labelled figure on a rule ─────────────────────── */

export function Measure({
  label,
  value,
  hint,
  tone = "ink",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-5 border-t border-edge py-3.5",
        className
      )}
    >
      <dt className="min-w-0 text-[14.5px] text-ink-soft sm:text-[15px]">
        {label}
        {hint ? (
          <span className="ml-2 text-[13.5px] text-ink-faint">{hint}</span>
        ) : null}
      </dt>
      <dd className="shrink-0">
        <Figure
          value={value}
          tone={tone}
          className="text-[21px] sm:text-[23px]"
        />
      </dd>
    </div>
  );
}

/* ── Panel head — the index and the title of a section ─────────── */

export function PanelHead({
  index,
  title,
  note,
  aside,
}: {
  index: string;
  title: string;
  note?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-7 sm:mb-9">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="text-title flex items-baseline gap-3 text-[21px] text-ink sm:text-[23px]">
          <span className="font-mono text-[12.5px] font-normal tabular tracking-[0.04em] text-ink-faint">
            {index}
          </span>
          {title}
        </h2>
        {aside}
      </div>
      {note ? (
        <p className="mt-2.5 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-soft">
          {note}
        </p>
      ) : null}
    </div>
  );
}

/* ── Sub head — opens a block inside a panel ───────────────────── */

export function SubHead({
  title,
  count,
  aside,
  className,
}: {
  title: string;
  count?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1",
        className
      )}
    >
      <h3 className="text-subject flex items-baseline gap-2.5 text-[15.5px] text-ink">
        {title}
        {count !== undefined ? (
          <span className="font-mono text-[12.5px] tabular text-ink-soft">
            {count}
          </span>
        ) : null}
      </h3>
      {aside}
    </div>
  );
}

/* ── Field — a labelled fact in a record ───────────────────────── */

export function Field({
  label,
  value,
  mono = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-edge py-3.5", className)}>
      <dt className="text-[13.5px] text-ink-soft">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-ink",
          mono ? "font-mono text-[14px] tabular" : "text-[15.5px]"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/* ── Footnote — the small print under a rule ───────────────────── */

export function Footnote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mt-9 max-w-[62ch] border-t border-edge pt-5 text-[14px] leading-relaxed text-ink-soft",
        className
      )}
    >
      {children}
    </p>
  );
}

/* ── Jump — moves the reader to another section of the file ────── */

export function Jump({
  onClick,
  children,
  className,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-1.5 rounded-[3px] text-[14.5px] text-ink transition-colors hover:text-accent sm:min-h-0",
        className
      )}
    >
      {children}
      <span aria-hidden className="font-mono text-[13px] text-ink-faint">
        →
      </span>
    </button>
  );
}

/* ── Confidence — three segments, one restrained colour ────────── */

export function ConfidenceMark({
  level,
  className,
}: {
  level: "high" | "medium" | "low";
  className?: string;
}) {
  const filled = level === "high" ? 3 : level === "medium" ? 2 : 1;
  return (
    <span aria-hidden className={cn("flex gap-[3px]", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "h-[3px] w-[9px] rounded-[1px]",
            i < filled
              ? level === "high"
                ? "bg-warn"
                : "bg-graphite"
              : "bg-mineral-deep"
          )}
        />
      ))}
    </span>
  );
}

export const confidenceWords: Record<"high" | "medium" | "low", string> = {
  high: "High confidence",
  medium: "Possible match",
  low: "Low confidence",
};
