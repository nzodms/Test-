"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/halo/reveal";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Which systems can Halo connect to?",
    a: "Twelve native integrations ship today — including Stripe, Datadog, Salesforce, Zendesk, GitHub and Snowflake — plus a webhook source for anything custom. Connecting a source takes a few minutes and starts producing baselines within 24 hours.",
  },
  {
    q: "How is a “signal” different from an alert?",
    a: "An alert says a threshold was crossed. A signal is deduplicated across systems, carries its evidence and baseline, gets an owner and a status, and closes with a resolution. One incident that pages five tools becomes one signal in Halo.",
  },
  {
    q: "Do automations act without approval?",
    a: "Only where you allow it. Every automation can require an approval step, and each run is logged with its trigger, duration and outcome so you can audit exactly what happened and why.",
  },
  {
    q: "How long does onboarding take?",
    a: "Most teams connect their first two sources and set alert policies in under an hour. Baselines mature over the first week; anomaly detection quality improves as history accumulates.",
  },
  {
    q: "Where does our data live, and can we leave?",
    a: "Data is encrypted in transit and at rest, stored in the region you choose on the Scale plan. Every tier can export signals, reports and audit history at any time — leaving is a button, not a negotiation.",
  },
  {
    q: "What happens when we exceed plan limits?",
    a: "Nothing breaks. Halo keeps detecting and simply queues signals above your monthly quota; you'll see a clear banner and can upgrade when you decide it's worth it.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const reduced = useReducedMotion();

  return (
    <section id="faq" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal className="text-center">
          <p className="text-label text-halo-300">FAQ</p>
          <h2 className="text-display mt-3 text-3xl text-ink sm:text-4xl">
            Answers before the sales call
          </h2>
        </Reveal>

        <div className="mt-10 divide-y divide-edge rounded-xl border border-edge bg-surface/50">
          {faqs.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-7"
                >
                  <span className="text-[15px] font-medium text-ink">
                    {item.q}
                  </span>
                  <Plus
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0 text-ink-muted transition-transform duration-300",
                      open && "rotate-45 text-halo-300"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduced ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-6 text-sm leading-relaxed text-ink-secondary sm:px-7">
                        {item.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
