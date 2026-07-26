import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HaloField } from "@/components/halo/halo-field";
import { Reveal } from "@/components/halo/reveal";
import { Hero } from "@/components/marketing/hero";
import { TrustBand } from "@/components/marketing/trust-band";
import { ProductDemo } from "@/components/marketing/product-demo";
import { Features } from "@/components/marketing/features";
import { WorkflowSection } from "@/components/marketing/workflow";
import { Testimonials } from "@/components/marketing/testimonials";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustBand />
      <ProductDemo />
      <Features />
      <WorkflowSection />
      <Testimonials />
      <Pricing />
      <Faq />

      {/* Final call to action */}
      <section className="relative overflow-hidden border-t border-edge py-20 sm:py-28">
        <HaloField x={50} y={110} strength={0.14} />
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="text-display text-3xl text-ink sm:text-4xl">
              Your systems are already talking.
              <br />
              Start listening this afternoon.
            </h2>
            <p className="mt-4 text-base text-ink-secondary">
              Connect two sources, set one alert policy, and see your first
              signals before the day ends.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/signup">
                  Create your workspace
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link href="/#pricing">See pricing</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
