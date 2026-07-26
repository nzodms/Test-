import type { Metadata } from "next";
import type { ReactNode } from "react";

import { brand } from "@/config/brand";

/* ────────────────────────────────────────────────────────────────
   Strings local to this document.
   ──────────────────────────────────────────────────────────────── */

const text = {
  eyebrow: "Policy",
  title: "Privacy",
  lead: `${brand.name} exists to give creators control over where their work appears. That only works if the tool holds as little as it can, keeps it for as short as it can, and shows detailed findings to nobody but the person who owns the profile.`,
  updated: "Last updated July 1, 2026",
  summaryLabel: "In short",
  summary: [
    `${brand.name} processes the public usernames you add, metadata collected from publicly indexed sources, and the evidence you provide to prove a profile is yours.`,
    "It never signs in to a platform, never accesses private or paid content, never sells data, and never publishes findings.",
    "Detailed results are visible only to the verified owner of a profile and the representatives that owner authorizes.",
  ],
  demoNote: `${brand.name} is a demonstration product. This document illustrates the structure and specificity of a real privacy policy for a content-protection service; it is not legal advice and creates no obligations.`,
  contact: `privacy@${brand.domain}`,
} as const;

export const metadata: Metadata = {
  title: text.title,
  description: `How ${brand.name} handles the data behind a scan: what is processed, what is never touched, how long it is kept, and who can see detailed findings.`,
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

function Term({ name, children }: { name: string; children: ReactNode }) {
  return (
    <p>
      <span className="font-medium text-ink">{name}</span> — {children}
    </p>
  );
}

export default function PrivacyPage() {
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
          {text.summary.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>

      <p className="mt-6 border-l-2 border-edge-strong pl-4 text-[13px] leading-relaxed text-ink-soft">
        {text.demoNote}
      </p>

      <div className="mt-10 h-px w-full bg-edge" />

      <Section title="What is processed">
        <Term name="Account details">
          your name, email address, the sign-in method you chose, and whether
          the workspace belongs to a creator or an agency.
        </Term>
        <Term name="Profiles you add">
          the public username, the platform it belongs to, and the public
          profile URL if you provide one. Nothing behind a login is read.
        </Term>
        <Term name="Source metadata">
          for each detection: the address of the page, its domain, the kind of
          source it is, the moment it was found, a confidence score, and a
          non-reversible fingerprint used to recognise the same material if it
          reappears. The address and the fingerprint are what is kept — not the
          material itself.
        </Term>
        <Term name="Verification evidence">
          whatever you submit to prove a profile is yours: a temporary code
          placed in a public bio, a one-time code sent through the platform, a
          connected account identifier, or documentation reviewed by a person.
        </Term>
        <Term name="Workspace activity">
          the decisions you record on findings, the state of each removal
          request, monitoring frequency and coverage, and notification
          preferences.
        </Term>
        <Term name="Technical logs">
          IP address, browser user agent and request timestamps, kept for
          security, abuse detection and diagnosing faults.
        </Term>
      </Section>

      <Section title="What is never processed">
        <p>
          <span className="font-medium text-ink">
            No private or paid content.
          </span>{" "}
          {brand.name} does not sign in to a platform as you, does not purchase
          or subscribe to anything, and does not attempt to pass a paywall or
          any other access control. If material is not reachable publicly, it is
          outside the scan.
        </p>
        <p>
          <span className="font-medium text-ink">No resale, no advertising.</span>{" "}
          Your data is never sold, rented or brokered. It is not used to build
          advertising profiles, and it is not supplied to third parties to train
          their models.
        </p>
        <p>
          <span className="font-medium text-ink">No public index.</span> Findings
          are not published, syndicated, or made searchable by anyone other than
          the verified owner. {brand.name} is a protection tool, not a directory
          of where content can be found.
        </p>
        <p>
          <span className="font-medium text-ink">
            No copies of detected material.
          </span>{" "}
          Previews in the workspace are abstract placeholders generated from an
          identifier; they carry no visual information from the source page.
        </p>
      </Section>

      <Section title="Why it is processed">
        <p>
          Each category above has one purpose: to run the scan you asked for, to
          keep monitoring the profiles you added, to prepare removal requests
          with the evidence a host will ask for, to prove ownership when that is
          required, to send only the notifications you enabled, and to keep the
          service secure. Data collected for one of these purposes is not
          repurposed for another.
        </p>
      </Section>

      <Section title="Who can see detailed findings">
        <p>
          Before ownership is verified, a scan shows totals, source categories
          and masked domains — enough to know something exists, never enough to
          go and find it.
        </p>
        <p>
          After verification, full domains, page addresses, detection times,
          confidence scores and case history unlock for the verified owner of
          that profile.
        </p>
        <p>
          An agency workspace sees only the profiles on its roster, and only for
          as long as the creator keeps that mandate in place. Removing a profile
          from a roster ends that access immediately.
        </p>
        <p>
          Staff access is limited to named personnel, requires a documented
          reason — a support request, an abuse report, or a legal order — and is
          logged. Nobody at {brand.company} browses workspaces casually.
        </p>
      </Section>

      <Section title="How long it is kept">
        <Term name="Open findings">
          retained while the profile is monitored, so recurrence can be
          recognised.
        </Term>
        <Term name="Closed cases">
          retained for 24 months after the last status change, as evidence if the
          same material resurfaces, then deleted.
        </Term>
        <Term name="Verification evidence">
          kept for the life of the account. Documents submitted for manual review
          are deleted within 30 days of the decision.
        </Term>
        <Term name="Technical logs">retained for 90 days.</Term>
        <Term name="Account closure">
          workspace data is deleted within 30 days of the request, and rolls out
          of backups within a further 30 days. The only exception is data under a
          legal hold, which is isolated and deleted when the hold lifts.
        </Term>
        <p>
          You can remove a single profile at any time. Its monitoring stops
          immediately, and its findings are deleted with it on request.
        </p>
      </Section>

      <Section title="Security">
        <p>
          Traffic is encrypted in transit and data is encrypted at rest.
          Workspace records are separated at the database level, so one
          workspace cannot read another&apos;s rows even in the event of an
          application fault. Verification documents are stored apart from
          workspace data with a narrower access list.
        </p>
        <p>
          Authentication is delegated to a managed provider; {brand.company} does
          not store passwords in readable form. Staff access is
          least-privilege, reviewed quarterly and revoked on departure.
        </p>
        <p>
          If a breach affects your data, you will be told what happened, what was
          exposed and what to do about it — within 72 hours of confirmation, and
          regulators notified where the law requires it.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          You can access and correct your data from the workspace, export your
          findings and takedown history at any time, and request deletion of the
          account and everything in it. You can withdraw consent for
          notifications without affecting monitoring, and object to processing
          that is not necessary to run the service.
        </p>
        <p>
          Requests are answered within 30 days. If a request is refused, you will
          be told why, and where to complain.
        </p>
      </Section>

      <Section title="Changes and contact">
        <p>
          Material changes to this policy are announced in the workspace and by
          email at least 14 days before they take effect, with a summary of what
          changed. Editorial corrections take effect immediately.
        </p>
        <p>
          Questions, requests and complaints:{" "}
          <a
            href={`mailto:${text.contact}`}
            className="text-data text-accent underline-offset-4 hover:underline"
          >
            {text.contact}
          </a>
          , or by post to {brand.company}.
        </p>
      </Section>
    </article>
  );
}
