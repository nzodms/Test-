"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/halo/reveal";
import { HaloField } from "@/components/halo/halo-field";
import { plans, planComparison } from "@/lib/data/plans";
import { cn } from "@/lib/utils";

export function Pricing() {
  const [annual, setAnnual] = React.useState(true);

  return (
    <section id="pricing" className="scroll-mt-24 border-t border-edge bg-void/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-label text-halo-300">Pricing</p>
          <h2 className="text-display mt-3 text-3xl text-ink sm:text-4xl">
            Priced for teams, not line items
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            Per seat, per month. Change plans or cancel any time — your data
            stays exportable on every tier.
          </p>

          <div
            role="group"
            aria-label="Billing period"
            className="mt-8 inline-flex items-center gap-0.5 rounded-full border border-edge bg-raised/60 p-1"
          >
            {(
              [
                { key: false, label: "Monthly" },
                { key: true, label: "Annual" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.label}
                type="button"
                aria-pressed={annual === opt.key}
                onClick={() => setAnnual(opt.key)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] transition-colors",
                  annual === opt.key
                    ? "bg-lifted text-ink shadow-[inset_0_1px_0_rgb(233_237_245/0.06)]"
                    : "text-ink-muted hover:text-ink-secondary"
                )}
              >
                {opt.label}
                {opt.key ? (
                  <span className="ml-1.5 text-halo-300">−20%</span>
                ) : null}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.07}>
              <div
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-xl border p-7",
                  plan.highlight
                    ? "border-halo-500/40 bg-surface shadow-[0_0_0_1px_rgb(94_207_227/0.15),0_24px_64px_-24px_rgb(94_207_227/0.2)]"
                    : "border-edge bg-surface/60"
                )}
              >
                {plan.highlight ? (
                  <>
                    <HaloField x={70} y={0} strength={0.12} />
                    <Badge
                      variant="halo"
                      className="absolute right-5 top-5"
                    >
                      Most teams choose Pro
                    </Badge>
                  </>
                ) : null}
                <h3 className="text-title relative text-lg text-ink">{plan.name}</h3>
                <p className="relative mt-1.5 min-h-10 text-[13px] leading-snug text-ink-muted">
                  {plan.tagline}
                </p>
                <p className="relative mt-5 flex items-baseline gap-1.5">
                  <span className="tabular text-display text-4xl text-ink">
                    ${annual ? plan.annual : plan.monthly}
                  </span>
                  <span className="text-[13px] text-ink-muted">
                    / seat / month
                  </span>
                </p>
                <p className="relative mt-1 h-4 text-2xs text-ink-faint">
                  {plan.monthly > 0
                    ? annual
                      ? "billed annually"
                      : "billed monthly"
                    : "free forever"}
                </p>
                <ul className="relative mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-ink-secondary"
                    >
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 text-halo-400"
                        aria-hidden
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="relative mt-8 pt-2">
                  <Button
                    variant={plan.highlight ? "primary" : "secondary"}
                    className="w-full"
                    asChild
                  >
                    <Link
                      href={
                        plan.id === "scale"
                          ? "/signup?plan=scale"
                          : `/signup?plan=${plan.id}`
                      }
                    >
                      {plan.cta}
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Comparison table */}
        <Reveal delay={0.1} className="mt-16">
          <h3 className="text-title text-center text-lg text-ink">
            Compare plans in detail
          </h3>
          <div className="mt-6 overflow-x-auto scrollbar-quiet rounded-xl border border-edge bg-surface/50">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-edge">
                  <th className="w-2/5 px-5 py-4 text-left text-2xs font-medium uppercase tracking-wider text-ink-muted">
                    Capability
                  </th>
                  {plans.map((p) => (
                    <th
                      key={p.id}
                      className={cn(
                        "px-5 py-4 text-left text-[13px] font-medium",
                        p.highlight ? "text-halo-300" : "text-ink"
                      )}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planComparison.map((group) => (
                  <React.Fragment key={group.group}>
                    <tr className="border-b border-edge-faint bg-void/30">
                      <td
                        colSpan={4}
                        className="px-5 py-2.5 text-2xs font-medium uppercase tracking-wider text-ink-muted"
                      >
                        {group.group}
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.label} className="border-b border-edge-faint last:border-0">
                        <td className="px-5 py-3 text-ink-secondary">{row.label}</td>
                        {row.values.map((v, i) => (
                          <td
                            key={i}
                            className={cn(
                              "px-5 py-3",
                              plans[i]?.highlight ? "text-ink" : "text-ink-secondary"
                            )}
                          >
                            {v === "—" ? (
                              <Minus className="size-3.5 text-ink-faint" aria-label="Not included" />
                            ) : v === "Included" ? (
                              <Check className="size-4 text-halo-400" aria-label="Included" />
                            ) : (
                              v
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
