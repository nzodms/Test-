"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  FileText,
  Gauge,
  Radar,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HaloField } from "@/components/halo/halo-field";
import { SelectableCard } from "@/components/onboarding/selectable-card";
import { getIntegrations } from "@/lib/data";
import {
  initialOnboardingState,
  loadOnboardingState,
  persistOnboardingState,
  type OnboardingState,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const steps = [
  { n: 1, title: "Company", blurb: "Who is this workspace for?" },
  { n: 2, title: "Objectives", blurb: "What should Halo watch for first?" },
  { n: 3, title: "Data sources", blurb: "Where do your signals live?" },
  { n: 4, title: "Alert policy", blurb: "How loudly should we speak?" },
  { n: 5, title: "Your space", blurb: "Halo assembles itself around you." },
];

const goalOptions = [
  { id: "risks", icon: ShieldCheck, title: "Catch risks earlier", description: "Surface deviations before they become incidents." },
  { id: "response", icon: Gauge, title: "Cut response time", description: "Route every signal to an owner in minutes." },
  { id: "automation", icon: Workflow, title: "Automate the reflexes", description: "Turn repeated responses into audited automations." },
  { id: "reporting", icon: FileText, title: "Executive visibility", description: "Weekly reviews that compile themselves." },
  { id: "revenue", icon: BarChart3, title: "Protect revenue", description: "Watch churn risk, refunds and payment health." },
  { id: "reliability", icon: Zap, title: "Raise reliability", description: "Track error budgets and delivery health." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [state, setState] = React.useState<OnboardingState>(initialOnboardingState);
  const [hydrated, setHydrated] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const integrations = getIntegrations();

  React.useEffect(() => {
    const loaded = loadOnboardingState();
    // One-time hydration of saved progress from localStorage —
    // only readable after mount, so setState here is deliberate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loaded.completed ? { ...loaded, step: 5 } : loaded);
    setHydrated(true);
  }, []);

  const update = React.useCallback(
    (patch: Partial<OnboardingState>) => {
      setState((prev) => {
        const nextState = { ...prev, ...patch };
        persistOnboardingState(nextState);
        return nextState;
      });
    },
    []
  );

  const step = state.step;

  const stepValid =
    step === 1
      ? state.company.name.trim().length >= 2 &&
        state.company.size !== "" &&
        state.company.industry !== ""
      : step === 2
        ? state.goals.length > 0
        : step === 3
          ? state.sources.length > 0
          : true;

  const goNext = () => {
    setTouched(false);
    if (!stepValid) {
      setTouched(true);
      return;
    }
    update({ step: Math.min(5, step + 1) });
  };

  const goBack = () => {
    setTouched(false);
    update({ step: Math.max(1, step - 1) });
  };

  if (!hydrated) return <div className="min-h-dvh bg-base" aria-busy="true" />;

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Progress rail */}
      <aside className="relative shrink-0 border-b border-edge bg-void/40 px-5 py-5 lg:w-80 lg:border-b-0 lg:border-r lg:px-8 lg:py-8">
        <Link href="/" aria-label="Halo — home" className="hidden rounded-sm lg:inline-flex">
          <Logo />
        </Link>
        <ol className="mt-0 flex gap-2 lg:mt-12 lg:flex-col lg:gap-0" aria-label="Setup progress">
          {steps.map((s) => {
            const isActive = s.n === step;
            const isDone = s.n < step;
            return (
              <li key={s.n} className="relative flex-1 lg:flex-none">
                {/* connector */}
                {s.n < 5 ? (
                  <span
                    aria-hidden
                    className="absolute left-[15px] top-9 hidden h-8 w-px bg-edge lg:block"
                  />
                ) : null}
                <div
                  className={cn(
                    "relative flex items-center gap-3.5 rounded-md py-1.5 lg:py-2",
                    isActive && "text-ink"
                  )}
                >
                  {isActive ? (
                    <HaloField x={12} y={50} strength={0.16} className="hidden lg:block" />
                  ) : null}
                  <span
                    className={cn(
                      "relative flex size-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-medium transition-colors",
                      isDone
                        ? "border-halo-500/50 bg-halo-500/15 text-halo-300"
                        : isActive
                          ? "border-halo-400 bg-halo-500 text-[#04222b]"
                          : "border-edge-strong bg-raised text-ink-muted"
                    )}
                  >
                    {isDone ? <Check className="size-3.5" strokeWidth={3} /> : s.n}
                  </span>
                  <span className="relative hidden lg:block">
                    <span
                      className={cn(
                        "block text-sm font-medium",
                        isActive ? "text-ink" : isDone ? "text-ink-secondary" : "text-ink-muted"
                      )}
                    >
                      {s.title}
                    </span>
                    <span className="block text-xs text-ink-faint">{s.blurb}</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-xs text-ink-muted lg:hidden">
          Step {step} of 5 — {steps[step - 1]!.title}
        </p>
      </aside>

      {/* Step content */}
      <div className="relative flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-10 sm:px-8 lg:py-16">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="flex-1"
            >
              {step === 1 && (
                <StepCompany state={state} update={update} showErrors={touched} />
              )}
              {step === 2 && (
                <StepGoals state={state} update={update} showErrors={touched} />
              )}
              {step === 3 && (
                <StepSources
                  state={state}
                  update={update}
                  showErrors={touched}
                  integrations={integrations}
                />
              )}
              {step === 4 && <StepAlerts state={state} update={update} />}
              {step === 5 && (
                <StepGenerate
                  state={state}
                  onDone={() => {
                    persistOnboardingState({ ...state, completed: true });
                    router.push("/overview");
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {step < 5 ? (
            <div className="mt-10 flex items-center justify-between border-t border-edge pt-6">
              <Button
                variant="ghost"
                onClick={goBack}
                disabled={step === 1}
                className={cn(step === 1 && "invisible")}
              >
                <ArrowLeft aria-hidden />
                Back
              </Button>
              <Button onClick={goNext}>
                {step === 4 ? "Generate my space" : "Continue"}
                <ArrowRight aria-hidden />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── Step 1 — Company ──────────────────────────────────────────── */

function StepCompany({
  state,
  update,
  showErrors,
}: {
  state: OnboardingState;
  update: (p: Partial<OnboardingState>) => void;
  showErrors: boolean;
}) {
  const c = state.company;
  const set = (patch: Partial<OnboardingState["company"]>) =>
    update({ company: { ...c, ...patch } });

  return (
    <div>
      <StepHeading
        icon={<Building2 className="size-5" aria-hidden />}
        title="Tell us about your company"
        blurb="This shapes the defaults — nothing here is permanent."
      />
      <div className="mt-8 space-y-5">
        <Field
          label="Company name"
          htmlFor="company-name"
          error={
            showErrors && c.name.trim().length < 2
              ? "Give your workspace a company name."
              : undefined
          }
        >
          <Input
            id="company-name"
            placeholder="Northwind Systems"
            value={c.name}
            onChange={(e) => set({ name: e.target.value })}
          />
        </Field>
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-secondary">
            Company size
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {["1–10", "11–50", "51–200", "200+"].map((size) => (
              <SelectableCard
                key={size}
                compact
                selected={c.size === size}
                onSelect={() => set({ size })}
                title={size}
                description="people"
              />
            ))}
          </div>
          {showErrors && !c.size ? (
            <p className="mt-2 text-[13px] text-critical" role="alert">
              Pick a team size.
            </p>
          ) : null}
        </div>
        <Field
          label="Industry"
          htmlFor="industry"
          error={
            showErrors && !c.industry ? "Choose the closest match." : undefined
          }
        >
          <Select
            value={c.industry || undefined}
            onValueChange={(v) => set({ industry: v })}
          >
            <SelectTrigger id="industry" aria-label="Industry">
              <SelectValue placeholder="Choose the closest match" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Software & SaaS",
                "E-commerce & retail",
                "Financial services",
                "Logistics & supply chain",
                "Healthcare",
                "Media & entertainment",
                "Other",
              ].map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

/* ── Step 2 — Goals ────────────────────────────────────────────── */

function StepGoals({
  state,
  update,
  showErrors,
}: {
  state: OnboardingState;
  update: (p: Partial<OnboardingState>) => void;
  showErrors: boolean;
}) {
  const toggle = (id: string) =>
    update({
      goals: state.goals.includes(id)
        ? state.goals.filter((g) => g !== id)
        : [...state.goals, id],
    });

  return (
    <div>
      <StepHeading
        icon={<Radar className="size-5" aria-hidden />}
        title="What should Halo watch for first?"
        blurb="Pick as many as apply — they prioritize your first signals."
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {goalOptions.map((g) => (
          <SelectableCard
            key={g.id}
            selected={state.goals.includes(g.id)}
            onSelect={() => toggle(g.id)}
            title={g.title}
            description={g.description}
            icon={<g.icon className="size-4" aria-hidden />}
          />
        ))}
      </div>
      {showErrors && state.goals.length === 0 ? (
        <p className="mt-3 text-[13px] text-critical" role="alert">
          Select at least one objective.
        </p>
      ) : null}
    </div>
  );
}

/* ── Step 3 — Sources ──────────────────────────────────────────── */

function StepSources({
  state,
  update,
  showErrors,
  integrations,
}: {
  state: OnboardingState;
  update: (p: Partial<OnboardingState>) => void;
  showErrors: boolean;
  integrations: ReturnType<typeof getIntegrations>;
}) {
  const toggle = (id: string) =>
    update({
      sources: state.sources.includes(id)
        ? state.sources.filter((s) => s !== id)
        : [...state.sources, id],
    });

  return (
    <div>
      <StepHeading
        icon={<Zap className="size-5" aria-hidden />}
        title="Connect your data sources"
        blurb="Demo connections — they stream realistic sample events instantly."
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <SelectableCard
            key={integration.id}
            compact
            selected={state.sources.includes(integration.id)}
            onSelect={() => toggle(integration.id)}
            title={integration.name}
            description={integration.category}
          />
        ))}
      </div>
      <p className="mt-4 text-[13px] text-ink-muted">
        {state.sources.length} selected · you can add more at any time in
        Settings → Integrations.
      </p>
      {showErrors && state.sources.length === 0 ? (
        <p className="mt-2 text-[13px] text-critical" role="alert">
          Connect at least one source so Halo has something to watch.
        </p>
      ) : null}
    </div>
  );
}

/* ── Step 4 — Alerts ───────────────────────────────────────────── */

function StepAlerts({
  state,
  update,
}: {
  state: OnboardingState;
  update: (p: Partial<OnboardingState>) => void;
}) {
  const a = state.alerts;
  const set = (patch: Partial<OnboardingState["alerts"]>) =>
    update({ alerts: { ...a, ...patch } });

  return (
    <div>
      <StepHeading
        icon={<Bell className="size-5" aria-hidden />}
        title="Set your alert policy"
        blurb="Halo is calm by default — you choose when it raises its voice."
      />
      <div className="mt-8 space-y-7">
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-secondary">
            Critical signals go to
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {(
              [
                { id: "slack", label: "Slack" },
                { id: "email", label: "Email" },
                { id: "both", label: "Both" },
              ] as const
            ).map((opt) => (
              <SelectableCard
                key={opt.id}
                compact
                selected={a.channel === opt.id}
                onSelect={() => set({ channel: opt.id })}
                title={opt.label}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-secondary">
            Detection sensitivity
          </p>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {(
              [
                { id: "conservative", label: "Conservative", desc: "Only clear deviations. Fewest alerts." },
                { id: "balanced", label: "Balanced", desc: "Recommended for most teams." },
                { id: "eager", label: "Eager", desc: "Early warnings, more noise." },
              ] as const
            ).map((opt) => (
              <SelectableCard
                key={opt.id}
                compact
                selected={a.sensitivity === opt.id}
                onSelect={() => set({ sensitivity: opt.id })}
                title={opt.label}
                description={opt.desc}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-edge bg-raised/40 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink">Digest frequency</p>
              <p className="mt-0.5 text-[13px] text-ink-muted">
                A summary of non-critical activity.
              </p>
            </div>
            <Select
              value={a.digest}
              onValueChange={(v) => set({ digest: v as typeof a.digest })}
            >
              <SelectTrigger className="w-32" aria-label="Digest frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="off">Off</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-edge pt-4">
            <div>
              <p className="text-sm font-medium text-ink">Quiet hours</p>
              <p className="mt-0.5 text-[13px] text-ink-muted">
                Hold non-critical notifications 22:00–07:00 local.
              </p>
            </div>
            <Switch
              checked={a.quietHours}
              onCheckedChange={(v) => set({ quietHours: v })}
              aria-label="Quiet hours"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 5 — Generation ───────────────────────────────────────── */

const buildSteps = [
  "Provisioning your workspace",
  "Connecting selected sources",
  "Backfilling 28 days of history",
  "Learning baselines from your data",
  "Configuring alert routing",
  "Composing your first executive summary",
];

function StepGenerate({
  state,
  onDone,
}: {
  state: OnboardingState;
  onDone: () => void;
}) {
  const reduced = useReducedMotion();
  const [progress, setProgress] = React.useState(reduced ? buildSteps.length : 0);

  React.useEffect(() => {
    if (reduced) return;
    if (progress >= buildSteps.length) return;
    const t = setTimeout(() => setProgress((p) => p + 1), 620);
    return () => clearTimeout(t);
  }, [progress, reduced]);

  const done = progress >= buildSteps.length;
  const company = state.company.name.trim() || "your company";

  return (
    <div className="relative">
      <HaloField x={50} y={0} strength={0.14} />
      <div className="relative">
        <StepHeading
          icon={<Sparkles className="size-5" aria-hidden />}
          title={done ? `${company}'s space is ready` : `Assembling Halo for ${company}`}
          blurb={
            done
              ? "Baselines are live and your first signals are waiting."
              : "This takes a moment — everything is tailored to your answers."
          }
        />
        <ol className="mt-8 space-y-1.5" aria-live="polite">
          {buildSteps.map((label, i) => {
            const stepDone = i < progress;
            const active = i === progress;
            return (
              <motion.li
                key={label}
                initial={reduced ? false : { opacity: 0.4 }}
                animate={{ opacity: stepDone || active ? 1 : 0.4 }}
                className={cn(
                  "flex items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors",
                  stepDone
                    ? "border-edge bg-raised/40 text-ink-secondary"
                    : active
                      ? "border-halo-500/30 bg-halo-500/[0.06] text-ink"
                      : "border-edge-faint text-ink-muted"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border",
                    stepDone
                      ? "border-halo-500/50 bg-halo-500/20 text-halo-300"
                      : active
                        ? "border-halo-400 text-halo-300"
                        : "border-edge-strong text-transparent"
                  )}
                >
                  {stepDone ? (
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  ) : active ? (
                    <span className="size-1.5 animate-pulse-soft rounded-full bg-halo-400" aria-hidden />
                  ) : null}
                </span>
                {label}
                {i === 2 && stepDone ? (
                  <span className="ml-auto font-mono text-2xs text-ink-muted">
                    {state.sources.length} sources
                  </span>
                ) : null}
              </motion.li>
            );
          })}
        </ol>

        <div className="mt-10 flex justify-end">
          <Button size="lg" onClick={onDone} disabled={!done} loading={!done}>
            {done ? "Enter your dashboard" : "Preparing…"}
            {done ? <ArrowRight aria-hidden /> : null}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── shared heading ────────────────────────────────────────────── */

function StepHeading({
  icon,
  title,
  blurb,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
}) {
  return (
    <div>
      <div className="flex size-10 items-center justify-center rounded-md border border-halo-500/30 bg-halo-500/10 text-halo-300">
        {icon}
      </div>
      <h1 className="text-display mt-5 text-2xl text-ink sm:text-3xl">{title}</h1>
      <p className="mt-2 text-[15px] text-ink-secondary">{blurb}</p>
    </div>
  );
}
