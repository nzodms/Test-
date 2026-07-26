import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HaloField } from "@/components/halo/halo-field";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <HaloField x={50} y={30} strength={0.1} />
      <p className="relative font-mono text-sm text-ink-muted">404</p>
      <h1 className="text-display relative mt-3 text-3xl text-ink">
        This page drifted out of orbit
      </h1>
      <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-ink-secondary">
        The address doesn&apos;t match anything in this workspace. It may have
        moved, or the link was mistyped.
      </p>
      <div className="relative mt-8 flex gap-3">
        <Button asChild>
          <Link href="/overview">Go to dashboard</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/">
            <Compass aria-hidden />
            Back to halo.com
          </Link>
        </Button>
      </div>
    </div>
  );
}
