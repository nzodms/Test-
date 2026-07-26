import { cn } from "@/lib/utils";

/**
 * Sealed evidence.
 *
 * A file references its evidence rather than displaying it. This
 * draws the *shape* of a held exhibit — ruled lines on a page,
 * nothing depictive — so a reader understands material exists
 * without any of it being shown. It is never an image, and it never
 * receives one.
 */
export function EvidenceBlock({
  seed,
  sealed = false,
  className,
}: {
  seed: number;
  /** Sealed evidence is dimmed and its rules are shortened. */
  sealed?: boolean;
  className?: string;
}) {
  // Deterministic rule lengths — the exhibit always looks the same.
  const rules = [0, 1, 2, 3].map(
    (i) => 42 + ((seed * (i + 3) * 17) % 46)
  );

  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-[2px] border border-edge bg-paper",
        sealed && "opacity-60",
        className
      )}
    >
      <div className="flex h-full flex-col justify-center gap-[13%] px-[12%]">
        {rules.map((w, i) => (
          <span
            key={i}
            className="block h-px bg-graphite/25"
            style={{ width: `${sealed ? Math.min(w, 58) : w}%` }}
          />
        ))}
      </div>
      {sealed ? (
        <span className="absolute inset-x-[12%] top-1/2 h-px -translate-y-1/2 bg-ink/45" />
      ) : null}
    </div>
  );
}
