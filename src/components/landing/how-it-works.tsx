import { brand } from "@/config/brand";

/* ────────────────────────────────────────────────────────────────
   What happens after a match.

   Composition: one rule laid across the section with the five stages
   hanging off it as ticks. It is a sequence, so it is drawn as one —
   not as five bordered boxes, and not as alternating text and image.
   On a phone the same rule stands up and the stages hang off its
   left edge instead.
   ──────────────────────────────────────────────────────────────── */

const STAGES = [
  {
    stamp: "Detection",
    detail:
      "A match is found on an indexed public source, graded for confidence, and filed against the profile it belongs to.",
  },
  {
    stamp: "Review",
    detail:
      "You confirm whether the match is your content. One decision, recorded with its timestamp.",
  },
  {
    stamp: "Verification",
    detail:
      "Ownership is verified once. Exact sources, evidence and removal actions open from that point on.",
  },
  {
    stamp: "Removal",
    detail:
      "A request is prepared with its evidence attached, then tracked to an outcome rather than assumed.",
  },
  {
    stamp: "Monitoring",
    detail:
      "The source stays under observation. Content that reappears is filed against the original case.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-[1240px] scroll-mt-20 px-5 pb-24 pt-16 sm:px-8 sm:pb-28"
    >
      <h2 className="text-display max-w-[18ch] text-[30px] text-ink sm:text-[34px]">
        What happens after a match
      </h2>

      <ol
        aria-label="Process stages"
        className="mt-12 grid gap-y-9 border-l border-edge-strong pl-6 sm:mt-14 sm:grid-cols-3 sm:gap-x-10 sm:gap-y-11 sm:border-l-0 sm:border-t sm:border-t-edge-strong sm:pl-0 lg:grid-cols-5 lg:gap-x-8"
      >
        {STAGES.map((stage, i) => (
          <li key={stage.stamp} className="relative sm:pt-6">
            <span
              aria-hidden
              className="absolute -left-6 top-2.5 h-px w-3.5 bg-edge-strong sm:left-0 sm:top-0 sm:h-3.5 sm:w-px"
            />
            <p className="font-mono text-[12.5px] tabular text-ink-soft">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="text-subject mt-2 text-[17px] text-ink">
              {stage.stamp}
            </h3>
            <p className="mt-2 max-w-[42ch] text-[14.5px] leading-relaxed text-ink-soft">
              {stage.detail}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-14 max-w-[60ch] border-l-2 border-edge-strong pl-5 text-[15px] leading-relaxed text-graphite">
        {brand.name} reads indexed public sources only. It never accesses
        private or paid content, and ownership verification is required before
        an exact source is shown to anyone.
      </p>
    </section>
  );
}
