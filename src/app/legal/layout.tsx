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
  { label: text.home, href: routes.home },
] as const;

/**
 * A reading environment, not a product screen: one narrow measure,
 * a slim bar that stays out of the way, and a great deal of quiet
 * space around the text.
 */
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-edge bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[68ch] items-center justify-between gap-4 px-5 py-2.5">
          <Link
            href={routes.home}
            aria-label={`${brand.name} — home`}
            className="inline-flex min-h-11 items-center rounded-sm"
          >
            <Logo />
          </Link>
          <Link
            href={routes.home}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-[13px] text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {text.back}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[68ch] flex-1 px-5 pt-14 pb-24 sm:pt-20 sm:pb-32">
        {children}
      </main>

      <footer className="border-t border-edge bg-paper/60">
        <div className="mx-auto w-full max-w-[68ch] px-5 py-10">
          <nav aria-label={text.documents}>
            <h2 className="text-label">{text.documents}</h2>
            <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
              {documents.map((doc) => (
                <li key={doc.href}>
                  <Link
                    href={doc.href}
                    className="inline-flex min-h-11 items-center text-[14px] text-ink-soft transition-colors hover:text-ink"
                  >
                    {doc.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 h-px w-full edge-fade-x" />

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-2xs leading-relaxed text-ink-soft">
              {text.rights} · {text.demo}
            </p>
            <p className="text-data shrink-0 text-ink-faint">{brand.domain}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
