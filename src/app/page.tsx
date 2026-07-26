"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { CaseFile, type FileSession } from "@/components/file/case-file";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ForAgencies } from "@/components/landing/for-agencies";
import type { Platform } from "@/lib/validation";

/**
 * The landing is a file.
 *
 * It opens as an empty record with an intake field, becomes the scan
 * being written, and ends as a completed report. Two short sections
 * follow for readers who scroll past the file — no marketing rhythm
 * of eyebrow, headline, paragraph, preview, repeat.
 */
export default function HomePage() {
  const reduced = useReducedMotion();
  const [session, setSession] = React.useState<FileSession | null>(null);
  const topRef = React.useRef<HTMLDivElement>(null);

  const open = React.useCallback(
    (username: string, platform: Platform | null, raw: string) => {
      setSession({ username, platform, raw });
    },
    []
  );

  const close = React.useCallback(() => {
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
        <CaseFile session={session} onOpen={open} onClose={close} />
        {/* The supporting reading only exists while no file is open;
            once a scan is running, the file is the page. */}
        {session === null ? (
          <>
            <HowItWorks />
            <ForAgencies onOpenSample={() => open("grn.louann", "onlyfans", "grn.louann")} />
          </>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
