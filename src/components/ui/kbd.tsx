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
        "bg-raised px-1 font-mono text-[10.5px] font-medium text-ink-muted",
        "shadow-[inset_0_-1px_0_rgb(0_0_0/0.4)]",
        className
      )}
    >
      {children}
    </kbd>
  );
}
