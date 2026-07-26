import { Skeleton } from "@/components/ui/states";

/** Segment-level loading UI: a calm skeleton of a typical page. */
export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8" aria-busy="true">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="mt-4 h-72" />
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
