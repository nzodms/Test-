import type { Metadata } from "next";
import Link from "next/link";

import { SignInForm } from "@/components/auth/sign-in-form";
import { LogoMark } from "@/components/brand/logo";
import { ReportPage, VerificationSeal } from "@/components/file/file-parts";
import { Redacted } from "@/components/file/redacted";
import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { copy } from "@/config/product";
import { caseReference } from "@/lib/case-ref";
import { DEMO_ANCHOR, scanTotals } from "@/lib/demo/scan-data";
import { cn, formatLongDateUTC } from "@/lib/utils";

const text = {
  heading: "Open your workspace",
  purpose:
    "Findings, sources, evidence and removal requests are held in one workspace. Signing in is what opens it.",
  reportLabel: "Profile exposure report",
  subjectAria: "Profile name withheld",
  generated: "Generated",
  sealedNote:
    "Sealed values are withheld at the source: the characters are never sent to this page, so there is nothing to recover.",
  libraryNote: (matches: number) =>
    `The demonstration workspace behind this cover holds ${matches} findings.`,
  noWorkspace: "No workspace yet?",
  openDemo: "Set one up with demonstration data",
  home: "Back to the public scan",
} as const;

const facts: readonly { label: string; chars: number }[] = [
  { label: "potential matches", chars: 4 },
  { label: "indexed public sources", chars: 3 },
  { label: "high-confidence findings", chars: 3 },
  { label: "exposure status", chars: 7 },
];

export const metadata: Metadata = {
  title: copy.nav.signIn,
  description: brand.description,
  robots: { index: false, follow: true },
};

/**
 * An access request against a sealed report.
 *
 * Not a login box beside a marketing panel: the cover of a report
 * the visitor cannot read, with the request to open it printed
 * alongside. Every value on that cover is withheld at the source —
 * the characters are never sent, so there is nothing to recover.
 */
export default function SignInPage() {
  return (
    <main className="min-h-dvh bg-canvas">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-8 sm:py-9">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={routes.home}
            aria-label={`${brand.name} — home`}
            className="inline-flex h-11 items-center gap-2.5 rounded-xs"
          >
            <LogoMark size={19} />
            <span className="text-[16.5px] font-medium tracking-tight text-ink">
              {brand.name}
            </span>
          </Link>
          <Link
            href={routes.home}
            className="inline-flex h-11 items-center rounded-xs text-[14.5px] text-ink-soft transition-colors hover:text-ink"
          >
            {text.home}
          </Link>
        </div>

        <div className="mt-10 grid gap-14 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-20">
          {/* ── The request ───────────────────────────────────────── */}
          <div className="min-w-0 max-w-[460px]">
            <h1 className="text-display text-[32px] text-ink sm:text-[40px] lg:text-[46px]">
              {text.heading}
            </h1>
            <p className="mt-4 max-w-[46ch] text-[15.5px] leading-relaxed text-ink-soft">
              {text.purpose}
            </p>

            <div className="mt-9">
              <SignInForm />
            </div>

            <p className="mt-8 border-t border-edge pt-6 text-[15.5px] leading-relaxed text-ink">
              {text.noWorkspace}{" "}
              <Link
                href={routes.onboardingDemo}
                className="font-medium text-ink underline decoration-edge-strong underline-offset-4 transition-colors hover:decoration-ink"
              >
                {text.openDemo}
              </Link>
            </p>

            {/* The cover, condensed, where there is no second column */}
            <SealedCover compact className="mt-10 lg:hidden" />

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-1 border-t border-edge pt-4 text-[14.5px] text-ink-soft">
              <Link
                href={routes.privacy}
                className="inline-flex min-h-11 items-center rounded-xs transition-colors hover:text-ink"
              >
                {copy.legal.footerLinks.privacy}
              </Link>
              <Link
                href={routes.terms}
                className="inline-flex min-h-11 items-center rounded-xs transition-colors hover:text-ink"
              >
                {copy.legal.footerLinks.terms}
              </Link>
              <Link
                href={routes.contentPolicy}
                className="inline-flex min-h-11 items-center rounded-xs transition-colors hover:text-ink"
              >
                {copy.legal.footerLinks.contentPolicy}
              </Link>
            </div>
          </div>

          {/* ── The sealed cover ──────────────────────────────────── */}
          <aside className="hidden lg:block">
            <ReportPage className="px-9 py-10">
              <SealedCover />
            </ReportPage>

            <p className="mt-5 px-1 text-[14px] leading-relaxed text-ink-soft">
              {text.sealedNote}{" "}
              <span className="tabular">
                {text.libraryNote(scanTotals.matches)}
              </span>
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

/**
 * The cover itself. `compact` is the phone reading of the same
 * document: fewer facts, no page beneath it, same withholding.
 */
function SealedCover({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const shown = compact ? facts.slice(0, 3) : facts;

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-baseline justify-between gap-5 border-b border-edge pb-3.5">
        <p className="text-[14.5px] text-ink-soft">{text.reportLabel}</p>
        <p className="shrink-0 font-mono text-[12.5px] text-ink-soft">
          {caseReference(null)}
        </p>
      </div>

      {/* The withheld subject names the report, but the request to
          open it is what this screen is about — this stays a clear
          step below the heading rather than competing with it. */}
      <p
        className={cn(
          "text-subject mt-7 flex items-baseline gap-1 text-ink",
          compact ? "text-[20px]" : "text-[28px]"
        )}
        aria-label={text.subjectAria}
      >
        @<Redacted chars={11} className="!h-[0.66em]" />
      </p>

      <dl className="mt-7">
        {shown.map((fact) => (
          <div
            key={fact.label}
            className="flex items-baseline justify-between gap-6 border-t border-edge py-3.5"
          >
            <dt className="text-[15px] text-ink-soft">{fact.label}</dt>
            <dd>
              <Redacted chars={fact.chars} className="!h-[0.85em]" />
            </dd>
          </div>
        ))}
      </dl>

      {compact ? (
        <p className="mt-5 text-[14px] leading-relaxed text-ink-soft">
          {text.sealedNote}
        </p>
      ) : (
        <div className="mt-8 border-t border-edge pt-5">
          <div className="flex items-baseline justify-between gap-6">
            <p className="text-[14px] text-ink-soft">{text.generated}</p>
            <p className="whitespace-nowrap font-mono text-[13px] text-ink">
              {formatLongDateUTC(DEMO_ANCHOR)}
            </p>
          </div>
          <VerificationSeal state="required" className="mt-5 text-[14px]" />
        </div>
      )}
    </div>
  );
}
