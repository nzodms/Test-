"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const params = useSearchParams();
  const email = params.get("email");

  return (
    <div className="text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-md border border-halo-500/30 bg-halo-500/10">
        <Inbox className="size-5 text-halo-300" aria-hidden />
      </div>
      <h1 className="text-display mt-6 text-2xl text-ink">Confirm your email</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
        We sent a confirmation link to{" "}
        {email ? (
          <span className="text-ink">{email}</span>
        ) : (
          "your email address"
        )}
        . Click it to activate your workspace — the link works once and
        expires in 24 hours.
      </p>
      <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
        Nothing arriving? Check spam, or sign up again to receive a fresh
        link.
      </p>
      <Button variant="secondary" className="mt-8" asChild>
        <Link href="/login">
          <ArrowLeft aria-hidden />
          Back to sign in
        </Link>
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyEmailContent />
    </React.Suspense>
  );
}
