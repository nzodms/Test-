# Halo — SaaS Foundation

A complete, production-ready SaaS foundation with an original visual
language ("Obsidian Halo"). Built as a reusable base for future
products: swap the demo dataset, rename the product, keep the
architecture.

**Fictional product**: Halo is an operational intelligence platform
that centralizes a company's signals, risks, opportunities and
automations.

## Stack

| Layer      | Choice                                            |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack) + React 19     |
| Language   | TypeScript strict (`noUncheckedIndexedAccess`)    |
| Styling    | Tailwind CSS v4 (CSS-first tokens in globals.css) |
| Primitives | Radix UI (shadcn-style, fully restyled)           |
| Motion     | Framer Motion (`prefers-reduced-motion` aware)    |
| Charts     | Recharts 3                                        |
| Forms      | React Hook Form + Zod 4                           |
| Auth & DB  | Supabase (`@supabase/ssr`) with clean demo mode   |
| Fonts      | Geist Sans / Geist Mono (bundled, no CDN)         |

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Without any environment variables the app runs in **demo mode**: a
deterministic, coherent dataset powers every page, auth issues a local
demo session, and billing/exports are cleanly simulated. Nothing
crashes, no external service is contacted.

### Quality gates

```bash
pnpm lint         # eslint (next/core-web-vitals + typescript)
pnpm typecheck    # tsc --noEmit
pnpm build        # production build
```

## Routes

| Route                              | Description                                        |
| ---------------------------------- | -------------------------------------------------- |
| `/`                                | Landing page (hero, demo, pricing, FAQ…)           |
| `/login` `/signup`                 | Auth (password + Google when configured)           |
| `/forgot-password` `/verify-email` | Recovery + confirmation flows                      |
| `/onboarding`                      | 5-step onboarding with animated generation         |
| `/overview`                        | Dashboard: KPIs, chart, summary, activity          |
| `/signals`                         | Rich table: filters, bulk actions, detail drawer   |
| `/intelligence`                    | Trends, anomalies with explanations, comparisons   |
| `/automations`                     | Toggleable automations, run history, creation flow |
| `/reports`                         | Generation, preview, simulated exports             |
| `/activity`                        | Filterable timeline grouped by day                 |
| `/team`                            | Members, roles, invitations, permissions           |
| `/settings/*`                      | Profile, org, appearance, notifications, security, billing, integrations, danger zone |
| `/design-system`                   | Token & component reference (development only)     |
| `/legal/privacy` `/legal/terms`    | Legal pages                                        |

Protected routes redirect to `/login` without a session (middleware).

## Architecture

```
src/
  app/                    # routes (marketing) (auth) (app) + onboarding
  components/
    ui/                   # restyled primitives (button, dialog, table…)
    halo/                 # signature: HaloField, MagneticCard, Reveal…
    marketing/ app/ …     # feature components per surface
  lib/
    data/                 # types + deterministic demo dataset + accessors
    supabase/             # browser/server clients
    auth.ts               # unified auth facade (Supabase or demo)
    demo-mode.ts          # THE demo-mode isolation point
  middleware.ts           # session refresh + route protection
supabase/migrations/      # SQL schema with RLS policies
```

### Design tokens

Every color, radius, shadow and easing lives in
`src/app/globals.css` under `@theme` — components consume tokens only
(`bg-raised`, `text-ink-secondary`, `border-edge`…). The two signature
motifs are documented at `/design-system` in development:

- **Halo Field** — a diffuse off-center bloom + faint elliptical ring
  placed behind strategic zones (primary CTA, selected KPI, active
  onboarding step, command palette, important events).
- **Magnetic Focus** — pointer-reactive borders and a few-pixel lift
  on primary cards; transform/opacity only, disabled under
  `prefers-reduced-motion`.

### Data layer

UI components import exclusively from `@/lib/data` (accessor
functions + types). The demo dataset (`src/lib/data/demo.ts`) is
deterministic — anchored to a fixed clock, seeded PRNG — and every
KPI is **derived** from the arrays, so numbers can never contradict
each other between pages. To go live: implement the accessors with
Supabase queries against the schema in `supabase/migrations/` without
touching a single component.

### Removing demo mode later

Grep for `demo-mode`. Delete `src/lib/demo-mode.ts`,
`src/lib/data/demo.ts`, and the branches referencing them
(`lib/auth.ts`, `middleware.ts`, Supabase clients, `DemoNotice`).

## Supabase setup (optional)

1. Create a project at supabase.com and run
   `supabase/migrations/0001_init.sql` (SQL editor or CLI).
2. Copy `.env.example` → `.env.local` and fill
   `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. (Optional) Enable the Google provider in Authentication →
   Providers for the "Continue with Google" button.
4. Restart. Auth, session refresh and route protection switch to
   Supabase automatically.

## Stripe

The billing page ships with a clean simulated flow (clearly labeled).
`STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are already
in `.env.example`; the simulation is isolated in
`src/app/(app)/settings/billing/` for a future real integration.

## Deploy (Vercel)

```bash
npx vercel        # link project + preview deploy
npx vercel --prod # production
```

Set the env vars from `.env.example` in the Vercel dashboard (or ship
without them — demo mode deploys cleanly). `NEXT_PUBLIC_SITE_URL`
should point at the production URL for correct metadata and auth
redirects.
