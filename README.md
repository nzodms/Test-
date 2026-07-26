# Argus

A content-protection platform for creators and the agencies that
represent them. A creator searches their public username; Argus scans
indexed public sources for republished content, grades what it finds,
and — once ownership is verified — helps monitor it and request removal.

The landing page **is** the product: it opens as a quiet workspace with
one instrument, becomes a running scan in place, and locks sensitive
detail behind ownership verification.

> **Demonstration product.** No real scan is performed. All results are
> simulated from a deterministic dataset and labelled as such in the
> interface. Nothing is presented as a genuine detection.

## Stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 16 (App Router) + React 19                 |
| Language   | TypeScript strict (`noUncheckedIndexedAccess`)     |
| Styling    | Tailwind CSS v4, CSS-first tokens in `globals.css` |
| Primitives | Radix UI, fully restyled (no stock shadcn look)    |
| Motion     | Framer Motion, `prefers-reduced-motion` aware      |
| Forms      | React Hook Form + Zod 4                            |
| Auth / DB  | Supabase (`@supabase/ssr`), optional               |
| Fonts      | Instrument Sans + Geist Mono via `next/font`       |

Charts are hand-built SVG — no chart library — so they belong to the
design system rather than importing someone else's defaults.

## Getting started

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

With no environment variables the app runs fully in **demo mode**:
every route works, the scan runs, and the workspace is populated from
`src/lib/demo/scan-data.ts`. Nothing external is contacted.

```bash
pnpm lint           # eslint (next/core-web-vitals + typescript)
pnpm typecheck      # tsc --noEmit
pnpm build          # production build
```

## Routes

| Route                                                                                                        | Purpose                                                        |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `/`                                                                                                          | Arrival → live scan → selective lock → claim, then 4 sequences |
| `/onboarding`                                                                                                | Six-step setup, works without auth, resumable                  |
| `/onboarding?mode=demo`                                                                                      | Same flow, explicitly badged as demo                           |
| `/sign-in`                                                                                                   | Sign in (password, plus Google when Supabase is configured)    |
| `/dashboard`                                                                                                 | Demo workspace overview                                        |
| `/dashboard/findings` `/sources` `/monitoring` `/takedowns` `/profiles` `/settings`                          | Workspace sections                                              |
| `/legal/privacy` `/terms` `/content-policy` `/takedown-policy`                                               | Policy pages                                                    |

The route map lives in `src/config/navigation.ts`; nothing hardcodes a
path.

## Design language — "Porcelain Workspace + Black Glass Scanner"

A warm mineral light environment wrapped around a dark,
instrument-grade scanning surface. One cold accent, used rarely enough
that its appearance means something.

- **Environment** — `canvas #F3F1EB`, `paper #FBFAF7`, `mineral #EAE7DF`
- **Scanner** — `scan #0D0F11`, `scan-raised #15181B`
- **Accent** — `#10666E` on light, `#45B3BD` on the scanner
- **Semantic** — mineral green / amber / deep red, never fluorescent

Every colour, radius, shadow and easing is a token in
`src/app/globals.css`; components consume tokens only. Motion tokens
live in `src/lib/motion.ts`.

Two masking techniques are used deliberately and are not
interchangeable: **domains are masked by character substitution**
(`re•••••••.to`) so the shape still reads as a domain, while
**previews are masked by blur**, since an abstract panel has no
characters to substitute. Masked regions are `inert` and
`aria-hidden`, so locked content is not reachable by keyboard or
screen reader.

## Architecture

```
src/
  app/                  routes: landing, onboarding, sign-in, dashboard, legal
  components/
    ui/                 restyled Radix primitives
    primitives/         proprietary: Surface, DataRow, Metric,
                        StatusIndicator, MaskedContent, SourceBadge,
                        TimelineEntry, ProgressRail
    scanner/            the instrument and its parts
    landing/            arrival, sequences, nav, footer
    onboarding/ dashboard/ motion/ brand/
  lib/
    scan/               types, event timeline, single rAF controller
    demo/               the deterministic dataset
    storage.ts          local persistence abstraction (swap for Supabase)
    validation.ts       username / @handle / profile-URL parsing
    supabase/           browser + server clients
    demo-mode.ts        the demo isolation point
  config/               brand, navigation, product copy
```

### The scan engine

The choreography is a stream of structured `ScanEvent`s built in
`src/lib/scan/timeline.ts` and played by one controller
(`use-scan-controller.ts`). Components read state from the controller
and never run their own timers. A real backend can emit the same event
shape to drive the identical interface.

The controller quantizes its clock to 80 ms, so the scanner re-renders
about twelve times a second instead of sixty — the derived values
(counters, source fills, card counts) change no faster than that.

Under `prefers-reduced-motion` the scan resolves immediately to its
completed state; nothing is lost, only the animation.

### Data coherence

`src/lib/demo/scan-data.ts` is the single source of truth. The headline
figures (187 potential matches, 34 indexed sources, 41 high-confidence)
are consumed by the landing scanner *and* the workspace, so the two can
never disagree. `demoMatches` holds the 46-row reviewable slice — the
interface labels it as such and never presents it as the total.

### Demo mode

`src/lib/demo-mode.ts` is the isolation point. Without Supabase
credentials the app runs entirely on simulated data and every route
stays reachable. With credentials, middleware refreshes sessions and
gates `/dashboard`, while demo onboarding stays open.

To remove demo mode later: delete `src/lib/demo/`, `src/lib/demo-mode.ts`,
and the branches that reference them.

## Supabase (optional)

1. Create a project and run `supabase/migrations/0001_init.sql`.
2. Copy `.env.example` → `.env.local` and fill
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Optionally enable the Google provider for the OAuth button.

Set `NEXT_PUBLIC_SITE_URL` to the deployed origin so metadata and auth
redirects resolve correctly.

## Deploy

```bash
npx vercel          # link + preview
npx vercel --prod   # production
```

Deploying with no environment variables ships the working demo.
