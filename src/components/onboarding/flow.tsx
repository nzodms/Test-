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
  type RegisterAdvance,
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
  const [assembled, setAssembled] = React.useState(false);
  const [resumeVisible, setResumeVisible] = React.useState(false);

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const openRef = React.useRef<HTMLDivElement>(null);

  /* Handed to the open entry as callback refs. Passing the ref
     objects themselves down through the entry list would be reading
     a ref during render, which React's compiler rules disallow —
     these are stable functions that only run at commit. */
  const setHeading = React.useCallback((node: HTMLHeadingElement | null) => {
    headingRef.current = node;
  }, []);
  const setOpenRoot = React.useCallback((node: HTMLDivElement | null) => {
    openRef.current = node;
  }, []);
  /**
   * A step may take over Continue: it validates, reports its own
   * reason next to the control that caused it, and returns whether
   * the entry can be left. When a step owns the check the generic
   * guard is not raised as well — one problem, one message.
   */
  const advanceRef = React.useRef<(() => boolean) | null>(null);

  /* Steps register through this callback rather than receiving the ref
     itself: handing a ref object to a function during render is what
     React's compiler rules forbid, and a stable registrar is the same
     thing without the hazard. */
  const registerAdvance = React.useCallback(
    (attempt: (() => boolean) | null) => {
      advanceRef.current = attempt;
      return () => {
        if (advanceRef.current === attempt) advanceRef.current = null;
      };
    },
    []
  );

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
  const meta = stepMeta(state.step, assembled);
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
      setAssembled(false);
      setResumeVisible(false);
      setMaxStep((previous) => Math.max(previous, target));
      update((prev) => ({ ...prev, step: target }));
    },
    [update]
  );

  const handleNext = React.useCallback(() => {
    if (stepGuard(state) !== null) {
      /* An entry can resolve its own guard — step 02 records whatever
         is typed rather than making the person press Add first, and
         step 05 marks the email field itself. When a step owns the
         check it also owns the message. */
      const attempt = advanceRef.current;
      if (attempt) {
        if (attempt()) {
          goTo(state.step + 1);
        } else {
          /* The entry has just marked the control that caused it —
             drop any generic guard so there is only one message. */
          setAttempted(false);
        }
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
    setAssembled(false);
    setResumeVisible(false);
    setMaxStep(1);
    setState(DEFAULT_ONBOARDING);
  }, []);

  const handleAssembled = React.useCallback(() => {
    setAssembled(true);
    update((prev) => (prev.completed ? prev : { ...prev, completed: true }));
  }, [update]);

  const handleFinish = React.useCallback(() => {
    update((prev) => ({ ...prev, completed: true }));
    router.push(routes.dashboard);
  }, [router, update]);

  /* An entry already written stays written, even after stepping back —
     including from the last entry, which would otherwise be a dead
     end. The last entry itself is never jumped to: it is reached by
     creating the workspace. */
  const railItems: RailItem[] = STEPS.map((step) => ({
    label: stepName(step),
    state:
      step === state.step ? "active" : step <= maxStep ? "done" : "pending",
    reachable: step < TOTAL_STEPS && step <= maxStep && step !== state.step,
  }));

  /* The open entry's body is built once, above the entry list: a step
     registers itself through `registerAdvance`, and building that
     inside the entry list would hand a ref-bearing callback around
     while the list renders. */
  const isFinalStep = state.step === TOTAL_STEPS;
  const openBody = isFinalStep ? null : (
    <StepBody state={state} update={update} registerAdvance={registerAdvance} />
  );
  const workspaceBody = (
    <StepWorkspace
      state={state}
      onAssembled={handleAssembled}
      onFinish={handleFinish}
    />
  );

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
              <SetupRail items={railItems} onSelect={goTo} />
            </div>
          </div>

          <div className="min-w-0">
            {hydrated ? (
              <>
                <ResumeNote visible={resumeVisible} />

                {/* Small screens carry the counter inline instead. The
                    reference is only repeated where the header has had
                    to drop it. */}
                <p className="mb-4 font-mono text-[12.5px] tabular text-ink-soft lg:hidden">
                  <span className="sr-only">
                    {local.stepCounter(state.step)} · {reference}
                  </span>
                  <span aria-hidden>
                    {pad2(state.step)} / {pad2(TOTAL_STEPS)}
                    <span className="px-2 md:hidden">·</span>
                    <span className="md:hidden">{reference}</span>
                  </span>
                </p>

                <ReportPage className="px-4 py-2 sm:px-8 sm:py-3">
                  {/* All six entries stay on the page. The one being
                      answered is open — including the last, so the
                      record you built stays readable while it commits. */}
                  {STEPS.map((step) => {
                    const isFinal = step === TOTAL_STEPS;
                    if (step === state.step) {
                      return (
                        <OpenStep
                          key={step}
                          first={step === 1}
                          index={step}
                          title={meta.title}
                          blurb={meta.blurb}
                          headingRef={setHeading}
                          rootRef={setOpenRoot}
                          actions={
                            isFinal ? undefined : (
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
                            )
                          }
                        >
                          {isFinal ? workspaceBody : openBody}
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
                        done={!isFinal && step <= maxStep}
                        onOpen={() => goTo(step)}
                      />
                    );
                  })}
                </ReportPage>

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

/**
 * The body of whichever entry is open. A component rather than a
 * helper call: `registerAdvance` closes over a ref, and React's
 * compiler rules allow handing that to JSX but not to a plain
 * function during render.
 */
function StepBody({
  state,
  update,
  registerAdvance,
}: {
  state: OnboardingState;
  update: OnboardingUpdate;
  registerAdvance: RegisterAdvance;
}) {
  switch (state.step) {
    case 1:
      return <StepUsage state={state} update={update} />;
    case 2:
      return (
        <StepProfile
          state={state}
          update={update}
          registerAdvance={registerAdvance}
        />
      );
    case 3:
      return <StepRelationship state={state} update={update} />;
    case 4:
      return <StepMonitoring state={state} update={update} />;
    default:
      return (
        <StepAlerts
          state={state}
          update={update}
          registerAdvance={registerAdvance}
        />
      );
  }
}
