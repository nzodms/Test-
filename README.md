# Argus

A content-protection platform for creators and the agencies that
represent them. A creator searches their public username; Argus scans
indexed public sources for republished content, grades what it finds,
and — once ownership is verified — helps monitor it and request removal.

The landing page **is** the product. The first screen is a search
field, not a slogan; running a scan reorganises the page around the
work rather than replacing it; and the report that results is the same
surface, still holding the same figures, with the parts that would let
anyone reach the content withheld.

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
| Fonts      | Geist Sans + Geist Mono (self-hosted, `geist` pkg) |

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

## Design language

Argus is a professional instrument. Not a document, not an admin
panel, and deliberately not something that could be re-skinned as an
SEO tool or an analytics dashboard.

### Typography — one family

Everything a person reads is **Geist Sans**. There is no display
serif: hierarchy comes from size, weight, spacing and alignment, which
is what separates a piece of software from a magazine. **Geist Mono**
is reserved for values that are data — domains, case references,
timestamps, scan offsets, session numbers — so its presence means
"this is a measured value", not "this looks technical".

Four registers, all in `globals.css`:

| Utility        | Used for                                     |
| -------------- | -------------------------------------------- |
| `text-display` | the single largest thing on a screen         |
| `text-title`   | opens a section                              |
| `text-subject` | names a record inline                        |
| `text-figure`  | a number read as a measurement (tabular)     |

> These are custom utilities, so `tailwind-merge` is extended in
> `src/lib/utils.ts` to keep them in their own class group. Without
> that, `cn("text-figure", "text-[58px]")` silently drops the first
> one and takes the weight and tracking with it.

### Surfaces and colour

Light, quiet, slightly warm — never flat white, never beige-paper.
Structure comes from hairlines, spacing and alignment; almost nothing
is wrapped in a card.

- **Environment** — `canvas #EDECEA`, `page #FDFDFC`, `paper #F6F5F3`
- **Ink** — `#16171A`, with `graphite`, `ink-soft`, `ink-faint`
- **Accent** — `#10666E`, used rarely enough that it means something
- **Amber** — exposure status and alerts only. **Red** — errors only.

The one dark surface in the product is the comparison strip inside the
scan's Findings stage. It is a local instrument, the width of one
panel, alive only while matching runs. Making the dark surface the
product's identity is exactly what turns a protection tool into a
generic security dashboard.

Every colour, radius, shadow and easing is a token in
`src/app/globals.css`; components consume tokens only. Motion tokens
live in `src/lib/motion.ts`.

### Withholding, not blurring

A blurred screenshot is still the data. Redaction here is real: the
server sends the visible head and tail of a domain plus the *length*
of what is withheld, and the component draws a block over nothing —
`re███████.to`. The characters never reach the browser, so there is
nothing to recover in devtools. Where a whole region is locked it is
also `inert` and `aria-hidden`, so it is unreachable by keyboard and
screen reader rather than merely hard to read.

What stays visible is deliberate: totals, source counts, categories,
exposure, trend. What is withheld: exact addresses, evidence, full
history, and every removal action.

## Architecture

```
src/
  app/                  routes: landing, onboarding, sign-in, dashboard, legal
  components/
    scan/               the signature: ProfileSearch, ScanProgress,
                        ScanOperation, Figure, SourceEntry, FindingRow,
                        ExposureStatus, stage panels, the report
    workspace/          the internal product: file library + profile file
    file/               shared record parts + the redaction primitives
    ui/                 restyled Radix primitives
    primitives/ scanner/ landing/ onboarding/ motion/ brand/
  lib/
    scan/               types, choreography, single rAF controller
    demo/               the deterministic dataset
    storage.ts          local persistence abstraction (swap for Supabase)
    validation.ts       username / @handle / profile-URL parsing
    supabase/           browser + server clients
    demo-mode.ts        the demo isolation point
  config/               brand, navigation, product copy
```

### The scan engine

A scan is a state machine, not a loader. Phases run

```
resolving_identity → checking_profiles → indexing_sources →
matching_content → classifying_findings → calculating_exposure →
building_report → complete → locked
```

and map onto the five stages a person actually sees: Identity,
Sources, Findings, Exposure, Report.

`src/lib/scan/timeline.ts` holds the phase windows, the operation
stream and every counter curve. Nothing counts linearly to its target:
matches follow an irregular curve (2, 9, 22, 46, 80, 123, 163, 187) so
the crawl reads as work; sources are *detected* one kind at a time and
then fill; findings drop into the register individually; exposure eases
into place; report sections are laid in one after another.

One controller (`use-scan-controller.ts`) samples all of it on a single
rAF clock and produces one `ScanFrame` per painted frame. Components
read the frame — they never run timers and never recompute a window.
The clock is quantized to 80 ms, so a scan costs about twelve renders a
second rather than sixty.

A real backend emitting the same phases and events would drive this
interface unchanged.

Under `prefers-reduced-motion` the scan resolves immediately to its
completed state; nothing is lost, only the animation. `Skip` ends it
early, `Replay scan` runs it again.

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

The project is deployment-ready but has **not** been deployed from
this environment: the Vercel CLI has no credentials here and its
login flow cannot reach the network. To ship it:

```bash
npx vercel login
npx vercel            # link the project + preview deploy
npx vercel --prod     # production
```

Deploying with no environment variables ships the working demo. If
you add Supabase credentials, also set `NEXT_PUBLIC_SITE_URL` to the
production origin so metadata and auth redirects resolve.
