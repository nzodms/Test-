import type { Metadata } from "next";

import { brand } from "@/config/brand";
import {
  DocDefinitions,
  DocHead,
  DocMail,
  DocNote,
  DocSection,
  DocSummary,
} from "../document";

/* ────────────────────────────────────────────────────────────────
   Strings local to this document.
   ──────────────────────────────────────────────────────────────── */

const text = {
  kind: "Policy",
  title: "Takedown policy",
  lead: `A removal request is a formal statement made in your name. This document sets out who can make one through ${brand.name}, what has to be true before it is sent, what happens after, and what cannot be promised.`,
  updated: "Last revised 2026-07-01",
  demoNote: `${brand.name} is a demonstration product. This document illustrates the structure and specificity of a real takedown policy for a content-protection service; it is not legal advice and creates no obligations.`,
  contact: `takedowns@${brand.domain}`,
} as const;

/** The five states printed on every case in the workspace. */
const states = [
  {
    term: "Drafted",
    definition:
      "The request has been prepared from a confirmed finding and is waiting for your review. Nothing has been sent.",
  },
  {
    term: "Submitted",
    definition:
      "Delivered to the host or its designated agent, with a record of the address, the time and the evidence attached.",
  },
  {
    term: "Acknowledged",
    definition:
      "The recipient has confirmed receipt or opened a case. The material is still up; the clock is running.",
  },
  {
    term: "Removed",
    definition:
      "The address no longer serves the material, confirmed by re-checking the source — not by the recipient saying so.",
  },
  {
    term: "Rejected",
    definition:
      "The request was refused, or a counter-notice was filed. The stated reason is recorded on the case.",
  },
] as const;

export const metadata: Metadata = {
  title: text.title,
  description: `How removal requests work in ${brand.name}: who may request one, the evidence required, the five case states, expected timelines, recurrence handling and escalation.`,
};

export default function TakedownPolicyPage() {
  return (
    <>
      <DocHead
        kind={text.kind}
        title={text.title}
        lead={text.lead}
        updated={text.updated}
      />

      <DocSummary>
        <p>
          Requests are sent only for confirmed findings, and only by a verified
          owner or a representative that owner has authorized.
        </p>
        <p>
          Every request moves through the same five states you see in the
          workspace, and removal is verified by re-checking the source rather
          than taken on trust.
        </p>
        <p>
          If the same material resurfaces, it is linked to the original case and
          escalated rather than started again from zero.
        </p>
      </DocSummary>

      <DocNote>{text.demoNote}</DocNote>

      <DocSection index={1} title="Who can request a removal">
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
      </DocSection>

      <DocSection index={2} title="What a request has to contain">
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
      </DocSection>

      <DocSection index={3} title="How a request is prepared and sent">
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
        <p>Every case then sits in one of five states:</p>
        <DocDefinitions items={states} />
      </DocSection>


      <DocSection index={4} title="Timelines">
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
      </DocSection>

      <DocSection index={5} title="Recurrence">
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
      </DocSection>

      <DocSection index={6} title="Counter-notices">
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
      </DocSection>

      <DocSection index={7} title="Escalation">
        <p>
          Where a host does not act, the case moves outward in order: the site
          operator, then the hosting provider, then the domain registrar, then
          payment or advertising intermediaries where they are involved, then
          search de-indexing so the copy stops being findable. Each step is
          recorded on the case.
        </p>
      </DocSection>

      <DocSection index={8} title="Mistakes and withdrawal">
        <p>
          If a request was sent in error, tell us. A retraction goes to the
          recipient within one business day and the case is closed with the
          correction recorded. The record stays in your history rather than
          disappearing, because a host may ask about it later.
        </p>
      </DocSection>

      <DocSection index={9} title="What cannot be promised">
        <p>
          No service can guarantee removal. Hosts ignore requests, archives keep
          snapshots, and taking a copy down in one place does not take down the
          copies made from it. What {brand.name} can do is find the copies that
          are visible, act on them quickly and consistently, prove what was sent
          and when, and keep watching afterwards.
        </p>
        <p>
          Questions about a request: <DocMail address={text.contact} />.
        </p>
      </DocSection>
    </>
  );
}
