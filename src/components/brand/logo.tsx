import { cn } from "@/lib/utils";
import { brand } from "@/config/brand";

/**
 * The Argus mark: a reticle — a lens that finds, centered on a
 * single cold point. Drawn inline, one accent, no decoration.
 */
export function LogoMark({
  className,
  size = 24,
  tone = "ink",
}: {
  className?: string;
  size?: number;
  tone?: "ink" | "scan";
}) {
  const stroke = tone === "ink" ? "currentColor" : "#F4F5F2";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <g stroke={stroke} strokeWidth="4" strokeLinecap="round">
        <line x1="32" y1="6" x2="32" y2="16" />
        <line x1="32" y1="48" x2="32" y2="58" />
        <line x1="6" y1="32" x2="16" y2="32" />
        <line x1="48" y1="32" x2="58" y2="32" />
      </g>
      <circle cx="32" cy="32" r="13" stroke={stroke} strokeWidth="4" />
      <circle
        cx="32"
        cy="32"
        r="4.5"
        fill={tone === "ink" ? "var(--color-accent)" : "var(--color-accent-bright)"}
      />
    </svg>
  );
}

export function Logo({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "scan";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2",
        tone === "ink" ? "text-ink" : "text-scan-ink",
        className
      )}
    >
      <LogoMark size={22} tone={tone} />
      <span className="text-[16px] font-semibold tracking-tight">
        {brand.name}
      </span>
    </span>
  );
}
