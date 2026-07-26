import { Avatar } from "@/components/ui/avatar";
import { Reveal } from "@/components/halo/reveal";
import { HaloField } from "@/components/halo/halo-field";

/**
 * Editorial testimonial layout: one anchor quote with supporting
 * voices — no carousel, no star ratings.
 */
export function Testimonials() {
  return (
    <section id="customers" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-label text-halo-300">Customers</p>
          <h2 className="text-display mt-3 text-3xl text-ink sm:text-4xl">
            Teams that stopped hunting for problems
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Reveal>
            <figure className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-edge-strong bg-surface p-8 sm:p-10">
              <HaloField x={15} y={85} strength={0.08} tone="ember" />
              <blockquote className="relative">
                <p className="text-xl leading-relaxed tracking-tight text-ink sm:text-2xl">
                  “We replaced a Monday-morning ritual of eleven dashboards
                  with one Halo review. The week the refund watcher caught a
                  double-billing bug before finance did, the debate about
                  tooling ended.”
                </p>
              </blockquote>
              <figcaption className="relative mt-8 flex items-center gap-3.5">
                <Avatar name="Claire Fontaine" size="lg" />
                <div>
                  <p className="text-sm font-medium text-ink">Claire Fontaine</p>
                  <p className="text-[13px] text-ink-muted">
                    VP Operations, Atlas Freight
                  </p>
                </div>
                <p className="tabular ml-auto hidden text-right text-[13px] leading-snug text-ink-muted sm:block">
                  <span className="text-lg font-medium text-ember-300">−41%</span>
                  <br />
                  time in status meetings
                </p>
              </figcaption>
            </figure>
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal delay={0.08}>
              <figure className="rounded-xl border border-edge bg-surface/70 p-6">
                <blockquote>
                  <p className="text-[15px] leading-relaxed text-ink-secondary">
                    “The anomaly explanations are the feature. My analysts
                    ship the ‘why’ with the ‘what’ now, and executives
                    stopped asking for screenshots.”
                  </p>
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar name="Daniel Osei" size="sm" />
                  <div>
                    <p className="text-[13px] font-medium text-ink">Daniel Osei</p>
                    <p className="text-xs text-ink-muted">
                      Head of Data, Veltrix
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
            <Reveal delay={0.16}>
              <figure className="rounded-xl border border-edge bg-surface/70 p-6">
                <blockquote>
                  <p className="text-[15px] leading-relaxed text-ink-secondary">
                    “Onboarding took an afternoon. Two weeks in, Halo flagged
                    an expiring SSO certificate eleven days out. That single
                    catch paid for the year.”
                  </p>
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar name="Mireille Laurent" size="sm" />
                  <div>
                    <p className="text-[13px] font-medium text-ink">
                      Mireille Laurent
                    </p>
                    <p className="text-xs text-ink-muted">
                      CTO, Kestrel & Co
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
