import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { brand } from "@/config/brand";
import { copy } from "@/config/product";
import { routes } from "@/config/navigation";

const legal = [
  { label: copy.legal.footerLinks.privacy, href: routes.privacy },
  { label: copy.legal.footerLinks.terms, href: routes.terms },
  { label: copy.legal.footerLinks.contentPolicy, href: routes.contentPolicy },
  { label: copy.legal.footerLinks.takedownPolicy, href: routes.takedownPolicy },
];

const product = [
  { label: copy.nav.howItWorks, href: "#how-it-works" },
  { label: copy.nav.agencies, href: "#for-agencies" },
  { label: copy.nav.demo, href: routes.onboardingDemo },
  { label: copy.nav.signIn, href: routes.signIn },
];

const linkClass =
  "inline-flex min-h-11 items-center rounded-xs text-[15px] text-ink-soft transition-colors hover:text-ink";

export function SiteFooter() {
  return (
    <footer className="border-t border-edge bg-paper/60">
      <div className="mx-auto w-full max-w-[1240px] px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between sm:gap-16">
          <div className="max-w-[38ch]">
            <Logo />
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              {brand.description}
            </p>
          </div>

          <div className="flex gap-12 sm:gap-20">
            <nav aria-label="Product">
              <h2 className="text-[14px] font-medium text-ink">Product</h2>
              <ul className="mt-1 flex flex-col">
                {product.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Legal">
              <h2 className="text-[14px] font-medium text-ink">Legal</h2>
              <ul className="mt-1 flex flex-col">
                {legal.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-edge pt-6 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="text-[14px] leading-relaxed text-ink-soft">
            © 2026 {brand.company} · Demonstration product. Every result shown
            is simulated.
          </p>
          <p className="shrink-0 font-mono text-[12.5px] text-ink-soft">
            {brand.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
