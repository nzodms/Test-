import { cn } from "@/lib/utils";

/** A key on a keyboard: mono, because it is a literal reference to
 *  something printed on hardware. Never below 12.5px. */
export function Kbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-xs",
        "border border-edge-strong bg-page px-1.5",
        "font-mono text-[12.5px] font-medium leading-none text-ink-soft",
        className
      )}
    >
      {children}
    </kbd>
  );
}
