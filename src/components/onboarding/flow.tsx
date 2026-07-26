"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { ReportPage } from "@/components/file/file-parts";
import { routes } from "@/config/navigation";
import { caseReference } from "@/lib/case-ref";
import {
  mergeStored,
  readStored,
  removeStored,
  writeStored,
} from "@/lib/storage";
import {
  FlowHeader,
  FlowSkeleton,
  pad2,
  ResumeNote,
  SetupRail,
  type RailItem,
} from "./chrome";
import { ClosedStep, OpenStep, StepActions } from "./ledger";
import { StepUsage } from "./step-usage";
import { StepProfile } from "./step-profile";
import { StepRelationship } from "./step-relationship";
import { StepMonitoring } from "./step-monitoring";
import { StepAlerts } from "./step-alerts";
import { StepWorkspace } from "./step-workspace";
import {
  DEFAULT_ONBOARDING,
  ONBOARDING_KEY,
  TOTAL_STEPS,
  firstIncompleteStep,
  local,
  normalizeOnboarding,
  stepGuard,
  stepMeta,
  stepName,
  stepValue,
  subjectUsername,
  type OnboardingState,
  type OnboardingUpdate,
} from "./state";

/** How long a resume note stays before it fades out of the way. */
const RESUME_MS = 6000;

const STEPS = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);

/**
 * Setting up a workspace.
 *
 * One page, six ruled entries. The entry being answered is open, the
 * answered ones collapse to a line that keeps its value in view, and
 * the rail in the margin says where in the record you are. Nothing
 * cross-fades between steps: the page stays put and the answers
 * accumulate down it.
 *
 * No authentication is involved at any point — /onboarding and
 * /onboarding?mode=demo are both open routes.
 */
