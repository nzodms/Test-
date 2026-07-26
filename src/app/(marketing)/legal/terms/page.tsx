import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of Halo.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 pt-32 pb-20 sm:px-6">
      <p className="text-label text-halo-300">Legal</p>
      <h1 className="text-display mt-3 text-3xl text-ink">Terms of Service</h1>
      <p className="mt-2 text-[13px] text-ink-muted">Last updated July 1, 2026</p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink-secondary">
        <section>
          <h2 className="text-title mb-2.5 text-lg text-ink">The service</h2>
          <p>
            Halo provides operational intelligence software: signal
            detection, analysis and automation over the systems you connect.
            You retain all rights to your data; we operate it only to
            provide the service.
          </p>
        </section>
        <section>
          <h2 className="text-title mb-2.5 text-lg text-ink">Your responsibilities</h2>
          <p>
            You are responsible for the accounts you invite, the scopes you
            grant to integrations, and ensuring automations you enable are
            appropriate for your environment. Approval steps are available
            for any automation that takes external action.
          </p>
        </section>
        <section>
          <h2 className="text-title mb-2.5 text-lg text-ink">Availability and support</h2>
          <p>
            We target 99.9% availability on the Scale plan with service
            credits as the remedy. Lower tiers receive the same platform
            without contractual SLA. Support response targets are listed on
            the pricing page.
          </p>
        </section>
        <section>
          <h2 className="text-title mb-2.5 text-lg text-ink">Termination</h2>
          <p>
            You may cancel at any time; access continues to the end of the
            billing period and your data remains exportable for 30 days
            after. This is a demonstration product; this document
            illustrates the structure of real terms.
          </p>
        </section>
      </div>
    </article>
  );
}
