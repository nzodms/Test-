import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Halo collects, uses and protects your data.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 pt-32 pb-20 sm:px-6">
      <p className="text-label text-halo-300">Legal</p>
      <h1 className="text-display mt-3 text-3xl text-ink">Privacy Policy</h1>
      <p className="mt-2 text-[13px] text-ink-muted">Last updated July 1, 2026</p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink-secondary">
        <section>
          <h2 className="text-title mb-2.5 text-lg text-ink">What we collect</h2>
          <p>
            Halo processes the operational events you choose to connect —
            metrics, tickets, deploys, transactions — together with account
            information such as your name, email address and workspace
            membership. We collect nothing from your systems beyond the
            scopes you grant each integration.
          </p>
        </section>
        <section>
          <h2 className="text-title mb-2.5 text-lg text-ink">How we use it</h2>
          <p>
            Connected data is used solely to compute baselines, detect
            signals and produce the reports your workspace requests. We do
            not sell data, use it for advertising, or train shared models on
            your private events.
          </p>
        </section>
        <section>
          <h2 className="text-title mb-2.5 text-lg text-ink">Retention and deletion</h2>
          <p>
            Event history is retained according to your plan tier and can be
            exported at any time. Deleting a workspace permanently removes
            its data within 30 days; account deletion follows the same
            window.
          </p>
        </section>
        <section>
          <h2 className="text-title mb-2.5 text-lg text-ink">Contact</h2>
          <p>
            Questions about this policy can be sent to privacy@halo.example.
            This is a demonstration product; this document illustrates the
            structure of a real policy.
          </p>
        </section>
      </div>
    </article>
  );
}
