"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/states";
import { ProgressRail } from "@/components/primitives";
import { copy } from "@/config/product";
import { routes } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { local, stepName, TOTAL_STEPS } from "./state";

/* ── Header ─────────────────────────────────────────────────────── */

export function OnboardingHeader({
  step,
  demoMode,
}: {
  step: number;
  demoMode: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-edge bg-canvas/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:gap-5 sm:px-6">
        <Link href={routes.home} className="shrink-0 rounded-sm">
          <Logo />
        </Link>
        <span aria-hidden className="hidden h-5 w-px bg-edge sm:block" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium leading-4 text-ink">
            {stepName(step)}
          </p>
          <p className="text-data tabular leading-4 text-ink-soft">
            {String(step).padStart(2, "0")} / {String(TOTAL_STEPS).padStart(2, "0")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-11 shrink-0 px-2.5 sm:h-8 sm:px-3"
        >
          <Link href={routes.home}>{copy.onboarding.exit}</Link>
        </Button>
      </div>
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 pb-3 sm:px-6">
        <ProgressRail total={TOTAL_STEPS} current={step} className="flex-1" />
        {demoMode ? (
          <Badge variant="neutral" dot className="shrink-0">
            {copy.onboarding.demoBadge}
          </Badge>
        ) : null}
      </div>
    </header>
  );
}

/* ── Step panel — title, blurb, body, focus target ──────────────── */

export function StepPanel({
  title,
  blurb,
  focusOnMount,
  children,
}: {
  title: string;
  blurb?: string;
  focusOnMount: boolean;
  children: React.ReactNode;
}) {
  const heading = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (!focusOnMount) return;
    heading.current?.focus({ preventScroll: true });
  }, [focusOnMount]);

  return (
    <section>
      <h1
        ref={heading}
        tabIndex={-1}
        className="text-title text-2xl text-ink outline-none sm:text-[28px]"
      >
        {title}
      </h1>
      {blurb ? (
        <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">
          {blurb}
        </p>
      ) : null}
      <div className="mt-7 sm:mt-8">{children}</div>
    </section>
  );
}

/* ── Resume note ────────────────────────────────────────────────── */

export function ResumeNote({ visible }: { visible: boolean }) {
  return (
    <div
      className={cn(
        "overflow-hidden transition-opacity duration-500",
        visible ? "mb-6 h-5 opacity-100" : "h-0 opacity-0"
      )}
      aria-hidden={!visible}
    >
      <p role="status" className="flex items-center gap-2 text-[13px] text-ink-soft">
        {visible ? (
          <>
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
            {copy.onboarding.resume}
          </>
        ) : null}
      </p>
    </div>
  );
}

/* ── Action bar ─────────────────────────────────────────────────── */

export function ActionBar({
  step,
  guard,
  isLastStep,
  onBack,
  onNext,
  onRestart,
}: {
  step: number;
  guard: string | null;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
  onRestart: () => void;
}) {
  const guardId = "onboarding-guard";
  return (
    <div className="mt-9 border-t border-edge pt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="lg"
            onClick={onBack}
            disabled={step === 1}
            className="px-3"
          >
            <ArrowLeft aria-hidden />
            {copy.onboarding.back}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={onRestart}
            className="px-3 text-ink-soft"
          >
            {copy.onboarding.restart}
          </Button>
        </div>
        {!isLastStep ? (
          <Button
            size="lg"
            onClick={onNext}
            disabled={guard !== null}
            aria-describedby={guard ? guardId : undefined}
            className="w-full sm:w-auto"
          >
            {copy.onboarding.next}
            <ArrowRight aria-hidden />
          </Button>
        ) : null}
      </div>
      {guard ? (
        <p
          id={guardId}
          role="status"
          className="mt-3 text-[13px] text-ink-soft sm:text-right"
        >
          {guard}
        </p>
      ) : null}
    </div>
  );
}

/* ── Pre-hydration placeholder ──────────────────────────────────── */

export function FlowSkeleton() {
  return (
    <div className="min-w-0">
      <span className="sr-only" role="status">
        {local.loading}
      </span>
      <div aria-hidden>
        <Skeleton className="h-7 w-2/3 max-w-sm" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
