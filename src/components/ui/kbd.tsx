import { cn } from "@/lib/utils";

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
        "inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-edge-strong",
        "bg-paper px-1 font-mono text-[10.5px] font-medium text-ink-soft",
        "shadow-[0_1px_0_rgb(17_18_16/0.12)]",
        className
      )}
    >
      {children}
    </kbd>
  );
}
