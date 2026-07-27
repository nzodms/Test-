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
  title: "Content policy",
  lead: `This document explains what ${brand.name} looks at, what it refuses to look at, how detected material is handled, and what happens to anyone who tries to use a protection tool as a discovery tool.`,
  updated: "Last revised 2026-07-01",
  demoNote: `${brand.name} is a demonstration product. This document illustrates the structure and specificity of a real content policy for a content-protection service; it is not legal advice and creates no obligations.`,
  abuse: `abuse@${brand.domain}`,
} as const;

/** The five categories a scan is allowed to read. The short code is
    the reference the workspace files a finding under. */
const sources = [
  {
    term: "Public websites",
    note: "web",
    definition:
      "Pages reachable without an account that host or embed reposted galleries.",
  },
  {
    term: "Forums",
    note: "frm",
    definition:
      "Openly readable threads and boards where material is shared in bulk.",
  },
  {
    term: "Indexed mirrors",
    note: "mir",
    definition:
      "Copies that remain indexed after the original page is taken down.",
  },
  {
    term: "Public channels",
    note: "chn",
    definition:
      "Channels and feeds that anyone can read without joining or paying.",
  },
  {
    term: "Archived pages",
    note: "arc",
    definition: "Snapshots kept by archiving services after a page is deleted.",
  },
] as const;

export const metadata: Metadata = {
  title: text.title,
  description: `What ${brand.name} indexes and how: public sources only, abstract previews, ownership-gated detail, and a hard prohibition on using the service to find someone else's content.`,
};

export default function ContentPolicyPage() {
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
          {brand.name} reads only sources that are already public and indexed.
          It never signs in, never pays, and never bypasses an access control.
        </p>
        <p>
          Detected material is never hosted, republished, or displayed. Every
          preview in the workspace is an abstract placeholder.
        </p>
        <p>
          Source detail unlocks only after ownership verification, and using{" "}
          {brand.name} to look for someone else&apos;s content ends the account.
        </p>
      </DocSummary>

      <DocNote>{text.demoNote}</DocNote>

      <DocSection index={1} title="What is indexed">
        <p>
          A scan reads pages that are already publicly available and already
          present in a public index. If reaching a page would require an
          account, a payment, an invitation, or any step around an access
          control, it is out of scope — permanently, not by default.
        </p>
        <p>Five categories of source are covered:</p>
        <DocDefinitions items={sources} />
      </DocSection>

      <DocSection index={2} title="How detection works">
        <p>
          You nominate a public profile. {brand.name} derives a fingerprint from
          material you own and compares it against publicly visible material on
          the sources above. Anything similar enough is recorded with its
          address, its source category, the time it was found, and a confidence
          grade — high, medium or low.
        </p>
        <p>
          A grade describes visual similarity and nothing more. It is never
          treated as a finding of ownership or of infringement. That judgement
          belongs to the verified owner, who moves a match from possible, to in
          review, to confirmed.
        </p>
      </DocSection>

      <DocSection index={3} title="What is never done">
        <p>
          {brand.name} does not sign in to any platform as you or as anyone
          else. It does not subscribe, purchase, or accept an invitation in
          order to see content. It does not defeat a paywall, a token, or any
          other access control, and it does not read anything that a member of
          the public could not read.
        </p>
        <p>
          {brand.name} does not upload, repost, mirror, or share detected
          material. It does not operate a public search over findings, publish a
          list of sources, or offer any interface into what has been found for
          another person&apos;s profile. There is no way to browse this service.
        </p>
      </DocSection>

      <DocSection index={4} title="Previews and stored material">
        <p>
          The workspace never renders the detected image or video. Each finding
          carries an abstract placeholder generated from an identifier — a
          structured pattern that occupies the slot and carries no visual
          information from the source page.
        </p>
        <p>
          What is stored for a finding is the page address, the domain, the
          source category, the detection time, the confidence score, and a
          non-reversible fingerprint used to recognise recurrence. Where a host
          requires a sample as evidence in a removal request, that sample is
          attached to the request and is not added to the workspace.
        </p>
      </DocSection>

      <DocSection index={5} title="Ownership gating">
        <p>
          Before verification, a scan reports totals, source categories and
          masked domains. That is deliberately enough to understand the scale of
          the problem and deliberately not enough to locate anything.
        </p>
        <p>
          After verification, full domains, addresses, timestamps and case
          history unlock for the verified owner. An agency sees only the
          profiles on its roster, and only while the creator&apos;s mandate is
          in place.
        </p>
      </DocSection>

      <DocSection index={6} title="Prohibited use">
        <p>
          The following end an account: nominating a profile in order to find
          someone else&apos;s material; using findings to view, collect,
          catalogue or share detected content; using findings to contact,
          pressure or expose an uploader; exporting results for resale or
          republication; or misrepresenting a mandate in order to unlock another
          person&apos;s workspace.
        </p>
        <p>
          {brand.name} is a protection tool. Any use that increases exposure
          rather than reducing it is a misuse of it.
        </p>
      </DocSection>

      <DocSection index={7} title="Enforcement">
        <p>
          Usage patterns inconsistent with ownership — many unrelated profiles,
          no verification attempted, repeated exports with no removal requests —
          trigger a verification requirement, then suspension while the account
          is reviewed. Confirmed misuse closes the account permanently, and is
          reported where the law requires it.
        </p>
      </DocSection>

      <DocSection index={8} title="Material that is out of scope">
        <p>
          {brand.name} is built for adults protecting their own work. Any
          indication that a detection involves a minor, or material shared
          without the consent of the person in it, is removed from automated
          handling immediately. The case is escalated to a person, the relevant
          authority or hotline is notified where required, and the material is
          not displayed or retained beyond what that referral requires.
        </p>
      </DocSection>

      <DocSection index={9} title="Reporting misuse">
        <p>
          If you believe someone is using {brand.name} against you, or that a
          finding is wrong, write to <DocMail address={text.abuse} /> with the
          profile name and anything that helps identify the account.
          Reports are acknowledged within three business days, and accounts
          under review lose access to detailed findings while the review runs.
        </p>
        <p>
          Material changes to this policy are announced in the workspace and by
          email at least 14 days before they take effect.
        </p>
      </DocSection>
    </>
  );
}
