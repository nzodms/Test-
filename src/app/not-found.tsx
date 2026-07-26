import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/navigation";
import { brand } from "@/config/brand";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-data text-ink-soft">404</p>
      <h1 className="text-display mt-3 text-2xl text-ink sm:text-3xl">
        This page isn&apos;t here
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
        The address doesn&apos;t match anything in {brand.name}. It may have
        moved, or the link was mistyped.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href={routes.home}>Back to start</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href={routes.dashboard}>Open demo workspace</Link>
        </Button>
      </div>
    </div>
  );
}
