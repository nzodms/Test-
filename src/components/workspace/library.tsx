"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Lock } from "lucide-react";
import { VerificationSeal } from "@/components/file/file-parts";
import { routes } from "@/config/navigation";
import {
  exposureLabels,
  fileLibrary,
  workspace,
  type FileRecord,
} from "@/lib/demo/files";
import { DEMO_ANCHOR } from "@/lib/demo/scan-data";
import { motionTokens } from "@/lib/motion";
import { cn, formatRelative } from "@/lib/utils";
import { Figure, refNumber, type Tone } from "./parts";

/* ════════════════════════════════════════════════════════════════
   THE LIBRARY

   A shelf is not a filter over one table. Each shelf answers a
   different question — what needs deciding, what is new, what is
   still sealed, what is in flight, what is quiet — so each one is
   cut differently: the figure that matters moves into the margin,
   and the facts on the right change with it.

   The shelves are defined here rather than in the shared demo data
   because they are a property of this view, not of a file.
   ════════════════════════════════════════════════════════════════ */

type ShelfId =
  | "active"
  | "priority"
  | "new"
  | "unverified"
  | "removal"
  | "stable";

interface Shelf {
  id: ShelfId;
  label: string;
  note: string;
  select: (files: FileRecord[]) => FileRecord[];
}

const SHELVES: Shelf[] = [
  {
    id: "active",
    label: "Active files",
    note: "Every profile file open in this workspace, most recently compared first.",
    select: (f) => [...f].sort((a, b) => (a.lastScan < b.lastScan ? 1 : -1)),
  },
  {
    id: "priority",
    label: "Priority review",
    note: "High-confidence findings waiting on a decision. Nothing is requested for removal until someone here confirms it.",
    select: (f) =>
      f
        .filter((x) => x.verified && x.awaitingReview > 0 && x.highConfidence >= 10)
        .sort((a, b) => b.awaitingReview - a.awaitingReview),
  },
  {
    id: "new",
    label: "New findings",
    note: "Detected since the file was last reviewed.",
    select: (f) =>
      f.filter((x) => x.newFindings >= 5).sort((a, b) => b.newFindings - a.newFindings),
  },
  {
    id: "unverified",
    label: "Awaiting verification",
    note: "Sealed. The workspace can see how much each file holds and nothing of what is in it.",
    select: (f) => f.filter((x) => !x.verified),
  },
  {
    id: "removal",
    label: "Removal in progress",
    note: "Requests sent and awaiting a response from the source.",
    select: (f) =>
      f.filter((x) => x.removalsOpen > 0).sort((a, b) => b.removalsOpen - a.removalsOpen),
  },
  {
    id: "stable",
    label: "Monitoring stable",
    note: "Nothing new, no request open. Comparison continues on schedule.",
    select: (f) =>
      f.filter((x) => x.verified && x.removalsOpen === 0 && x.newFindings < 5),
  },
];