export function OnboardingFlow() {
  const searchParams = useSearchParams();
  const demoMode = searchParams.get("mode") === "demo";
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;

  const [state, setState] = React.useState<OnboardingState>(DEFAULT_ONBOARDING);
  const [hydrated, setHydrated] = React.useState(false);
  const [maxStep, setMaxStep] = React.useState(1);
  const [navigated, setNavigated] = React.useState(false);
  const [attempted, setAttempted] = React.useState(false);
  const [resumeVisible, setResumeVisible] = React.useState(false);

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const openRef = React.useRef<HTMLDivElement>(null);
  /** A step may take over Continue to commit what is typed. */
  const advanceRef = React.useRef<(() => boolean) | null>(null);

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
  const subject = subjectUsername(state);
  const reference = caseReference(subject);

  /* Moving between entries never scrolls the page to the top: the
     open entry is brought to the same place every time. */
  React.useEffect(() => {
    if (!navigated) return;
    headingRef.current?.focus({ preventScroll: true });
    openRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }, [state.step, navigated, reduced]);

  const goTo = React.useCallback(
    (step: number) => {
      const target = Math.min(TOTAL_STEPS, Math.max(1, step));
      setNavigated(true);
      setAttempted(false);
      setResumeVisible(false);
      setMaxStep((previous) => Math.max(previous, target));
      update((prev) => ({ ...prev, step: target }));
    },
    [update]
  );

  const handleNext = React.useCallback(() => {
    if (stepGuard(state) !== null) {
      /* An entry can resolve its own guard — step 02 records whatever
         is typed rather than making the person press Add first. */
      if (advanceRef.current?.() === true) {
        goTo(state.step + 1);
        return;
      }
      setAttempted(true);
      return;
    }
    /* Creating the workspace is the one move that needs the whole
       record to hold, not just the entry in front of you. */
    if (state.step === TOTAL_STEPS - 1) {
      const incomplete = firstIncompleteStep(state);
      if (incomplete !== null) {
        goTo(incomplete);
        setAttempted(true);
        return;
      }
    }
    goTo(state.step + 1);
  }, [goTo, state]);

  const handleBack = React.useCallback(() => {
    goTo(state.step - 1);
  }, [goTo, state.step]);

  const handleRestart = React.useCallback(() => {
    removeStored(ONBOARDING_KEY);
    setNavigated(true);
    setAttempted(false);
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

  /* An entry already written stays written, even after stepping back.
     The last entry is never jumped to — it creates the workspace. */
  const railItems: RailItem[] = STEPS.map((step) => ({
    label: stepName(step),
    state:
      step === state.step ? "active" : step <= maxStep ? "done" : "pending",
    reachable: !isLastStep && step < TOTAL_STEPS && step <= maxStep,
  }));

  return (
    <div className="min-h-dvh bg-canvas">
      <FlowHeader
        reference={reference}
        resolved={subject !== null}
        demoMode={demoMode}
      />

      <main className="mx-auto w-full max-w-[1100px] px-4 pb-20 pt-7 sm:px-8 sm:pt-12">
        <div className="grid gap-8 lg:grid-cols-[172px_minmax(0,1fr)] lg:gap-14">
          {/* The index, in the margin — persistent across every step */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <SetupRail
                reference={reference}
                items={railItems}
                onSelect={goTo}
              />
            </div>
          </div>

          <div className="min-w-0">
            {hydrated ? (
              <>
                <ResumeNote visible={resumeVisible} />

                {/* Small screens carry the marker inline instead */}
                <p className="mb-4 font-mono text-[12.5px] tabular text-ink-soft lg:hidden">
                  <span className="sr-only">
                    {local.stepCounter(state.step)} · {reference}
                  </span>
                  <span aria-hidden>
                    {pad2(state.step)} / {pad2(TOTAL_STEPS)}
                    <span className="px-2">·</span>
                    {reference}
                  </span>
                </p>

                <ReportPage className="px-4 py-1 sm:px-8 sm:py-2">
                  {isLastStep ? (
                    <OpenStep
                      first
                      index={state.step}
                      title={meta.title}
                      headingRef={headingRef}
                      rootRef={openRef}
                    >
                      <StepWorkspace
                        state={state}
                        onAssembled={handleAssembled}
                        onFinish={handleFinish}
                      />
                    </OpenStep>
                  ) : (
                    STEPS.filter((step) => step < TOTAL_STEPS).map((step) => {
                      if (step === state.step) {
                        return (
                          <OpenStep
                            key={step}
                            first={step === 1}
                            index={step}
                            title={meta.title}
                            blurb={meta.blurb}
                            headingRef={headingRef}
                            rootRef={openRef}
                            actions={
                              <StepActions
                                primaryLabel={
                                  step === TOTAL_STEPS - 1
                                    ? local.create
                                    : local.next
                                }
                                onPrimary={handleNext}
                                onBack={handleBack}
                                showBack={step > 1}
                                message={attempted ? guard : null}
                              />
                            }
                          >
                            {renderStep(state, update, advanceRef)}
                          </OpenStep>
                        );
                      }
                      return (
                        <ClosedStep
                          key={step}
                          first={step === 1}
                          index={step}
                          name={stepName(step)}
                          value={stepValue(step, state)}
                          done={step <= maxStep}
                          onOpen={() => goTo(step)}
                        />
                      );
                    })
                  )}
                </ReportPage>

                {!isLastStep ? (
                  <div className="mt-5 flex flex-col gap-1 px-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <p className="text-[14px] text-ink-soft">
                      {local.storageNote}
                    </p>
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="inline-flex h-11 items-center self-start rounded-xs text-[14.5px] text-ink-soft underline decoration-edge-strong underline-offset-4 transition-colors hover:text-ink"
                    >
                      {local.restart}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <FlowSkeleton />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function renderStep(
  state: OnboardingState,
  update: OnboardingUpdate,
  advanceRef: React.RefObject<(() => boolean) | null>
): React.ReactNode {
  switch (state.step) {
    case 1:
      return <StepUsage state={state} update={update} />;
    case 2:
      return (
        <StepProfile state={state} update={update} advanceRef={advanceRef} />
      );
    case 3:
      return <StepRelationship state={state} update={update} />;
    case 4:
      return <StepMonitoring state={state} update={update} />;
    default:
      return <StepAlerts state={state} update={update} />;
  }
}
