"use client";

import * as React from "react";
import { ArrowUpRight, Radar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { HaloField } from "@/components/halo/halo-field";
import { MagneticCard } from "@/components/halo/magnetic";
import { Reveal, RevealGroup, RevealItem } from "@/components/halo/reveal";
import { AnimatedNumber } from "@/components/halo/animated-number";
import { formatCompact } from "@/lib/utils";
import {
  ChartsSection,
  ComponentsGallery,
  FeedbackStates,
} from "./ds-gallery";
import { DsSection, LabeledRow, Specimen, SwatchGroup } from "./ds-primitives";

/* ── Token tables (mirrors globals.css — update both together) ── */

const depthTokens = [
  { name: "void", value: "#07090e" },
  { name: "base", value: "#0b0e15" },
  { name: "surface", value: "#10141d" },
  { name: "raised", value: "#151a26" },
  { name: "overlay", value: "#1b2130" },
  { name: "lifted", value: "#222941" },
];

const inkTokens = [
  { name: "ink", value: "#e9edf5" },
  { name: "ink-secondary", value: "#9aa5ba" },
  { name: "ink-muted", value: "#626e85" },
  { name: "ink-faint", value: "#3d4658" },
];

const haloTokens = [
  { name: "halo-100", value: "#d8f6fb" },
  { name: "halo-200", value: "#aeeaf4" },
  { name: "halo-300", value: "#8adfee" },
  { name: "halo-400", value: "#5ecfe3" },
  { name: "halo-500", value: "#37b6cf" },
  { name: "halo-600", value: "#2593ab" },
  { name: "halo-700", value: "#1d7186" },
];

const emberTokens = [
  { name: "ember-300", value: "#f6d9a8" },
  { name: "ember-400", value: "#eebc6f" },
  { name: "ember-500", value: "#e0a04a" },
];

const semanticTokens = [
  { name: "positive", value: "#63d39e" },
  { name: "caution", value: "#e6c26a" },
  { name: "critical", value: "#ef8395" },
];

const edgeTokens = [
  { name: "edge", value: "rgb(154 170 207 / 0.11)" },
  { name: "edge-strong", value: "rgb(154 170 207 / 0.2)" },
  { name: "edge-faint", value: "rgb(154 170 207 / 0.06)" },
  { name: "halo-edge", value: "rgb(94 207 227 / 0.28)" },
];

const principles = [
  {
    title: "Depth, not black",
    body: "Six graphite-blue surfaces — void through lifted — establish elevation. Pure black never appears; depth comes from the scale, not from darkness.",
  },
  {
    title: "One cold accent, rare ember",
    body: "Halo cyan carries every interactive meaning. Ember is the warm counterpoint, reserved for genuinely important moments — at most one per screen.",
  },
  {
    title: "Hairline translucent edges",
    body: "Borders are light catching a seam: rgb(154 170 207) at 6–20% alpha. Opaque gray lines are off-brand everywhere.",
  },
  {
    title: "The halo field motif",
    body: "A diffuse, slightly off-center bloom wrapped in a faint elliptical ring marks strategic zones. One field per view, strength kept under 0.2.",
  },
  {
    title: "Magnetic focus motion",
    body: "Interactive surfaces answer the pointer: a border light follows the cursor and primary cards lift 2px. Transform and opacity only, and it all disables under reduced motion.",
  },
];

const tocItems = [
  { id: "principles", label: "Principles" },
  { id: "color", label: "Color tokens" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing & radii" },
  { id: "halo-field", label: "Halo Field" },
  { id: "magnetic", label: "Magnetic Focus" },
  { id: "components", label: "Components" },
  { id: "feedback", label: "Feedback & states" },
  { id: "charts", label: "Charts" },
  { id: "motion", label: "Motion" },
];

export function DesignSystemContent() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_9.5rem] xl:gap-12">
        <div className="min-w-0">
          {/* ── Page header ─────────────────────────────────────── */}
          <header className="relative overflow-hidden rounded-xl border border-edge bg-surface px-6 py-10 sm:px-10">
            <HaloField x={70} y={20} strength={0.12} />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-label">Obsidian Halo</p>
                <Badge variant="outline">Internal — development only</Badge>
              </div>
              <h1 className="text-display mt-3 text-3xl text-ink sm:text-4xl">
                Design system
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                The living reference for Halo&apos;s visual language: every
                token, primitive and convention rendered from the same code the
                product ships. This route returns a 404 in production builds.
              </p>
            </div>
          </header>

          {/* ── Sections ────────────────────────────────────────── */}
          <div className="mt-16 space-y-20">
            <PrinciplesSection />
            <ColorSection />
            <TypographySection />
            <SpacingSection />
            <HaloFieldSection />
            <MagneticSection />
            <ComponentsGallery />
            <FeedbackStates />
            <ChartsSection />
            <MotionSection />
          </div>

          <footer className="mt-20 border-t border-edge-faint pt-6">
            <p className="text-xs text-ink-muted">
              Tokens live in <span className="font-mono">src/app/globals.css</span>;
              this page mirrors them and must be updated in the same change.
            </p>
          </footer>
        </div>

        {/* ── Sticky mini TOC (xl and up) ─────────────────────────── */}
        <nav aria-label="On this page" className="hidden xl:block">
          <div className="sticky top-10">
            <p className="text-label">On this page</p>
            <ul className="mt-3 space-y-1 border-l border-edge pl-3">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="block rounded-xs py-0.5 text-xs text-ink-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ── 1 · Principles ──────────────────────────────────────────────── */

function PrinciplesSection() {
  return (
    <DsSection
      id="principles"
      label="01 — Principles"
      title="Five rules of Obsidian Halo"
      description="Everything else on this page is an application of these five statements. When a design decision is unclear, resolve it against this list, in order."
    >
      <ol className="space-y-3">
        {principles.map((p, i) => (
          <li
            key={p.title}
            className="flex gap-4 rounded-lg border border-edge bg-surface px-5 py-4"
          >
            <span className="tabular font-mono text-xs text-halo-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-[13px] font-medium text-ink">{p.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">
                {p.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </DsSection>
  );
}

/* ── 2 · Color ───────────────────────────────────────────────────── */

function ColorSection() {
  return (
    <DsSection
      id="color"
      label="02 — Color"
      title="Color tokens"
      description="Defined once as CSS custom properties in globals.css and consumed through Tailwind utilities (bg-raised, text-ink-muted, border-edge). Edge tokens are translucent by design — they read as light on a seam over any depth."
    >
      <Specimen title="Depth scale" note="graphite-blue, never pure black — each step is one elevation level">
        <SwatchGroup label="bg-*" tokens={depthTokens} cols="grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" />
      </Specimen>
      <Specimen title="Ink" note="four text levels; ink-faint is decorative only, never for copy">
        <SwatchGroup label="text-ink-*" tokens={inkTokens} cols="grid-cols-2 gap-3 sm:grid-cols-4" />
      </Specimen>
      <Specimen title="Halo" note="the cold accent — 400 is the primary hue, 500 for fills">
        <SwatchGroup label="halo-100 → 700" tokens={haloTokens} cols="grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7" />
      </Specimen>
      <div className="grid gap-6 lg:grid-cols-2">
        <Specimen title="Ember" note="rare warm accent — important moments only">
          <SwatchGroup label="ember-*" tokens={emberTokens} cols="grid-cols-3 gap-3" />
        </Specimen>
        <Specimen title="Semantic" note="usually applied as tinted fills: bg-critical/10 + text-critical">
          <SwatchGroup label="positive · caution · critical" tokens={semanticTokens} cols="grid-cols-3 gap-3" />
        </Specimen>
      </div>
      <Specimen title="Edges" note="translucent hairlines — shown here over the surface depth">
        <SwatchGroup label="border-*" tokens={edgeTokens} cols="grid-cols-2 gap-3 sm:grid-cols-4" />
      </Specimen>
    </DsSection>
  );
}

/* ── 3 · Typography ──────────────────────────────────────────────── */

function TypographySection() {
  return (
    <DsSection
      id="typography"
      label="03 — Typography"
      title="Typography"
      description="Geist Sans for interface text, Geist Mono for identifiers and code. Display and title styles tighten tracking; every rendered number takes the .tabular utility so columns of digits align."
    >
      <Specimen title="Specimens">
        <div>
          <LabeledRow label="text-display · 30px">
            <p className="text-display text-3xl text-ink">
              Operational clarity, rendered calm.
            </p>
          </LabeledRow>
          <LabeledRow label="text-title · 18px">
            <p className="text-title text-lg text-ink">Signals overview</p>
          </LabeledRow>
          <LabeledRow label="body · 14px">
            <p className="text-sm leading-relaxed text-ink">
              Halo watches every connected system and surfaces the few changes
              that deserve a human decision.
            </p>
          </LabeledRow>
          <LabeledRow label="secondary · 14px">
            <p className="text-sm leading-relaxed text-ink-secondary">
              Supporting copy sits one level down; it explains without
              competing for attention.
            </p>
          </LabeledRow>
          <LabeledRow label="text-label · 11px">
            <p className="text-label">Active signals</p>
          </LabeledRow>
          <LabeledRow label="tabular numbers">
            <p className="tabular text-2xl text-ink">
              $
              <AnimatedNumber value={482000} format={formatCompact} />
              <span className="ml-4 text-base text-ink-secondary">
                98.2% success
              </span>
              <span className="ml-4 text-base text-ink-secondary">
                47 active
              </span>
            </p>
          </LabeledRow>
          <LabeledRow label="mono · 12px">
            <p className="font-mono text-xs text-ink-secondary">
              SIG-1043 · source=datadog · impact=74
            </p>
          </LabeledRow>
          <LabeledRow label="kbd">
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-secondary">
              Press <Kbd>⌘</Kbd>
              <Kbd>K</Kbd> anywhere to open the command palette
            </span>
          </LabeledRow>
        </div>
      </Specimen>
    </DsSection>
  );
}

/* ── 4 · Spacing, radii, shadows ─────────────────────────────────── */

const spacingSteps = [4, 8, 12, 16, 24, 32, 48];

const radiusChips = [
  { name: "xs", css: "rounded-xs", px: "4px" },
  { name: "sm", css: "rounded-sm", px: "6px" },
  { name: "md", css: "rounded-md", px: "10px" },
  { name: "lg", css: "rounded-lg", px: "14px" },
  { name: "xl", css: "rounded-xl", px: "20px" },
];

const shadowChips = [
  { name: "shadow-card", css: "shadow-card", note: "cards, rows" },
  { name: "shadow-float", css: "shadow-float", note: "popovers, menus" },
  { name: "shadow-modal", css: "shadow-modal", note: "dialogs, drawers" },
];

function SpacingSection() {
  return (
    <DsSection
      id="spacing"
      label="04 — Space"
      title="Spacing, radii & shadows"
      description="Everything sits on the 4px grid. Radii step from 4px chips to 20px hero panels; shadows add depth without murk — each one includes a faint 1px keyline."
    >
      <Specimen title="Spacing scale" note="bars are actual size — the seven steps used in layouts">
        <div className="space-y-2.5">
          {spacingSteps.map((px) => (
            <div key={px} className="flex items-center gap-4">
              <span className="tabular w-10 shrink-0 text-right font-mono text-2xs text-ink-muted">
                {px}px
              </span>
              <div
                className="h-4 rounded-xs bg-halo-500/60"
                style={{ width: `${px}px` }}
                aria-hidden
              />
            </div>
          ))}
        </div>
      </Specimen>
      <div className="grid gap-6 lg:grid-cols-2">
        <Specimen title="Radii">
          <div className="flex flex-wrap items-end gap-4">
            {radiusChips.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div
                  className={`size-16 border border-edge-strong bg-raised ${r.css}`}
                  aria-hidden
                />
                <p className="text-2xs text-ink-secondary">
                  {r.name}
                  <span className="ml-1 font-mono text-ink-muted">{r.px}</span>
                </p>
              </div>
            ))}
          </div>
        </Specimen>
        <Specimen title="Shadows">
          <div className="flex flex-wrap items-end gap-6">
            {shadowChips.map((s) => (
              <div key={s.name} className="flex flex-col items-center gap-3">
                <div
                  className={`h-16 w-24 rounded-md bg-raised ${s.css}`}
                  aria-hidden
                />
                <p className="text-center text-2xs text-ink-secondary">
                  <span className="font-mono">{s.name}</span>
                  <span className="block text-ink-muted">{s.note}</span>
                </p>
              </div>
            ))}
          </div>
        </Specimen>
      </div>
    </DsSection>
  );
}

/* ── 5 · Halo Field ──────────────────────────────────────────────── */

function HaloFieldSection() {
  return (
    <DsSection
      id="halo-field"
      label="05 — Halo Field"
      title="Halo Field"
      description="The signature light motif: a diffuse bloom wrapped in a faint elliptical ring, rendered with pure CSS gradients. It marks the one strategic zone of a view — never decoration."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Specimen title="Default" note='x={62} y={38} strength={0.14}' bodyClassName="p-0">
          <div className="relative h-44 overflow-hidden bg-base">
            <HaloField x={62} y={38} strength={0.14} />
            <p className="relative p-5 text-xs text-ink-muted">
              tone=&quot;halo&quot;
            </p>
          </div>
        </Specimen>
        <Specimen title="Ember tone" note='tone="ember" — important warm moments' bodyClassName="p-0">
          <div className="relative h-44 overflow-hidden bg-base">
            <HaloField x={35} y={55} strength={0.13} tone="ember" />
            <p className="relative p-5 text-xs text-ink-muted">
              tone=&quot;ember&quot;
            </p>
          </div>
        </Specimen>
        <Specimen title="Drift" note="drift — slow ambient motion, hero sections only" bodyClassName="p-0">
          <div className="relative h-44 overflow-hidden bg-base">
            <HaloField x={50} y={42} strength={0.15} drift />
            <p className="relative p-5 text-xs text-ink-muted">drift</p>
          </div>
        </Specimen>
      </div>
      <Specimen title="Usage rules">
        <ul className="list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-ink-secondary">
          <li>
            Strategic zones only: the primary CTA, a selected KPI, the active
            onboarding step, global search, one important event.
          </li>
          <li>One field per view. Two blooms compete and read as decoration.</li>
          <li>
            The parent needs <span className="font-mono text-2xs">relative overflow-hidden</span>;
            siblings that must sit above the field need{" "}
            <span className="font-mono text-2xs">className=&quot;relative&quot;</span>.
          </li>
          <li>Keep strength at or below 0.2; the demo values here are typical.</li>
          <li>Reserve drift for hero sections; it never appears inside dense app views.</li>
        </ul>
      </Specimen>
    </DsSection>
  );
}

/* ── 6 · Magnetic Focus ──────────────────────────────────────────── */

function MagneticSection() {
  return (
    <DsSection
      id="magnetic"
      label="06 — Magnetic Focus"
      title="Magnetic Focus"
      description="Primary interactive cards react to the pointer: a border light follows the cursor and the card lifts by 2px. Move your pointer across the demos below."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <MagneticCard className="p-5" lift>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-label">Priority signal</p>
              <h3 className="text-title mt-2 text-sm text-ink">
                Checkout latency above threshold
              </h3>
              <p className="mt-1 text-xs text-ink-muted">
                SIG-1043 · impact 74 · with lift
              </p>
            </div>
            <span className="rounded-md border border-edge bg-surface p-2">
              <Radar className="size-4 text-halo-300" aria-hidden />
            </span>
          </div>
        </MagneticCard>
        <MagneticCard className="p-5" lift={false}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-label">Quick action</p>
              <h3 className="text-title mt-2 text-sm text-ink">
                Open this week&apos;s report
              </h3>
              <p className="mt-1 text-xs text-ink-muted">
                border light only · lift={"{false}"}
              </p>
            </div>
            <span className="rounded-md border border-edge bg-surface p-2">
              <ArrowUpRight className="size-4 text-ink-muted" aria-hidden />
            </span>
          </div>
        </MagneticCard>
      </div>
      <Specimen title="Usage rules">
        <ul className="list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-ink-secondary">
          <li>
            Interactive primary cards only — never on static content, table
            rows or dense lists.
          </li>
          <li>
            The border light reads <span className="font-mono text-2xs">--mx / --my</span> set
            by the <span className="font-mono text-2xs">useMagnetic</span> hook; everything is
            transform and opacity.
          </li>
          <li>
            Disabled automatically under{" "}
            <span className="font-mono text-2xs">prefers-reduced-motion</span> — the card stays
            a plain surface-card.
          </li>
        </ul>
      </Specimen>
    </DsSection>
  );
}

/* ── 10 · Motion ─────────────────────────────────────────────────── */

const motionRows = [
  { label: "150 ms", body: "Micro interactions — hovers, toggles, checkbox ticks." },
  { label: "250 ms", body: "Standard transitions — menus, popovers, tab underlines." },
  { label: "350 ms", body: "Overlays — drawers, dialogs, magnetic lift." },
  {
    label: "cubic-bezier(0.32, 0.72, 0, 1)",
    body: "The halo ease: fast start, long settle. Exposed as --ease-halo and used by every signature animation.",
  },
];

function MotionSection() {
  return (
    <DsSection
      id="motion"
      label="10 — Motion"
      title="Motion"
      description="Three durations, one curve. Motion communicates causality, never spectacle — and the whole layer collapses to instant transitions under prefers-reduced-motion (a global media query caps every animation at 0.01ms)."
    >
      <Specimen title="Durations & easing">
        <div>
          {motionRows.map((row) => (
            <LabeledRow key={row.label} label={row.label}>
              <p className="text-[13px] leading-relaxed text-ink-secondary">
                {row.body}
              </p>
            </LabeledRow>
          ))}
        </div>
      </Specimen>
      <Specimen
        title="Reveal"
        note="scroll-triggered, once per element — scroll this row out of view and back to replay is intentionally impossible"
      >
        <RevealGroup stagger={0.08} className="grid gap-4 sm:grid-cols-3">
          {["Detected", "Triaged", "Resolved"].map((step, i) => (
            <RevealItem key={step}>
              <div className="rounded-lg border border-edge bg-raised p-4">
                <p className="tabular font-mono text-2xs text-halo-400">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="text-title mt-2 text-sm text-ink">{step}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Staggered 80 ms apart with the halo ease.
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal delay={0.1} className="mt-4">
          <p className="text-xs text-ink-muted">
            Under reduced motion, Reveal renders its children statically — no
            fade, no translate, no exceptions.
          </p>
        </Reveal>
      </Specimen>
    </DsSection>
  );
}
