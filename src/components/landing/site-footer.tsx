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

export function SiteFooter() {
  return (
    <footer className="border-t border-edge bg-paper/50">
      <div className="mx-auto w-full max-w-[1560px] px-4 py-14 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
              {brand.description}
            </p>
          </div>

          <div className="flex gap-12 sm:gap-20">
            <nav aria-label="Product">
              <h3 className="text-label">Product</h3>
              <ul className="mt-4 space-y-2.5">
                {product.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-ink-soft transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Legal">
              <h3 className="text-label">Legal</h3>
              <ul className="mt-4 space-y-2.5">
                {legal.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-ink-soft transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-edge pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-2xs text-ink-soft">
            © 2026 {brand.company} · A demonstration product built as a
            foundation. Results shown are simulated.
          </p>
          <p className="text-data text-ink-faint">{brand.domain}</p>
        </div>
      </div>
    </footer>
  );
}
