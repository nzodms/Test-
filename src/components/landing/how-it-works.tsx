import { TimelineMark } from "@/components/file/file-parts";
import { VerificationSeal } from "@/components/file/file-parts";

/**
 * What a file goes through, as the file's own timeline.
 *
 * Not a feature section: the same chronological device the workspace
 * uses, applied to the process itself.
 */
const STAGES = [
  {
    stamp: "Detection",
    title: "A match is found on an indexed public source",
    detail:
      "Graded for confidence and filed against the profile it belongs to.",
  },
  {
    stamp: "Review",
    title: "You confirm whether the match is your content",
    detail: "One decision, recorded in the file with its timestamp.",
  },
  {
    stamp: "Verification",
    title: "Ownership is verified once",
    detail:
      "Exact sources, evidence and removal actions open from that point on.",
  },
  {
    stamp: "Removal",
    title: "A request is prepared with its evidence attached",
    detail: "Its state is tracked to an outcome, not assumed.",
  },
  {
    stamp: "Monitoring",
    title: "The source stays under observation",
    detail: "Content that reappears is filed against the original case.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-[1240px] scroll-mt-20 px-5 pb-24 pt-16 sm:px-8 sm:pb-32"
    >
      <div className="grid gap-12 lg:grid-cols-[152px_minmax(0,1fr)] lg:gap-14">
        <div className="hidden lg:block">
          <p className="border-t border-ink/20 pt-3 font-mono text-[12px] text-ink-faint">
            Process
          </p>
        </div>

        <div className="min-w-0 max-w-[720px]">
          <h2 className="text-display text-[30px] text-ink sm:text-[34px]">
            What a file goes through
          </h2>

          <ol className="mt-10">
            {STAGES.map((s, i) => (
              <TimelineMark
                key={s.stamp}
                stamp={s.stamp}
                title={s.title}
                detail={s.detail}
                last={i === STAGES.length - 1}
              />
            ))}
          </ol>

          <div className="mt-10 border-t border-edge pt-6">
            <VerificationSeal state="required" />
            <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
              Argus reads indexed public sources only. It never accesses
              private or paid content, and detailed findings open to the
              profile owner alone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
