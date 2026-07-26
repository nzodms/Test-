-- ════════════════════════════════════════════════════════════════
-- Argus — initial schema
--
-- Content protection for creators and the agencies representing
-- them. Detailed findings are readable only by verified owners and
-- their authorised members: that rule is enforced in RLS, not in the
-- application layer.
-- ════════════════════════════════════════════════════════════════

create type public.account_type as enum ('creator', 'agency');
create type public.member_role as enum ('owner', 'admin', 'member');
create type public.source_kind as enum ('website', 'forum', 'mirror', 'channel', 'archive');
create type public.confidence as enum ('high', 'medium', 'low');
create type public.match_state as enum ('possible', 'review', 'confirmed', 'dismissed');
create type public.takedown_status as enum ('drafted', 'submitted', 'acknowledged', 'removed', 'rejected');
create type public.verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
create type public.verification_method as enum ('profile_link', 'temporary_code', 'connected_account', 'manual_review');

-- ── Profiles (1:1 with auth.users) ─────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  account_type public.account_type not null default 'creator',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Workspaces & membership ────────────────────────────────────
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_type public.account_type not null default 'creator',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index workspace_members_user_idx on public.workspace_members (user_id);

-- ── Monitored profiles — the public identities under protection ─
create table public.monitored_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  username text not null,
  platform text not null default 'other',
  profile_url text,
  -- Detailed findings unlock only when this reaches 'verified'.
  verification public.verification_status not null default 'unverified',
  verification_method public.verification_method,
  verified_at timestamptz,
  paused boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workspace_id, username, platform)
);

create index monitored_profiles_ws_idx on public.monitored_profiles (workspace_id);

