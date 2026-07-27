import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { copy } from "@/config/product";

/* ────────────────────────────────────────────────────────────────
   Strings local to the legal surface only.
   ──────────────────────────────────────────────────────────────── */

const text = {
  back: "Back to home",
  home: "Home",
  documents: "Documents",
  rights: `© 2026 ${brand.company}`,
  demo: "Demonstration product. These documents illustrate structure, not a binding agreement.",
} as const;

const documents = [
  { label: copy.legal.footerLinks.privacy, href: routes.privacy },
  { label: copy.legal.footerLinks.terms, href: routes.terms },
  { label: copy.legal.footerLinks.contentPolicy, href: routes.contentPolicy },
  { label: copy.legal.footerLinks.takedownPolicy, href: routes.takedownPolicy },
] as const;

/**
 * A reading environment.
 *
 * The document is set directly on the working surface — no page
 * simulation, no stacked-sheet edges, no shadow pretending there is
 * a desk. One measure, a thin bar that stays out of the way, and a
 * lot of quiet around the text.
 */
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="sticky top-0 z-30 border-b border-edge bg-page/92 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[62rem] items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href={routes.home}
            aria-label={`${brand.name} — home`}
            className="inline-flex min-h-12 items-center rounded-xs"
          >
            <Logo />
          </Link>
          <Link
            href={routes.home}
            className="inline-flex min-h-12 items-center gap-2 rounded-xs text-[14px] text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {text.back}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[62rem] flex-1 px-5 pb-24 pt-12 sm:px-8 sm:pb-32 sm:pt-20">
        {/* The measure is set here, once. The left gutter on wide
            screens is where section numbers hang. */}
        <article className="max-w-[64ch] lg:ml-16">{children}</article>
      </main>

      <footer className="border-t border-edge">
        <div className="mx-auto w-full max-w-[62rem] px-5 py-12 sm:px-8">
          <nav aria-label={text.documents}>
            <h2 className="text-[14px] font-medium text-ink-soft">
              {text.documents}
            </h2>
            <ul className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-10">
              {documents.map((doc) => (
                <li key={doc.href}>
                  <Link
                    href={doc.href}
                    className="inline-flex min-h-11 items-center rounded-xs text-[15px] text-ink transition-colors hover:text-accent"
                  >
                    {doc.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 h-px w-full bg-edge" />

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="max-w-[60ch] text-[14px] leading-relaxed text-ink-soft">
              {text.rights} · {text.demo}
            </p>
            <p className="shrink-0 font-mono text-[12.5px] text-ink-soft">
              {brand.domain}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