export function FileLibrary() {
  const reduced = useReducedMotion();
  const [shelfId, setShelfId] = React.useState<ShelfId>("active");

  const shelf = SHELVES.find((s) => s.id === shelfId) ?? SHELVES[0]!;
  const files = shelf.select(fileLibrary);
  const counts = SHELVES.map((s) => s.select(fileLibrary).length);
  const at = SHELVES.findIndex((s) => s.id === shelf.id);

  return (
    <div className="grid gap-8 lg:grid-cols-[196px_minmax(0,1fr)] lg:gap-16">
      {/* ── The shelves, in the margin ─────────────────────────────── */}
      <nav aria-label="Library shelves" className="hidden min-w-0 lg:block">
        <div className="relative">
          <span
            aria-hidden
            className="absolute left-0 top-0 h-full w-px bg-edge"
          />
          <p className="pl-4 text-[13.5px] text-ink-soft">Shelves</p>
          <ul className="mt-4">
            {SHELVES.map((s, i) => {
              const active = s.id === shelf.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setShelfId(s.id)}
                    aria-current={active ? "true" : undefined}
                    className="group relative flex w-full items-baseline gap-2.5 py-2.5 pl-4 pr-1 text-left"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-0 top-[1.15em] h-px w-3.5 origin-left transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        active
                          ? "scale-x-100 bg-accent"
                          : "scale-x-[0.35] bg-edge-strong"
                      )}
                    />
                    <span className="font-mono text-[12.5px] tabular text-ink-faint">
                      {refNumber(i)}
                    </span>
                    <span
                      className={cn(
                        "text-[14.5px] transition-colors duration-150",
                        active
                          ? "text-subject text-ink"
                          : "text-ink-soft group-hover:text-ink"
                      )}
                    >
                      {s.label}
                    </span>
                    <span className="ml-auto pl-2 font-mono text-[12.5px] tabular text-ink-soft">
                      {counts[i]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* ── The register ──────────────────────────────────────────── */}
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-x-2 text-[13.5px] text-ink-soft">
          <span className="text-[14.5px] text-ink">{workspace.name}</span>
          <span className="text-ink-faint">·</span>
          <span>{workspace.kind}</span>
          <span className="text-ink-faint">·</span>
          <span className="tabular">{fileLibrary.length} files open</span>
        </p>

        <ShelfPicker
          shelves={SHELVES}
          counts={counts}
          activeIndex={at}
          onSelect={setShelfId}
        />

        <motion.div
          key={shelf.id}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.base,
            ease: motionTokens.ease.enter,
          }}
        >
          <h1 className="text-display mt-7 text-[34px] text-ink sm:text-[44px]">
            {shelf.label}
          </h1>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">
            {shelf.note}
          </p>

          <Readout shelf={shelf.id} files={files} />

          {shelf.id === "active" ? <NextAction files={files} /> : null}

          {shelf.id === "unverified" ? (
            <SealedShelf files={files} />
          ) : (
            <ol className="mt-2">
              {files.map((file) => (
                <RegisterRow key={file.ref} file={file} shelf={shelf.id} />
              ))}
            </ol>
          )}

          {files.length === 0 ? (
            <p className="mt-2 border-t border-edge py-10 text-[15px] text-ink-soft">
              No file sits on this shelf right now.
            </p>
          ) : null}
        </motion.div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-edge pt-6">
          <VerificationSeal state="verified" />
          <p className="text-[14px] text-ink-soft">
            A file stays sealed until the profile owner is verified.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── The figures that change with the shelf ────────────────────── */

function Readout({ shelf, files }: { shelf: ShelfId; files: FileRecord[] }) {
  const sum = (pick: (f: FileRecord) => number) =>
    files.reduce((a, f) => a + pick(f), 0);

  const entries: Array<{ value: number; label: string; tone?: Tone }> =
    shelf === "priority"
      ? [
          {
            value: sum((f) => f.awaitingReview),
            label: "decisions waiting",
            tone: "warn",
          },
          { value: sum((f) => f.highConfidence), label: "high confidence" },
        ]
      : shelf === "new"
        ? [
            {
              value: sum((f) => f.newFindings),
              label: "new findings",
              tone: "warn",
            },
            {
              value: sum((f) => (f.verified ? 0 : f.newFindings)),
              label: "of them sealed",
            },
          ]
        : shelf === "unverified"
          ? [
              { value: sum((f) => f.findings), label: "findings held" },
              { value: sum((f) => f.sources), label: "sources involved" },
            ]
          : shelf === "removal"
            ? [
                {
                  value: sum((f) => f.removalsOpen),
                  label: "requests awaiting a response",
                },
                { value: sum((f) => f.removed), label: "confirmed removed" },
              ]
            : shelf === "stable"
              ? [
                  { value: files.length, label: "files, nothing outstanding" },
                  { value: sum((f) => f.findings), label: "findings on file" },
                ]
              : [
                  { value: files.length, label: "files open" },
                  {
                    value: sum((f) => (f.verified ? f.newFindings : 0)),
                    label: "new findings",
                    tone: "warn",
                  },
                  {
                    value: sum((f) => f.removalsOpen),
                    label: "requests open",
                  },
                ];

  return (
    <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-5">
      {entries.map((e) => (
        <div key={e.label}>
          <dd>
            <Figure
              value={e.value}
              tone={e.value > 0 ? (e.tone ?? "ink") : "ink"}
              className="text-[28px] sm:text-[32px]"
            />
          </dd>
          <dt className="mt-2 text-[13.5px] text-ink-soft">{e.label}</dt>
        </div>
      ))}
    </dl>
  );
}