-- ── Scans ──────────────────────────────────────────────────────
create table public.scans (
  id uuid primary key default gen_random_uuid(),
  monitored_profile_id uuid not null references public.monitored_profiles (id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  sources_checked integer not null default 0,
  matches_found integer not null default 0
);

create index scans_profile_idx on public.scans (monitored_profile_id, started_at desc);

-- ── Sources & matches ──────────────────────────────────────────
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  domain text not null,
  kind public.source_kind not null default 'website',
  muted boolean not null default false,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (workspace_id, domain)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  monitored_profile_id uuid not null references public.monitored_profiles (id) on delete cascade,
  source_id uuid not null references public.sources (id) on delete cascade,
  scan_id uuid references public.scans (id) on delete set null,
  -- The exact location is sensitive: gated by RLS below.
  url text not null,
  match_type text not null default '',
  confidence public.confidence not null default 'medium',
  confidence_score smallint not null default 50 check (confidence_score between 0 and 100),
  state public.match_state not null default 'possible',
  detected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index matches_profile_idx on public.matches (monitored_profile_id, detected_at desc);
create index matches_state_idx on public.matches (monitored_profile_id, state, confidence);

-- Recurrence: a match that reappears after a removal is linked back
-- to the original case rather than filed as a new finding.
create table public.match_recurrences (
  id uuid primary key default gen_random_uuid(),
  original_match_id uuid not null references public.matches (id) on delete cascade,
  recurred_match_id uuid not null references public.matches (id) on delete cascade,
  detected_at timestamptz not null default now(),
  unique (original_match_id, recurred_match_id)
);

-- ── Takedowns ──────────────────────────────────────────────────
create table public.takedowns (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  status public.takedown_status not null default 'drafted',
  reference text not null,
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  notes text not null default ''
);

create index takedowns_match_idx on public.takedowns (match_id);

-- ── Monitoring preferences & onboarding ────────────────────────
create table public.monitoring_prefs (
  workspace_id uuid primary key references public.workspaces (id) on delete cascade,
  frequency text not null default 'weekly',
  coverage text not null default 'standard',
  high_confidence_alerts boolean not null default true,
  weekly_summary boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.onboarding_state (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  step smallint not null default 1,
  completed boolean not null default false,
  account_type public.account_type,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ── Notifications ──────────────────────────────────────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  workspace_id uuid references public.workspaces (id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null default '',
  href text not null default '/dashboard',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, read, created_at desc);

-- ════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.monitored_profiles enable row level security;
alter table public.scans enable row level security;
alter table public.sources enable row level security;
alter table public.matches enable row level security;
alter table public.match_recurrences enable row level security;
alter table public.takedowns enable row level security;
alter table public.monitoring_prefs enable row level security;
alter table public.onboarding_state enable row level security;
alter table public.notifications enable row level security;

-- Membership helper (security definer avoids recursive RLS)
create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql
security definer set search_path = ''
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

-- A monitored profile is readable in detail only once ownership is
-- verified. This is the product's core rule, enforced in the database.
create or replace function public.can_read_findings(mp uuid)
returns boolean
language sql
security definer set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.monitored_profiles p
    join public.workspace_members m on m.workspace_id = p.workspace_id
    where p.id = mp
      and m.user_id = auth.uid()
      and p.verification = 'verified'
  );
$$;

-- Profiles
create policy "read own profile" on public.profiles
  for select using (id = auth.uid());
create policy "update own profile" on public.profiles
  for update using (id = auth.uid());

-- Workspaces
create policy "members read workspace" on public.workspaces
  for select using (public.is_workspace_member(id));
create policy "authenticated create workspace" on public.workspaces
  for insert with check (auth.uid() is not null);
create policy "admins update workspace" on public.workspaces
  for update using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = id and user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Membership
create policy "members read membership" on public.workspace_members
  for select using (public.is_workspace_member(workspace_id));
create policy "admins manage membership" on public.workspace_members
  for all using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- Monitored profiles: members may see and manage the entries
-- themselves (username, verification state) regardless of
-- verification — it is the FINDINGS that are gated.
create policy "members read monitored profiles" on public.monitored_profiles
  for select using (public.is_workspace_member(workspace_id));
create policy "members write monitored profiles" on public.monitored_profiles
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- Scans follow their monitored profile
create policy "members read scans" on public.scans
  for select using (
    exists (
      select 1 from public.monitored_profiles p
      where p.id = monitored_profile_id
        and public.is_workspace_member(p.workspace_id)
    )
  );

-- Sources are workspace-scoped metadata
create policy "members read sources" on public.sources
  for select using (public.is_workspace_member(workspace_id));
create policy "members write sources" on public.sources
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- Matches carry exact URLs — verified ownership required
create policy "verified owners read matches" on public.matches
  for select using (public.can_read_findings(monitored_profile_id));
create policy "verified owners write matches" on public.matches
  for all using (public.can_read_findings(monitored_profile_id))
  with check (public.can_read_findings(monitored_profile_id));

create policy "verified owners read recurrences" on public.match_recurrences
  for select using (
    exists (
      select 1 from public.matches m
      where m.id = original_match_id
        and public.can_read_findings(m.monitored_profile_id)
    )
  );

-- Takedowns act on a match, so they inherit the same gate
create policy "verified owners read takedowns" on public.takedowns
  for select using (
    exists (
      select 1 from public.matches m
      where m.id = match_id and public.can_read_findings(m.monitored_profile_id)
    )
  );
create policy "verified owners write takedowns" on public.takedowns
  for all using (
    exists (
      select 1 from public.matches m
      where m.id = match_id and public.can_read_findings(m.monitored_profile_id)
    )
  )
  with check (
    exists (
      select 1 from public.matches m
      where m.id = match_id and public.can_read_findings(m.monitored_profile_id)
    )
  );

-- Workspace settings
create policy "members read monitoring prefs" on public.monitoring_prefs
  for select using (public.is_workspace_member(workspace_id));
create policy "members write monitoring prefs" on public.monitoring_prefs
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- Per-user
create policy "own onboarding" on public.onboarding_state
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own notifications" on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
