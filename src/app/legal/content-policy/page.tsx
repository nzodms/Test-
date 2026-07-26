import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SourceBadge } from "@/components/primitives";
import { brand } from "@/config/brand";

/* ────────────────────────────────────────────────────────────────
   Strings local to this document.
   ──────────────────────────────────────────────────────────────── */

const text = {
  eyebrow: "Policy",
  title: "Content policy",
  lead: `This document explains what ${brand.name} looks at, what it refuses to look at, how detected material is handled, and what happens to anyone who tries to use a protection tool as a discovery tool.`,
  updated: "Last updated July 1, 2026",
  summaryLabel: "In short",
  demoNote: `${brand.name} is a demonstration product. This document illustrates the structure and specificity of a real content policy for a content-protection service; it is not legal advice and creates no obligations.`,
  sourcesLabel: "Source categories",
  abuse: `abuse@${brand.domain}`,
} as const;

const sources = [
  {
    kind: "website",
    label: "Public websites",
    body: "Pages reachable without an account that host or embed reposted galleries.",
  },
  {
    kind: "forum",
    label: "Forums",
    body: "Openly readable threads and boards where material is shared in bulk.",
  },
  {
    kind: "mirror",
    label: "Indexed mirrors",
    body: "Copies that remain indexed after the original page is taken down.",
  },
  {
    kind: "channel",
    label: "Public channels",
    body: "Channels and feeds that anyone can read without joining or paying.",
  },
  {
    kind: "archive",
    label: "Archived pages",
    body: "Snapshots kept by archiving services after a page is deleted.",
  },
] as const;

export const metadata: Metadata = {
  title: text.title,
  description: `What ${brand.name} indexes and how: public sources only, abstract previews, ownership-gated detail, and a hard prohibition on using the service to find someone else's content.`,
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

export default function ContentPolicyPage() {
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
            {brand.name} reads only sources that are already public and indexed.
            It never signs in, never pays, and never bypasses an access control.
          </p>
          <p>
            Detected material is never hosted, republished, or displayed. Every
            preview in the workspace is an abstract placeholder.
          </p>
          <p>
            Source detail unlocks only after ownership verification, and using{" "}
            {brand.name} to look for someone else&apos;s content ends the
            account.
          </p>
        </div>
      </div>

      <p className="mt-6 border-l-2 border-edge-strong pl-4 text-[13px] leading-relaxed text-ink-soft">
        {text.demoNote}
      </p>

      <div className="mt-10 h-px w-full bg-edge" />

      <Section title="What is indexed">
        <p>
          A scan reads pages that are already publicly available and already
          present in a public index. If reaching a page would require an
          account, a payment, an invitation, or any step around an access
          control, it is out of scope — permanently, not by default.
        </p>
        <p>Five categories of source are covered:</p>
        <ul className="space-y-3 pt-1">
          {sources.map((source) => (
            <li
              key={source.kind}
              className="flex flex-wrap items-baseline gap-3"
            >
              <SourceBadge
                kind={source.kind}
                label={source.label}
                tone="light"
              />
              <span className="w-full min-w-0 text-[14px] leading-relaxed sm:w-auto sm:flex-1">
                {source.body}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="How detection works">
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
      </Section>

      <Section title="What is never done">
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
      </Section>

      <Section title="Previews and stored material">
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
      </Section>

      <Section title="Ownership gating">
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
      </Section>

      <Section title="Prohibited use">
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
      </Section>

      <Section title="Enforcement">
        <p>
          Usage patterns inconsistent with ownership — many unrelated profiles,
          no verification attempted, repeated exports with no removal requests —
          trigger a verification requirement, then suspension while the account
          is reviewed. Confirmed misuse closes the account permanently, and is
          reported where the law requires it.
        </p>
      </Section>

      <Section title="Material that is out of scope">
        <p>
          {brand.name} is built for adults protecting their own work. Any
          indication that a detection involves a minor, or material shared
          without the consent of the person in it, is removed from automated
          handling immediately. The case is escalated to a person, the relevant
          authority or hotline is notified where required, and the material is
          not displayed or retained beyond what that referral requires.
        </p>
      </Section>

      <Section title="Reporting misuse">
        <p>
          If you believe someone is using {brand.name} against you, or that a
          finding is wrong, write to{" "}
          <a
            href={`mailto:${text.abuse}`}
            className="text-data text-accent underline-offset-4 hover:underline"
          >
            {text.abuse}
          </a>{" "}
          with the profile name and anything that helps identify the account.
          Reports are acknowledged within three business days, and accounts
          under review lose access to detailed findings while the review runs.
        </p>
        <p>
          Material changes to this policy are announced in the workspace and by
          email at least 14 days before they take effect.
        </p>
      </Section>
    </article>
  );
}
