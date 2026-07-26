"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { routes } from "@/config/navigation";
import { motionTokens } from "@/lib/motion";
import {
  mergeStored,
  readStored,
  removeStored,
  writeStored,
} from "@/lib/storage";
import {
  ActionBar,
  FlowSkeleton,
  OnboardingHeader,
  ResumeNote,
  StepPanel,
} from "./chrome";
import { SummaryPanel, SummaryStrip } from "./summary-panel";
import { StepAccount } from "./step-account";
import { StepProfiles } from "./step-profiles";
import { StepOwnership } from "./step-ownership";
import { StepMonitoring } from "./step-monitoring";
import { StepNotifications } from "./step-notifications";
import { StepWorkspace } from "./step-workspace";
import {
  DEFAULT_ONBOARDING,
  ONBOARDING_KEY,
  TOTAL_STEPS,
  normalizeOnboarding,
  stepGuard,
  stepMeta,
  type OnboardingState,
  type OnboardingUpdate,
} from "./state";

/** How long a resume note stays before it fades out of the way. */
const RESUME_MS = 6000;

export function OnboardingFlow() {
  const searchParams = useSearchParams();
  const demoMode = searchParams.get("mode") === "demo";
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;

  const [state, setState] = React.useState<OnboardingState>(DEFAULT_ONBOARDING);
  const [hydrated, setHydrated] = React.useState(false);
  const [maxStep, setMaxStep] = React.useState(1);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [navigated, setNavigated] = React.useState(false);
  const [resumeVisible, setResumeVisible] = React.useState(false);

  /* One-time hydration from localStorage. The stored value can only be
     read after mount (there is no window during SSR), so these are the
     flow's only deliberate setState-in-effect calls. */
  React.useEffect(() => {
    const stored = readStored<unknown>(ONBOARDING_KEY);
    const restored = normalizeOnboarding(
      mergeStored(DEFAULT_ONBOARDING, stored)
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(restored);
     
    setMaxStep(restored.step);
     
    setHydrated(true);
    if (restored.step > 1) {
       
      setResumeVisible(true);
    }
  }, []);

  /* The resume note is an acknowledgement, not a permanent banner. */
  React.useEffect(() => {
    if (!resumeVisible) return;
    const timer = setTimeout(() => setResumeVisible(false), RESUME_MS);
    return () => clearTimeout(timer);
  }, [resumeVisible]);

  const update = React.useCallback<OnboardingUpdate>((updater) => {
    setState((prev) => {
      const next = updater(prev);
      writeStored(ONBOARDING_KEY, next);
      return next;
    });
  }, []);

  const guard = stepGuard(state);
  const meta = stepMeta(state.step);
  const isLastStep = state.step === TOTAL_STEPS;

  const goTo = React.useCallback(
    (step: number, towards: 1 | -1) => {
      const target = Math.min(TOTAL_STEPS, Math.max(1, step));
      setDirection(towards);
      setNavigated(true);
      setResumeVisible(false);
      setMaxStep((previous) => Math.max(previous, target));
      update((prev) => ({ ...prev, step: target }));
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }
    },
    [reduced, update]
  );

  const handleNext = React.useCallback(() => {
    if (stepGuard(state) !== null) return;
    goTo(state.step + 1, 1);
  }, [goTo, state]);

  const handleBack = React.useCallback(() => {
    goTo(state.step - 1, -1);
  }, [goTo, state.step]);

  const handleRestart = React.useCallback(() => {
    removeStored(ONBOARDING_KEY);
    setDirection(-1);
    setNavigated(true);
    setResumeVisible(false);
    setMaxStep(1);
    setState(DEFAULT_ONBOARDING);
  }, []);

  const handleAssembled = React.useCallback(() => {
    update((prev) => (prev.completed ? prev : { ...prev, completed: true }));
  }, [update]);

  const handleFinish = React.useCallback(() => {
    update((prev) => ({ ...prev, completed: true }));
    router.push(routes.dashboard);
  }, [router, update]);

  const body = renderStep(state, update, handleAssembled, handleFinish);

  return (
    <div className="min-h-dvh bg-canvas">
      <OnboardingHeader step={state.step} demoMode={demoMode} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:pt-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <div className="min-w-0">
            {hydrated ? (
              <>
                <ResumeNote visible={resumeVisible} />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={state.step}
                    initial={
                      reduced
                        ? { opacity: 0 }
                        : { opacity: 0, x: direction * 18 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    exit={
                      reduced
                        ? { opacity: 0 }
                        : { opacity: 0, x: direction * -18 }
                    }
                    transition={{
                      duration: reduced
                        ? motionTokens.duration.instant
                        : motionTokens.duration.base,
                      ease: motionTokens.ease.enter,
                    }}
                    className="min-w-0"
                  >
                    <StepPanel
                      title={meta.title}
                      blurb={meta.blurb}
                      focusOnMount={navigated}
                    >
                      {body}
                    </StepPanel>
                  </motion.div>
                </AnimatePresence>

                <SummaryStrip
                  state={state}
                  maxStep={maxStep}
                  className="mt-9 lg:hidden"
                />

                <ActionBar
                  step={state.step}
                  guard={guard}
                  isLastStep={isLastStep}
                  onBack={handleBack}
                  onNext={handleNext}
                  onRestart={handleRestart}
                />
              </>
            ) : (
              <FlowSkeleton />
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <SummaryPanel state={state} maxStep={maxStep} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function renderStep(
  state: OnboardingState,
  update: OnboardingUpdate,
  onAssembled: () => void,
  onFinish: () => void
): React.ReactNode {
  switch (state.step) {
    case 1:
      return <StepAccount state={state} update={update} />;
    case 2:
      return <StepProfiles state={state} update={update} />;
    case 3:
      return <StepOwnership state={state} update={update} />;
    case 4:
      return <StepMonitoring state={state} update={update} />;
    case 5:
      return <StepNotifications state={state} update={update} />;
    default:
      return (
        <StepWorkspace
          state={state}
          onAssembled={onAssembled}
          onFinish={onFinish}
        />
      );
  }
}
