"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isDemoClient } from "@/lib/auth";

/** Official multi-color Google mark, inline so no external asset. */
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3c-1.08.72-2.45 1.14-4.06 1.14-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.29a12.04 12.04 0 0 0 0 10.74l3.98-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.94 1.19 15.23 0 12 0A11.99 11.99 0 0 0 1.29 6.63l3.98 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

/**
 * Shown only while the app runs without Supabase credentials.
 * Part of the demo-mode surface — remove with lib/demo-mode.ts.
 */
export function DemoNotice({ context }: { context: "login" | "signup" }) {
  if (!isDemoClient()) return null;
  return (
    <div className="mb-6 rounded-md border border-ember-400/25 bg-ember-400/[0.07] px-4 py-3">
      <p className="flex items-center gap-2 text-[13px] font-medium text-ember-300">
        <Sparkles className="size-3.5" aria-hidden />
        Demo environment
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">
        {context === "login"
          ? "No backend is configured, so any credentials open the demo workspace with realistic data."
          : "No backend is configured, so creating an account instantly opens the demo workspace — nothing is stored."}
      </p>
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3" aria-hidden>
      <span className="edge-fade-x h-px flex-1" />
      <span className="text-2xs uppercase tracking-wider text-ink-faint">or</span>
      <span className="edge-fade-x h-px flex-1" />
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-5 rounded-md border border-critical/25 bg-critical/[0.07] px-4 py-3 text-[13px] leading-relaxed text-critical"
    >
      {message}
    </div>
  );
}

export function GoogleButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) {
  if (isDemoClient()) return null;
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={onClick}
        loading={loading}
      >
        {!loading && <GoogleIcon className="size-4" />}
        Continue with Google
      </Button>
      <OrDivider />
    </>
  );
}
