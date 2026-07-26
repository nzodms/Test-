import { cn } from "@/lib/utils";

/**
 * Abstract stand-in for a detected preview. Never real imagery —
 * a deterministic duotone panel derived from a seed, blurred when
 * locked. Communicates "a preview exists here" without showing
 * anything explicit.
 */
export function AbstractThumb({
  seed,
  locked = false,
  tone = "scan",
  className,
}: {
  seed: number;
  locked?: boolean;
  tone?: "scan" | "light";
  className?: string;
}) {
  const tx = 20 + ((seed * 37) % 60);
  const ty = 20 + ((seed * 53) % 55);
  const ta = 120 + ((seed * 29) % 100);
  // Deterministic block layout — reads as an obscured composition
  // rather than an empty slot.
  const split = 38 + ((seed * 17) % 26);
  const dark = tone === "scan";

  return (
    <div
      aria-hidden
      className={cn(
        dark ? "thumb-abstract" : "thumb-abstract-light",
        "relative overflow-hidden rounded-sm",
        dark
          ? "ring-1 ring-inset ring-white/[0.06]"
          : "ring-1 ring-inset ring-black/[0.06]",
        // Light blur only: the panel is already abstract, so heavy
        // blur would erase the structure instead of obscuring it.
        locked && "masked-soft",
        className
      )}
      style={
        {
          "--tx": `${tx}%`,
          "--ty": `${ty}%`,
          "--ta": `${ta}deg`,
        } as React.CSSProperties
      }
    >
      {/* Structural blocks: the silhouette of a frame with content,
          never anything depictive. */}
      <div
        className={cn(
          "absolute inset-x-[14%] top-[16%] rounded-[2px]",
          dark ? "bg-white/[0.07]" : "bg-black/[0.05]"
        )}
        style={{ height: `${split}%` }}
      />
      <div
        className={cn(
          "absolute inset-x-[14%] rounded-[2px]",
          dark ? "bg-white/[0.04]" : "bg-black/[0.035]"
        )}
        style={{ top: `${split + 24}%`, height: "16%" }}
      />
      <div
        className={cn(
          "absolute left-[14%] rounded-[2px]",
          dark ? "bg-white/[0.04]" : "bg-black/[0.035]"
        )}
        style={{ top: `${split + 46}%`, height: "10%", width: "36%" }}
      />
    </div>
  );
}
