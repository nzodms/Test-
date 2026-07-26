import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { routes } from "@/config/navigation";
import { copy } from "@/config/product";

const [publicSources, verification, protection] = copy.legal.positioning;

const rows: readonly { title: string; body: string }[] = [
  {
    title: publicSources ?? "Public sources only",
    body: "Argus reads only what is already publicly indexed. It never accesses private, paid or logged-in content.",
  },
  {
    title: verification ?? "Ownership verification required",
    body: "Full reports and removal requests unlock only once a profile is confirmed to be yours.",
  },
  {
    title: protection ?? "Sensitive details remain protected",
    body: "Detailed source information stays inside your workspace. Nothing is published, listed or shared.",
  },
];

const links: readonly { label: string; href: string }[] = [
  { label: copy.legal.footerLinks.privacy, href: routes.privacy },
  { label: copy.legal.footerLinks.terms, href: routes.terms },
  { label: copy.legal.footerLinks.contentPolicy, href: routes.contentPolicy },
  { label: copy.legal.footerLinks.takedownPolicy, href: routes.takedownPolicy },
];

/**
 * The three commitments the product is built on, repeated where a
 * settings page would normally bury them, plus the documents that
 * state them in full.
 */
export function SettingsPrivacy() {
  return (
    <div>
      <ul className="divide-y divide-edge-faint border-y border-edge">
        {rows.map((row) => (
          <li key={row.title} className="py-4">
            <p className="text-[14px] font-medium text-ink">{row.title}</p>
            <p className="mt-0.5 max-w-[62ch] text-[13px] leading-relaxed text-ink-soft">
              {row.body}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group inline-flex min-h-[44px] items-center gap-1 rounded-xs text-[13px] text-ink-soft transition-colors hover:text-ink sm:min-h-0 sm:py-1"
          >
            {link.label}
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:-translate-y-0.5"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
