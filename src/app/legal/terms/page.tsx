import type { Metadata } from "next";

import { brand } from "@/config/brand";
import { DocHead, DocMail, DocNote, DocSection, DocSummary } from "../document";

/* ────────────────────────────────────────────────────────────────
   Strings local to this document.
   ──────────────────────────────────────────────────────────────── */

const text = {
  kind: "Agreement",
  title: "Terms of service",
  lead: `These terms set out what ${brand.name} does, who is allowed to use it, and what each side is responsible for. They are written to be read, not to be survived.`,
  updated: "Last revised 2026-07-01",
  demoNote: `${brand.name} is a demonstration product. This document illustrates the structure and specificity of real terms of service for a content-protection service; it is not legal advice and creates no obligations.`,
  contact: `legal@${brand.domain}`,
} as const;

export const metadata: Metadata = {
  title: text.title,
  description: `The agreement behind ${brand.name}: what the service does, who may use it, acceptable use, the limits of automated matching, and how accounts end.`,
};

export default function TermsPage() {
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
          {brand.name} finds where your content has been republished on indexed
          public sources, keeps watching those sources, and prepares removal
          requests you approve before they are sent.
        </p>
        <p>
          It is for the owner of a profile and the representatives that owner
          authorizes — not for looking up anyone else&apos;s content.
        </p>
        <p>
          Matching is automated, so it can be wrong. You confirm a finding
          before any request leaves the workspace.
        </p>
      </DocSummary>

      <DocNote>{text.demoNote}</DocNote>

      <DocSection index={1} title="What the service is">
        <p>
          {brand.name} is operated by {brand.company}. It compares public
          profiles you nominate against material found on indexed public
          sources, grades each potential match by confidence, keeps those
          sources under monitoring, and prepares removal requests with the
          evidence a host requires.
        </p>
        <p>
          {brand.name} is a detection and workflow tool. It is not a law firm,
          it does not provide legal advice, and it does not act as your legal
          representative.
        </p>
      </DocSection>

      <DocSection index={2} title="Who may use it">
        <p>
          You must be at least 18 and able to enter a contract. An account may
          be opened by the owner of the profiles being monitored, or by an
          agency acting for those owners under a written mandate the agency can
          produce on request.
        </p>
        <p>
          {brand.name} may not be used to search for, look at, or collect
          content belonging to someone else. Nominating a profile you have no
          relationship with — out of curiosity, to investigate a person, or to
          locate their material — is a breach of these terms and ends the
          account. Full source detail is gated behind ownership verification
          precisely so this is not possible.
        </p>
      </DocSection>

      <DocSection index={3} title="Your account">
        <p>
          Keep your details accurate and your credentials to yourself. You are
          responsible for what happens under your account. Agencies must remove
          a creator from the roster as soon as the mandate ends; access to that
          creator&apos;s findings stops at the same moment.
        </p>
      </DocSection>

      <DocSection index={4} title="Acceptable use">
        <p>
          Do not scrape, resell, or redistribute the output of the service. Do
          not use automated access outside a documented interface. Do not use
          findings to contact, pressure, threaten or expose the person who
          uploaded the material — removal requests go to the host, not to
          individuals.
        </p>
        <p>
          Do not submit a removal request for material you do not own or
          represent. A false statement of ownership is a serious matter under
          most host processes and under applicable law, and the consequences
          fall on the person who made it.
        </p>
      </DocSection>

      <DocSection index={5} title="What happens to detected material">
        <p>
          {brand.name} surfaces the location of pages that are already publicly
          indexed. It does not host, mirror, cache, or redistribute the material
          it detects, and it does not make any detection available to anyone
          other than the verified owner and their authorized representatives.
        </p>
        <p>
          Previews shown in the workspace are abstract placeholders. Where a
          host requires a sample as evidence, it is attached to that specific
          request and nothing else.
        </p>
      </DocSection>

      <DocSection index={6} title="The limits of automated matching">
        <p>
          Matching is automated and imperfect. It produces false positives, and
          it misses copies — particularly where material has been cropped,
          re-encoded, or placed behind a login. A confidence grade is an
          estimate of visual similarity. It is not a legal determination of
          ownership or of infringement.
        </p>
        <p>
          For that reason, you review and confirm a finding before a request is
          prepared. {brand.company} does not warrant that every copy will be
          found, that a finding is accurate, or that any host will act.
        </p>
      </DocSection>

      <DocSection index={7} title="Plans and payment">
        <p>
          Paid plans renew automatically for the period you selected until
          cancelled. Cancellation takes effect at the end of the current period
          and monitoring continues until then. Fees already paid are not
          refunded for partial periods except where the law requires it. Price
          changes are announced at least 30 days before renewal.
        </p>
      </DocSection>

      <DocSection index={8} title="Your rights in your content">
        <p>
          You keep every right you already hold. By adding a profile or
          submitting evidence, you grant {brand.company} a limited, revocable
          licence to process that material for the sole purpose of operating the
          service for you. That licence ends when the data is deleted.
        </p>
      </DocSection>

      <DocSection index={9} title="Suspension and termination">
        <p>
          {brand.company} may suspend or close an account for breach of these
          terms, for non-payment after notice, or where a legal obligation
          requires it. Attempted use of the service against a third
          party&apos;s content results in immediate and permanent closure.
        </p>
        <p>
          You may close your account at any time. Deletion then follows the
          privacy policy. Provisions that are meant to survive — payment owed,
          liability, and the acceptable use rules — survive closure.
        </p>
      </DocSection>

      <DocSection index={10} title="Liability, in plain language">
        <p>
          The service is provided as it is. {brand.company} is responsible for
          running {brand.name} with reasonable care and skill. It is not
          responsible for what third-party websites, hosts, registrars or search
          engines choose to do, for material that stays online after a request,
          or for losses that were not a foreseeable result of a failure on its
          part.
        </p>
        <p>
          Where liability can be limited, it is limited to the fees you paid in
          the twelve months before the claim. Nothing here limits liability that
          the law does not allow to be limited, including for fraud or for death
          or personal injury caused by negligence.
        </p>
      </DocSection>

      <DocSection index={11} title="Changes, law and contact">
        <p>
          Material changes to these terms are announced in the workspace and by
          email at least 14 days before they take effect. Continuing to use{" "}
          {brand.name} after that date means you accept them; if you do not, you
          may close the account and receive a pro-rated refund for the unused
          period.
        </p>
        <p>
          These terms are governed by the laws of the State of Delaware, United
          States, and disputes go to the courts there — except where consumer
          law gives you the right to bring a claim where you live.
        </p>
        <p>
          Questions about this agreement: <DocMail address={text.contact} />.
        </p>
      </DocSection>
    </>
  );
}