/* ── What to do first ──────────────────────────────────────────
   An agency does not open a workspace to browse it. One panel says
   which file is most exposed and what it is waiting on, and it keeps
   the environment of the instrument that worked it out. */

function NextAction({ files }: { files: FileRecord[] }) {
  const reduced = useReducedMotion();

  /* Most exposed first, then whoever is waiting on the most
     decisions — a sealed file cannot be acted on, so it never wins. */
  const priority = [...files]
    .filter((f) => f.verified)
    .sort(
      (a, b) =>
        b.exposureScore - a.exposureScore ||
        b.awaitingReview - a.awaitingReview
    )[0];

  if (!priority) return null;

  const waiting =
    priority.awaitingReview > 0
      ? `${priority.awaitingReview} findings are waiting on a decision`
      : priority.removalsOpen > 0
        ? `${priority.removalsOpen} removal requests are open`
        : "Monitoring is current — nothing is outstanding";

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.enter,
      }}
      className="surface-active mt-9 rounded-[10px] px-5 py-6 shadow-lift sm:px-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
        <div className="min-w-0">
          <p className="font-mono text-[12.5px] tracking-[0.04em] text-accent">
            HIGHEST EXPOSURE
          </p>
          <p className="text-display mt-2.5 text-[26px] text-ink sm:text-[30px]">
            @{priority.username}
          </p>
          <p className="mt-1.5 text-[14.5px] text-ink-soft">
            {priority.platform}
            <span className="px-2 text-ink-faint">·</span>
            {waiting}
          </p>
        </div>

        <dl className="flex shrink-0 gap-x-10">
          <div>
            <dd>
              <Figure
                value={priority.exposureScore}
                suffix="/100"
                tone="warn"
                className="text-[26px]"
              />
            </dd>
            <dt className="mt-1.5 text-[13.5px] text-ink-soft">exposure</dt>
          </div>
          <div>
            <dd>
              <Figure value={priority.newFindings} className="text-[26px]" />
            </dd>
            <dt className="mt-1.5 text-[13.5px] text-ink-soft">new</dt>
          </div>
        </dl>
      </div>

      <Link
        href={`/dashboard/${priority.slug}`}
        className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-[6px] bg-accent px-5 text-[14.5px] font-medium text-scan transition-opacity duration-150 hover:opacity-90"
      >
        Open this file
        <span aria-hidden className="font-mono text-[13px]">
          →
        </span>
      </Link>
    </motion.div>
  );
}

/* ── One line of the register, cut for its shelf ───────────────── */

function RegisterRow({ file, shelf }: { file: FileRecord; shelf: ShelfId }) {
  const quiet = shelf === "stable";

  return (
    <li className="group relative -mx-3 grid grid-cols-[3.75rem_minmax(0,1fr)] gap-x-4 rounded-[4px] border-t border-edge px-3 py-5 transition-colors duration-150 hover:bg-page has-[a:focus-visible]:bg-page sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:gap-x-8">
      <Link
        href={`${routes.dashboard}/${file.slug}`}
        className="absolute inset-0 z-10 rounded-[4px] outline-offset-2"
      >
        <span className="sr-only">Open the file for @{file.username}</span>
      </Link>

      {/* margin: whatever this shelf is about */}
      <div className="pt-0.5">
        <RowLead file={file} shelf={shelf} />
      </div>

      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className={cn(
              "truncate text-[17px] text-ink sm:text-[18px]",
              quiet ? "font-normal" : "text-subject"
            )}
          >
            @{file.username}
          </span>
          <span className="text-[14px] text-ink-soft">{file.platform}</span>
          {!file.verified ? (
            <span className="inline-flex items-center gap-1.5 text-[13.5px] text-ink-soft">
              <Lock className="size-3" aria-hidden />
              Sealed
            </span>
          ) : null}
        </p>
        <p className="mt-1.5 max-w-[56ch] text-[14.5px] leading-relaxed text-ink-soft">
          <RowSub file={file} shelf={shelf} />
        </p>
      </div>

      <div className="col-start-2 mt-3 sm:col-start-3 sm:mt-0 sm:w-[13rem] sm:text-right">
        <RowTrail file={file} shelf={shelf} />
      </div>
    </li>
  );
}

