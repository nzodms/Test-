import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { HaloField } from "@/components/halo/halo-field";
import { getMetrics } from "@/lib/data";

/**
 * Auth shell: form column + an ambient product panel. The panel
 * shows real numbers from the dataset, not decorative filler.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const metrics = getMetrics();

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_0.9fr]">
      {/* Form column */}
      <div className="relative flex flex-col px-5 py-8 sm:px-10">
        <Link href="/" aria-label="Halo — home" className="w-fit rounded-sm">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-ink-faint lg:text-left">
          © 2026 Halo Systems, Inc.
        </p>
      </div>

      {/* Ambient panel */}
      <div className="relative hidden overflow-hidden border-l border-edge bg-void/50 lg:block">
        <HaloField x={35} y={30} strength={0.16} drift />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(70%_50%_at_80%_100%,rgb(238_188_111/0.05),transparent_70%)]"
        />
        <div className="relative flex h-full flex-col justify-end p-12">
          <blockquote className="max-w-md">
            <p className="text-xl leading-relaxed tracking-tight text-ink">
              “The week the refund watcher caught a double-billing bug before
              finance did, the debate about tooling ended.”
            </p>
            <footer className="mt-4 text-sm text-ink-muted">
              Claire Fontaine · VP Operations, Atlas Freight
            </footer>
          </blockquote>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-edge pt-8">
            <div>
              <dd className="tabular text-xl font-medium text-ink">38 min</dd>
              <dt className="mt-1 text-xs leading-snug text-ink-muted">
                median time-to-detection
              </dt>
            </div>
            <div>
              <dd className="tabular text-xl font-medium text-ink">
                {metrics.automationSuccessRate}%
              </dd>
              <dt className="mt-1 text-xs leading-snug text-ink-muted">
                automation success rate
              </dt>
            </div>
            <div>
              <dd className="tabular text-xl font-medium text-ink">99.98%</dd>
              <dt className="mt-1 text-xs leading-snug text-ink-muted">
                platform uptime
              </dt>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
