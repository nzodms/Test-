import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { brand } from "@/config/brand";

/* ────────────────────────────────────────────────────────────────
   Strings local to this document.
   ──────────────────────────────────────────────────────────────── */

const text = {
  eyebrow: "Policy",
  title: "Takedown policy",
  lead: `A removal request is a formal statement made in your name. This document sets out who can make one through ${brand.name}, what has to be true before it is sent, what happens after, and what cannot be promised.`,
  updated: "Last updated July 1, 2026",
  summaryLabel: "In short",
  demoNote: `${brand.name} is a demonstration product. This document illustrates the structure and specificity of a real takedown policy for a content-protection service; it is not legal advice and creates no obligations.`,
  statusLabel: "Case states",
  contact: `takedowns@${brand.domain}`,
} as const;

/** Mirrors the five states shown on every case in the workspace. */
const states = [
  {
    key: "drafted",
    label: "Drafted",
    variant: "neutral",
    body: "The request has been prepared from a confirmed finding and is waiting for your review. Nothing has been sent.",
  },
  {
    key: "submitted",
    label: "Submitted",
    variant: "accent",
    body: "Delivered to the host or its designated agent, with a record of the address, the time and the evidence attached.",
  },
  {
    key: "acknowledged",
    label: "Acknowledged",
    variant: "warn",
    body: "The recipient has confirmed receipt or opened a case. The material is still up; the clock is running.",
  },
  {
    key: "removed",
    label: "Removed",
    variant: "ok",
    body: "The address no longer serves the material, confirmed by re-checking the source — not by the recipient saying so.",
  },
  {
    key: "rejected",
    label: "Rejected",
    variant: "crit",
    body: "The request was refused, or a counter-notice was filed. The stated reason is recorded on the case.",
  },
] as const;

export const metadata: Metadata = {
  title: text.title,
  description: `How removal requests work in ${brand.name}: who may request one, the evidence required, the five case states, expected timelines, recurrence handling and escalation.`,
};

/* ────────────────────────────────────────────────────────────────
   Local document primitives.
   ──────────────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-title text-lg text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}

export default function TakedownPolicyPage() {
  return (
    <article>
      <header>
        <p className="text-label">{text.eyebrow}</p>
        <h1 className="text-display mt-3 text-3xl text-ink">{text.title}</h1>
        <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
          {text.lead}
        </p>
        <p className="text-data mt-6 text-ink-soft">{text.updated}</p>
      </header>

      <div className="surface-mineral mt-8 rounded-md p-5">
        <p className="text-label">{text.summaryLabel}</p>
        <div className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink">
          <p>
            Requests are sent only for confirmed findings, and only by a
            verified owner or a representative that owner has authorized.
          </p>
          <p>
            Every request moves through the same five states you see in the
            workspace, and removal is verified by re-checking the source rather
            than taken on trust.
          </p>
          <p>
            If the same material resurfaces, it is linked to the original case
            and escalated rather than started again from zero.
          </p>
        </div>
      </div>

      <p className="mt-6 border-l-2 border-edge-strong pl-4 text-[13px] leading-relaxed text-ink-soft">
        {text.demoNote}
      </p>

      <div className="mt-10 h-px w-full bg-edge" />

      <Section title="Who can request a removal">
        <p>
          Only the verified owner of the profile the material belongs to, or a
          representative that owner has named in the workspace under a written
          mandate. Verification must be complete before a request can be
          drafted; there is no path that sends a request on behalf of an
          unverified account.
        </p>
        <p>
          An agency acting for a creator must be able to produce that mandate on
          request. When a mandate ends, any pending request prepared under it
          stops with it.
        </p>
      </Section>

      <Section title="What a request has to contain">
        <p>
          A finding must be in the confirmed state — reviewed by you, not by an
          automated grade alone. The request then carries the address of the
          material, identification of the work it copies, the ownership
          verification already on file, a statement made in good faith that the
          use is not authorized, and your signature.
        </p>
        <p>
          A request that misstates ownership can carry liability for the person
          who made it under the host&apos;s process and under applicable law.{" "}
          {brand.name} will not send a request for a finding you have not
          confirmed.
        </p>
      </Section>

      <Section title="How a request is prepared and sent">
        <p>
          The draft is assembled from the confirmed finding with the evidence
          attached, in the form the recipient expects. You read it before it
          leaves. It is then sent to the host&apos;s designated agent where one
          is published, or to the operator of the source, and logged with the
          time it went out.
        </p>
        <p>
          Where the problem is a search listing rather than the page itself, a
          de-indexing request is filed separately and tracked as its own case
          against the same finding.
        </p>
      </Section>

      <div className="mt-10 surface-paper rounded-lg p-5 sm:p-6">
        <h2 className="text-label">{text.statusLabel}</h2>
        <ul className="mt-4 space-y-4">
          {states.map((state) => (
            <li key={state.key} className="flex flex-wrap items-baseline gap-3">
              <Badge variant={state.variant}>{state.label}</Badge>
              <span className="min-w-0 flex-1 text-[14px] leading-relaxed text-ink-soft">
                {state.body}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Section title="Timelines">
        <p>
          A request is drafted within one business day of a finding being
          confirmed. Most hosts acknowledge within two to five business days,
          and compliant hosts remove within three to fourteen days. Registrars,
          archives and operators in less cooperative jurisdictions take longer,
          and some never answer.
        </p>
        <p>
          A submitted case is re-checked daily until the material is gone, then
          weekly for 90 days. A case with no response after ten business days
          moves to escalation automatically.
        </p>
      </Section>

      <Section title="Recurrence">
        <p>
          If the same material reappears — at the same address, on a mirror, or
          on a different source entirely — it is linked to the original case
          rather than opened as a new one, so the history stays in one place and
          the pattern stays visible.
        </p>
        <p>
          Repeat offenders escalate faster: the second recurrence on a source
          goes to the hosting provider rather than the site, and recurrence
          counts feed the exposure level shown in the workspace.
        </p>
      </Section>

      <Section title="Counter-notices">
        <p>
          A recipient may pass on a counter-notice from whoever uploaded the
          material. The case then moves to rejected with the reason recorded,
          and the host may restore the material after the statutory waiting
          period — commonly ten to fourteen business days in the United States.
        </p>
        <p>
          {brand.name} shows you the counter-notice and what your options are.
          It does not file court proceedings, does not give legal advice, and
          does not decide the dispute. Taking a matter further is your decision,
          with your own counsel.
        </p>
      </Section>

      <Section title="Escalation">
        <p>
          Where a host does not act, the case moves outward in order: the site
          operator, then the hosting provider, then the domain registrar, then
          payment or advertising intermediaries where they are involved, then
          search de-indexing so the copy stops being findable. Each step is
          recorded on the case.
        </p>
      </Section>

      <Section title="Mistakes and withdrawal">
        <p>
          If a request was sent in error, tell us. A retraction goes to the
          recipient within one business day and the case is closed with the
          correction recorded. The record stays in your history rather than
          disappearing, because a host may ask about it later.
        </p>
      </Section>

      <Section title="What cannot be promised">
        <p>
          No service can guarantee removal. Hosts ignore requests, archives keep
          snapshots, and taking a copy down in one place does not take down the
          copies made from it. What {brand.name} can do is find the copies that
          are visible, act on them quickly and consistently, prove what was sent
          and when, and keep watching afterwards.
        </p>
        <p>
          Questions about a request:{" "}
          <a
            href={`mailto:${text.contact}`}
            className="text-data text-accent underline-offset-4 hover:underline"
          >
            {text.contact}
          </a>
          .
        </p>
      </Section>
    </article>
  );
}