function RowLead({ file, shelf }: { file: FileRecord; shelf: ShelfId }) {
  if (shelf === "priority")
    return (
      <>
        <Figure value={file.awaitingReview} tone="warn" className="text-[26px]" />
        <p className="mt-1.5 text-[13px] text-ink-soft">waiting</p>
      </>
    );
  if (shelf === "new")
    return (
      <>
        <Figure
          value={`+${file.newFindings}`}
          tone={file.verified ? "warn" : "soft"}
          className="text-[26px]"
        />
        <p className="mt-1.5 text-[13px] text-ink-soft">new</p>
      </>
    );
  if (shelf === "removal")
    return (
      <>
        <Figure value={file.removalsOpen} className="text-[26px]" />
        <p className="mt-1.5 text-[13px] text-ink-soft">open</p>
      </>
    );
  return (
    <span className="font-mono text-[12.5px] tabular text-ink-faint">
      {file.ref.slice(-4)}
    </span>
  );
}

function RowSub({ file, shelf }: { file: FileRecord; shelf: ShelfId }) {
  if (shelf === "priority")
    return (
      <>
        <span className="tabular">{file.highConfidence}</span> high-confidence
        findings across <span className="tabular">{file.sources}</span> indexed
        sources.
      </>
    );
  if (shelf === "new")
    return file.verified ? (
      <>
        Detected across <span className="tabular">{file.sources}</span> indexed
        public sources since the last review.
      </>
    ) : (
      <>Held until the account holder verifies ownership.</>
    );
  if (shelf === "removal")
    return <>{file.standing}</>;
  if (shelf === "stable")
    return (
      <>
        {file.monitoring === "daily" ? "Daily" : "Weekly"} comparison ·{" "}
        {file.standing}
      </>
    );
  return <>{file.standing}</>;
}

function RowTrail({ file, shelf }: { file: FileRecord; shelf: ShelfId }) {
  if (shelf === "priority")
    return (
      <span className="inline-flex items-baseline gap-2 text-[14.5px] text-ink">
        Review findings
        <span aria-hidden className="font-mono text-[13px] text-ink-faint">
          →
        </span>
      </span>
    );

  if (shelf === "new")
    return (
      <div className="flex flex-wrap items-baseline gap-x-4 sm:block">
        <p className="font-mono text-[12.5px] tabular text-ink-soft">
          {formatRelative(file.lastScan, DEMO_ANCHOR)}
        </p>
        <p className="text-[13.5px] text-ink-soft sm:mt-1">last comparison</p>
      </div>
    );

  if (shelf === "removal") {
    const closed = file.removed;
    const total = Math.max(1, file.removed + file.removalsOpen);
    return (
      <div className="sm:ml-auto sm:w-[11rem]">
        <p className="text-[13.5px] text-ink-soft">
          <span className="tabular text-ink">{closed}</span> of{" "}
          <span className="tabular">{total}</span> closed
        </p>
        <span
          aria-hidden
          className="mt-2 flex h-1 w-full overflow-hidden rounded-full bg-mineral-deep"
        >
          <span
            className="h-full rounded-full bg-graphite"
            style={{ width: `${(closed / total) * 100}%` }}
          />
        </span>
      </div>
    );
  }

  if (shelf === "stable")
    return (
      <div className="flex flex-wrap items-baseline gap-x-4 sm:block">
        <p className="text-[14px] text-ink-soft">
          {exposureLabels[file.exposure]} exposure
        </p>
        <p className="font-mono text-[12.5px] tabular text-ink-soft sm:mt-1">
          {formatRelative(file.lastScan, DEMO_ANCHOR)}
        </p>
      </div>
    );

  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 sm:flex-col sm:items-end sm:gap-y-1.5">
      <span className="text-[14px] text-ink-soft">
        <span className="tabular text-[16px] text-ink">{file.findings}</span>{" "}
        findings
      </span>
      {file.newFindings > 0 && file.verified ? (
        <span className="tabular text-[14px] text-warn">
          +{file.newFindings} new
        </span>
      ) : null}
      <span
        className={cn(
          "text-[14px]",
          file.exposure === "high" || file.exposure === "elevated"
            ? "text-warn"
            : "text-ink-soft"
        )}
      >
        {exposureLabels[file.exposure]} exposure
      </span>
      <span className="font-mono text-[12.5px] tabular text-ink-soft">
        {formatRelative(file.lastScan, DEMO_ANCHOR)}
      </span>
    </div>
  );
}

