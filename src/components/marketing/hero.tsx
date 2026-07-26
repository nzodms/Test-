import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HaloField } from "@/components/halo/halo-field";
import { Reveal } from "@/components/halo/reveal";
import { HeroPreview } from "./hero-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      {/* Layered depth: vertical falloff + drifting halo field */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_9_14/0.8),transparent_30%,transparent_70%,rgb(7_9_14/0.6))]"
      />
      <HaloField x={58} y={18} strength={0.12} drift className="opacity-90" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-edge-strong bg-raised/60 px-3.5 py-1.5 text-[13px] text-ink-secondary backdrop-blur-sm">
              <span aria-hidden className="size-1.5 rounded-full bg-halo-400" />
              Now monitoring 12 source systems out of the box
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="text-display mt-6 text-4xl text-ink sm:text-5xl md:text-6xl">
              Every signal your company emits.
              <br className="hidden sm:block" />
              <span className="text-ink-secondary"> One calm place to act.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-secondary sm:text-lg">
              Halo connects revenue, support, engineering and data systems,
              detects what deviates, and turns it into decisions your team
              actually takes — before the weekly meeting does.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/signup">
                  Start free
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto">
                <Link href="/login">Explore the live demo</Link>
              </Button>
            </div>
            <p className="mt-3 text-[13px] text-ink-muted">
              Free for 3 members · No card required
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.3} className="mt-14 sm:mt-20">
          <HeroPreview />
        </Reveal>
      </div>
    </section>
  );
}
