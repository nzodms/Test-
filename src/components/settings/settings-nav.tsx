"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { settingsSections } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/settings") return pathname === "/settings";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Settings sub-navigation. Renders as a horizontal, scrollable pill
 * row below lg and as a sticky vertical rail on lg and up.
 */
export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">
      {/* Horizontal pills — below lg */}
      <nav
        aria-label="Settings sections"
        className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:hidden"
      >
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-quiet">
          {settingsSections.map((section) => {
            const active = isActive(pathname, section.href);
            return (
              <Link
                key={section.href}
                href={section.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                  active
                    ? "border-halo-500/30 bg-halo-500/10 text-halo-200"
                    : "border-edge text-ink-secondary hover:bg-raised hover:text-ink"
                )}
              >
                {section.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Vertical rail — lg and up */}
      <nav aria-label="Settings sections" className="hidden lg:block">
        <p className="text-label mb-3 px-3">Workspace</p>
        <ul className="space-y-0.5">
          {settingsSections.map((section) => {
            const active = isActive(pathname, section.href);
            return (
              <li key={section.href}>
                <Link
                  href={section.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center rounded-md px-3 py-1.5 text-[13px] transition-colors",
                    active
                      ? "bg-halo-500/[0.09] text-ink"
                      : "text-ink-secondary hover:bg-raised hover:text-ink"
                  )}
                >
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-halo-400"
                    />
                  ) : null}
                  {section.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