/* ── The sealed shelf reads differently on purpose ─────────────── */

function SealedShelf({ files }: { files: FileRecord[] }) {
  return (
    <div className="mt-2">
      {files.map((file) => (
        <section key={file.ref} className="border-t border-edge py-7">
          <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-5">
            <div className="min-w-0">
              <p className="font-mono text-[12.5px] tabular text-ink-soft">
                {file.ref}
              </p>
              <h2 className="text-title mt-2 text-[24px] text-ink sm:text-[28px]">
                @{file.username}
              </h2>
              <p className="mt-1.5 text-[14.5px] text-ink-soft">
                {file.platform} · opened{" "}
                {formatRelative(file.opened, DEMO_ANCHOR)}
              </p>
            </div>
            <dl className="flex gap-x-9">
              <div>
                <dd>
                  <Figure value={file.findings} className="text-[30px]" />
                </dd>
                <dt className="mt-1.5 text-[13.5px] text-ink-soft">
                  findings held
                </dt>
              </div>
              <div>
                <dd>
                  <Figure value={file.sources} className="text-[30px]" />
                </dd>
                <dt className="mt-1.5 text-[13.5px] text-ink-soft">sources</dt>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={routes.onboarding}
              className="inline-flex h-12 items-center rounded-[4px] bg-ink px-5 text-[15px] font-medium text-page transition-colors duration-150 hover:bg-graphite sm:h-11"
            >
              Start ownership verification
            </Link>
            <Link
              href={`${routes.dashboard}/${file.slug}`}
              className="inline-flex min-h-[44px] items-center gap-1.5 text-[14.5px] text-ink transition-colors hover:text-accent sm:min-h-0"
            >
              Open the sealed file
              <span aria-hidden className="font-mono text-[13px] text-ink-faint">
                →
              </span>
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}

/* ── Choosing a shelf on a phone ───────────────────────────────── */

function ShelfPicker({
  shelves,
  counts,
  activeIndex,
  onSelect,
}: {
  shelves: Shelf[];
  counts: number[];
  activeIndex: number;
  onSelect: (id: ShelfId) => void;
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const box = React.useRef<HTMLDivElement | null>(null);
  const current = shelves[activeIndex] ?? shelves[0]!;

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={box} className="relative mt-5 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="shelf-list"
        className="flex h-12 w-full items-center justify-between gap-3 rounded-[6px] border border-edge-strong bg-page px-4 text-left"
      >
        <span className="flex min-w-0 items-baseline gap-2.5">
          <span className="font-mono text-[12.5px] tabular text-ink-faint">
            {refNumber(activeIndex)}
          </span>
          <span className="text-subject truncate text-[15.5px] text-ink">
            {current.label}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2.5">
          <span className="font-mono text-[12.5px] tabular text-ink-soft">
            {counts[activeIndex]}
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 text-ink-soft transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </span>
      </button>

      {open ? (
        <motion.ul
          id="shelf-list"
          initial={reduced ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.fast,
            ease: motionTokens.ease.enter,
          }}
          className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-[6px] border border-edge-strong bg-page shadow-float"
        >
          {shelves.map((s, i) => {
            const active = i === activeIndex;
            return (
              <li key={s.id} className="border-t border-edge-faint first:border-t-0">
                <button
                  type="button"
                  onClick={() => {
                    onSelect(s.id);
                    setOpen(false);
                  }}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex min-h-[48px] w-full items-center gap-2.5 px-4 text-left",
                    active ? "bg-mineral/70" : "bg-transparent"
                  )}
                >
                  <span className="font-mono text-[12.5px] tabular text-ink-faint">
                    {refNumber(i)}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-[15px]",
                      active ? "text-subject text-ink" : "text-ink-soft"
                    )}
                  >
                    {s.label}
                  </span>
                  <span className="font-mono text-[12.5px] tabular text-ink-soft">
                    {counts[i]}
                  </span>
                </button>
              </li>
            );
          })}
        </motion.ul>
      ) : null}
    </div>
  );
}
