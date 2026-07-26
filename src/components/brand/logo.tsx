import { cn } from "@/lib/utils";

/**
 * The Halo mark: an interrupted orbit with an ember point at the
 * opening — the moment a signal breaks through.
 */
export function LogoMark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect width="64" height="64" rx="14" fill="#0F131C" />
      <rect
        width="63"
        height="63"
        x="0.5"
        y="0.5"
        rx="13.5"
        stroke="rgb(154 170 207 / 0.18)"
      />
      <circle
        cx="32"
        cy="32"
        r="17"
        stroke="#5ECFE3"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="80 27"
        transform="rotate(-58 32 32)"
      />
      <circle cx="45.5" cy="18.5" r="4" fill="#EEBC6F" />
    </svg>
  );
}

export function Logo({
  className,
  markSize = 28,
}: {
  className?: string;
  markSize?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} />
      <span className="text-title text-[17px] tracking-tight text-ink">
        Halo
      </span>
    </span>
  );
}
