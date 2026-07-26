import {
  BellRing,
  FileText,
  GitBranch,
  Lock,
  Radar,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/halo/reveal";
import { HaloField } from "@/components/halo/halo-field";
import { getMetrics, getTrends } from "@/lib/data";

/**
 * Editorial feature section: one wide composition, two split rows,
 * then a compact trio — deliberately not six identical cards.
 */
export function Features() {
  const metrics = getMetrics();
  const trends = getTrends();

  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-label text-halo-300">Why Halo</p>
          <h2 className="text-display mt-3 text-3xl text-ink sm:text-4xl">
            Built for the space between dashboards and decisions
          </h2>
        </Reveal>

        {/* Wide composition */}
        <Reveal delay={0.08} className="mt-12">
          <div className="relative overflow-hidden rounded-xl border border-edge-strong bg-surface">
            <HaloField x={78} y={22} strength={0.1} />
            <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="flex size-10 items-center justify-center rounded-md border border-halo-500/30 bg-halo-500/10">
                  <Radar className="size-5 text-halo-300" aria-hidden />
                </div>
                <h3 className="text-title mt-5 text-xl text-ink sm:text-2xl">
                  One operational picture, not twelve tabs
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-secondary">
                  Halo listens to the systems you already run — payments,
                  support, monitoring, pipeline, warehouse — and merges their
                  noise into a single stream of deduplicated signals with an
                  owner and a deadline.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-ink-secondary">
                  {[
                    "12 native source integrations",
                    "Signals deduplicated across systems",
                    "Automatic routing to the right owner",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span aria-hidden className="size-1 rounded-full bg-halo-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {trends.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg border border-edge bg-raised/70 p-4"
                  >
                    <p className="text-2xs text-ink-muted">{t.title}</p>
                    <p className="tabular mt-1.5 text-sm font-medium text-ink">
                      {t.change}
                    </p>
                    <p
                      className={
                        t.tone === "positive"
                          ? "mt-1 text-2xs text-positive"
                          : t.tone === "negative"
                            ? "mt-1 text-2xs text-critical"
                            : "mt-1 text-2xs text-ink-muted"
                      }
                    >
                      {t.tone === "positive"
                        ? "improving"
                        : t.tone === "negative"
                          ? "needs attention"
                          : "stable"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Split row */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Reveal delay={0.05}>
            <div className="flex h-full flex-col rounded-xl border border-edge bg-surface p-6 sm:p-8">
              <div className="flex size-10 items-center justify-center rounded-md border border-edge-strong bg-raised">
                <TrendingUp className="size-5 text-ink-secondary" aria-hidden />
              </div>
              <h3 className="text-title mt-5 text-lg text-ink">
                Anomalies that explain themselves
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-secondary">
                Every deviation ships with its baseline, the suspected cause
                and a recommended next step. Your Tuesday review starts at
                “what do we do”, not “what is this”.
              </p>
              <div className="mt-6 rounded-md border border-edge bg-void/30 p-4 font-mono text-xs leading-relaxed text-ink-muted">
                <span className="text-critical">▲ 3.4σ</span> payment_auth_error_rate
                <br />
                <span className="text-ink-faint">cause:</span> gateway v2.61 deploy, EU pool
                <br />
                <span className="text-ink-faint">next:</span>{" "}
                <span className="text-halo-300">compare pods 2h → rollback or fix</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="flex h-full flex-col rounded-xl border border-edge bg-surface p-6 sm:p-8">
              <div className="flex size-10 items-center justify-center rounded-md border border-edge-strong bg-raised">
                <GitBranch className="size-5 text-ink-secondary" aria-hidden />
              </div>
              <h3 className="text-title mt-5 text-lg text-ink">
                Response work that runs itself
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-secondary">
                Escalation, assignment, retries, digests — the operational
                reflexes your team repeats every week become audited
                automations with success rates.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Badge variant="halo">{metrics.automationsEnabled} active</Badge>
                <Badge variant="positive">
                  {metrics.automationSuccessRate}% success
                </Badge>
                <Badge variant="neutral">
                  {metrics.automationRunsThisWeek.toLocaleString("en-US")} runs this week
                </Badge>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Compact trio */}
        <RevealGroup className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: BellRing,
              title: "Alerts with judgement",
              body: "Thresholds adapt to weekday rhythm and seasonality, so 3 a.m. pages are for real incidents.",
            },
            {
              icon: FileText,
              title: "Reports that write themselves",
              body: "Weekly reviews and quarterly risk assessments compile from live data — with your commentary, not instead of it.",
            },
            {
              icon: Lock,
              title: "Access that matches your org",
              body: "Roles, invitations and audit trails included. SSO and SCIM on the Scale plan.",
            },
          ].map((f) => (
            <RevealItem key={f.title}>
              <div className="h-full rounded-xl border border-edge bg-surface/60 p-6">
                <f.icon className="size-5 text-ink-muted" aria-hidden />
                <h3 className="text-title mt-4 text-[15px] text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {f.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
