import { cn } from "@/lib/utils";

/**
 * Redaction — a solid ink block, not a blur.
 *
 * The withheld characters are never passed to this component and so
 * never reach the document: it receives a width and draws over
 * nothing. That makes it a real protection rather than a visual
 * effect a reader could defeat with devtools, and it reads
 * unambiguously as a confidential file.
 */
export function Redacted({
  chars,
  className,
}: {
  /** How much text is withheld, in characters. */
  chars: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label="Redacted"
      className={cn("redaction-block", className)}
      style={{ width: `${Math.max(1.2, chars * 0.56)}ch` }}
    />
  );
}

/**
 * A domain with its identifying middle removed: the shape of a
 * domain survives, the domain itself does not.
 *
 * Takes the visible head and tail only — the middle is described by
 * length, never supplied.
 */
export function RedactedDomain({
  head,
  tail,
  hiddenChars,
  className,
}: {
  head: string;
  tail: string;
  hiddenChars: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline font-mono", className)}>
      <span>{head}</span>
      <Redacted chars={hiddenChars} className="mx-[1px]" />
      <span>{tail}</span>
    </span>
  );
}
