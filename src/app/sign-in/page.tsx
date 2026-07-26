import type { Metadata } from "next";
import Link from "next/link";

import { SignInForm } from "@/components/auth/sign-in-form";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { DataRow, Metric, SourceBadge } from "@/components/primitives";
import { Surface } from "@/components/primitives/surface";
import { Reveal } from "@/components/motion/reveal";
import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { copy } from "@/config/product";
import {
  DEMO_ANCHOR,
  featuredMatches,
  scanTotals,
} from "@/lib/demo/scan-data";
import { formatDateTimeUTC, formatNumber, formatRelative } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────
   Strings local to this surface only.
   ──────────────────────────────────────────────────────────────── */

const text = {
  heading: "Sign in to your workspace",
  purpose: "Review findings, monitoring and removal requests in one place.",
  home: "Back to home",
  sessionMeta: formatDateTimeUTC(DEMO_ANCHOR),
  metricHint: `Across ${formatNumber(scanTotals.sources)} indexed sources`,
} as const;

export const metadata: Metadata = {
  title: copy.nav.signIn,
  description: brand.description,
  robots: { index: false, follow: true },
};

/** The three ledger lines shown in the instrument panel. */
const panelRows = featuredMatches.slice(0, 3);

export default function SignInPage() {
  return (
    <main className="min-h-dvh bg-canvas">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 lg:min-h-dvh lg:grid-cols-[1.1fr_0.9fr]">
        {/* ── Form column — porcelain ─────────────────────────── */}
        <div className="flex min-h-dvh flex-col px-5 py-8 sm:px-8 lg:min-h-0 lg:px-14 lg:py-10">
          <header className="mx-auto w-full max-w-[400px]">
            <Link
              href={routes.home}
              aria-label={`${brand.name} — ${text.home}`}
              className="inline-flex rounded-sm"
            >
              <Logo />
            </Link>
          </header>

          <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-14 lg:py-16">
            <h1 className="text-title text-2xl text-ink">{text.heading}</h1>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
              {text.purpose}
            </p>

            <div className="mt-9">
              <SignInForm />
            </div>
          </div>

          <footer className="mx-auto w-full max-w-[400px] space-y-3 border-t border-edge-faint pt-5">
            <div className="flex flex-wrap items-center gap-x-4 text-[13px]">
              <Link
                href={routes.onboardingDemo}
                className="inline-flex min-h-11 items-center rounded-sm font-medium text-ink underline decoration-edge-strong underline-offset-4 transition-colors hover:decoration-ink sm:min-h-0"
              >
                {copy.nav.demo}
              </Link>
              <Link
                href={routes.home}
                className="inline-flex min-h-11 items-center rounded-sm text-ink-soft transition-colors hover:text-ink sm:min-h-0"
              >
                {text.home}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-ink-soft">
              <Link
                href={routes.privacy}
                className="inline-flex min-h-9 items-center rounded-sm transition-colors hover:text-ink sm:min-h-0"
              >
                {copy.legal.footerLinks.privacy}
              </Link>
              <Link
                href={routes.terms}
                className="inline-flex min-h-9 items-center rounded-sm transition-colors hover:text-ink sm:min-h-0"
              >
                {copy.legal.footerLinks.terms}
              </Link>
            </div>
          </footer>
        </div>

        {/* ── Instrument column — the only dark surface here ───── */}
        <aside className="hidden lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-edge lg:px-14 lg:py-10">
          <Reveal className="mx-auto w-full max-w-[400px]">
            <Surface
              tone="scanner"
              reflection
              className="rounded-lg px-5 py-5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-label-scan">{copy.scanner.sessionLabel}</p>
                <p className="shrink-0 text-data text-scan-faint">
                  {text.sessionMeta}
                </p>
              </div>

              <div
                aria-hidden
                className="scan-edge-fade-x mt-3.5 h-px w-full"
              />

              <ul className="mt-1 divide-y divide-scan-edge">
                {panelRows.map((match) => (
                  <li key={match.id}>
                    <DataRow
                      status="complete"
                      label={match.domainMasked}
                      mono
                      meta={formatRelative(match.detectedAt, DEMO_ANCHOR)}
                      trailing={
                        <SourceBadge kind={match.sourceKind} tone="scan" />
                      }
                    />
                  </li>
                ))}
              </ul>

              <div
                aria-hidden
                className="scan-edge-fade-x mb-4 mt-1 h-px w-full"
              />

              <div className="flex items-end justify-between gap-4">
                <Metric
                  tone="scan"
                  label={copy.scanner.kpis.matches}
                  value={formatNumber(scanTotals.matches)}
                  hint={text.metricHint}
                />
                <Badge variant="scan-ok" dot className="shrink-0">
                  {copy.scanner.complete}
                </Badge>
              </div>
            </Surface>

            <p className="mt-4 text-xs text-ink-soft">
              {copy.legal.positioning[2]}
            </p>
          </Reveal>
        </aside>
      </div>
    </main>
  );
}
