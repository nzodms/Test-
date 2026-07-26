import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const columns: Array<{
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    title: "Product",
    links: [
      { label: "Product tour", href: "/#product" },
      { label: "Workflow", href: "/#workflow" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Create account", href: "/signup" },
      { label: "Sign in", href: "/login" },
      { label: "Explore the demo", href: "/login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-edge bg-void/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              Operational intelligence for teams who would rather act on
              signals than dig for them.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-[13px] text-ink-muted">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-positive motion-safe:animate-pulse-soft"
              />
              All systems operational
            </p>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-label">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-secondary transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-edge pt-6 text-[13px] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Halo Systems, Inc. A fictional product built as a SaaS foundation.</p>
          <p className="font-mono text-2xs">designed in the Obsidian Halo language</p>
        </div>
      </div>
    </footer>
  );
}
