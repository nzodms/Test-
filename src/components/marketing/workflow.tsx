import { Radar, Brain, Zap, BarChart3 } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/halo/reveal";

const steps = [
  {
    icon: Radar,
    name: "Detect",
    body: "Connected systems stream events into Halo. Deviations from learned baselines become signals within minutes — not at month end.",
    detail: "38 min median time-to-detection",
  },
  {
    icon: Brain,
    name: "Understand",
    body: "Each signal carries its evidence: the metric, the baseline, the suspected cause and everything correlated with it.",
    detail: "Explanations on 100% of anomalies",
  },
  {
    icon: Zap,
    name: "Act",
    body: "Route to an owner, trigger an automation, or open a war room. The next step is one click, never a meeting.",
    detail: "78% of responses automated",
  },
  {
    icon: BarChart3,
    name: "Measure",
    body: "Response times, resolution quality and automation ROI feed weekly reports — so the loop tightens every cycle.",
    detail: "−18% response time this month",
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="scroll-mt-24 border-t border-edge bg-void/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-label text-halo-300">Workflow</p>
          <h2 className="text-display mt-3 text-3xl text-ink sm:text-4xl">
            A loop, not a dashboard
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            Halo is built around the operating rhythm every strong team
            already has — it just removes the waiting between the steps.
          </p>
        </Reveal>

        <RevealGroup className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line on large screens */}
          <div
            aria-hidden
            className="edge-fade-x absolute left-0 right-0 top-5 hidden h-px lg:block"
          />
          {steps.map((step, i) => (
            <RevealItem key={step.name}>
              <div className="relative">
                <div className="relative inline-flex size-10 items-center justify-center rounded-md border border-halo-500/30 bg-base">
                  <step.icon className="size-4.5 text-halo-300" aria-hidden />
                </div>
                <p className="mt-5 flex items-baseline gap-2.5">
                  <span className="font-mono text-2xs text-ink-faint">
                    0{i + 1}
                  </span>
                  <span className="text-title text-lg text-ink">{step.name}</span>
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-secondary">
                  {step.body}
                </p>
                <p className="tabular mt-4 text-[13px] text-halo-300">
                  {step.detail}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
