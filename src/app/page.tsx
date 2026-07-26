"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { ScanSurface, type ScanSession } from "@/components/scan/scan-surface";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ForAgencies } from "@/components/landing/for-agencies";
import type { Platform } from "@/lib/validation";

/**
 * The landing is the product.
 *
 * The first screen is the search, not a slogan. Once a scan starts,
 * the surface takes over the page and the supporting sections step
 * out of the way — the visitor is using Argus, not reading about it.
 */
export default function HomePage() {
  const reduced = useReducedMotion();
  const [session, setSession] = React.useState<ScanSession | null>(null);
  const topRef = React.useRef<HTMLDivElement>(null);

  const scan = React.useCallback(
    (username: string, platform: Platform | null, raw: string) => {
      setSession({ username, platform, raw });
    },
    []
  );

  const reset = React.useCallback(() => {
    setSession(null);
    topRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }, [reduced]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav scanning={session !== null} />
      <main ref={topRef} className="flex-1 scroll-mt-16">
        <ScanSurface session={session} onScan={scan} onReset={reset} />
        {/* The supporting sequences exist only before a scan starts.
            Once one is running, the product is the page. */}
        {session === null ? (
          <>
            <HowItWorks />
            <ForAgencies
              onOpenSample={() => scan("grn.louann", "onlyfans", "grn.louann")}
            />
          </>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
