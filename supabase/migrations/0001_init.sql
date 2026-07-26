-- ════════════════════════════════════════════════════════════════
-- Halo — initial schema
-- Profiles, workspaces, membership, onboarding, preferences,
-- notifications, signals, automations and reports, with RLS.
-- ════════════════════════════════════════════════════════════════

-- ── Enums ──────────────────────────────────────────────────────
create type public.member_role as enum ('owner', 'admin', 'member', 'viewer');
create type public.member_status as enum ('active', 'invited');
create type public.signal_severity as enum ('critical', 'high', 'medium', 'low');
create type public.signal_status as enum ('new', 'investigating', 'monitoring', 'resolved');
create type public.report_status as enum ('ready', 'generating', 'scheduled');
create type public.workspace_plan as enum ('starter', 'pro', 'scale');

-- ── Profiles (1:1 with auth.users) ─────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  title text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
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
  slug text not null unique,
  plan public.workspace_plan not null default 'starter',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'member',
  status public.member_status not null default 'active',
  invited_email text,
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index workspace_members_user_idx on public.workspace_members (user_id);

-- ── Onboarding state ───────────────────────────────────────────
create table public.onboarding_state (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  step smallint not null default 1,
  completed boolean not null default false,
  company_name text,
  company_size text,
  industry text,
  goals text[] not null default '{}',
  sources text[] not null default '{}',
  alert_config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ── Preferences ────────────────────────────────────────────────
create table public.preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  appearance jsonb not null default '{"reducedMotion": false, "density": "comfortable"}'::jsonb,
  notifications jsonb not null default '{"criticalSignals": true, "weeklyDigest": true, "automationFailures": true, "mentions": true}'::jsonb,
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
  href text not null default '/',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, read, created_at desc);

-- ── Signals ────────────────────────────────────────────────────
create table public.signals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  ref text not null, -- human ref e.g. SIG-1042
  title text not null,
  description text not null default '',
  severity public.signal_severity not null default 'medium',
  status public.signal_status not null default 'new',
  source text not null default '',
  tags text[] not null default '{}',
  assignee_id uuid references public.profiles (id) on delete set null,
  impact smallint not null default 50 check (impact between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, ref)
);

create index signals_workspace_idx on public.signals (workspace_id, status, severity);

-- ── Automations ────────────────────────────────────────────────
create table public.automations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  description text not null default '',
  trigger text not null default '',
  action text not null default '',
  category text not null default 'alerting',
  enabled boolean not null default true,
  last_run_at timestamptz,
  success_rate numeric(5, 4) not null default 1,
  runs_this_week integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid not null references public.automations (id) on delete cascade,
  started_at timestamptz not null default now(),
  duration_ms integer not null default 0,
  status text not null default 'success',
  note text not null default ''
);

create index automation_runs_idx on public.automation_runs (automation_id, started_at desc);

-- ── Reports ────────────────────────────────────────────────────
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  period text not null default '',
  status public.report_status not null default 'scheduled',
  pages smallint not null default 0,
  format text not null default 'PDF',
  highlights text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.onboarding_state enable row level security;
alter table public.preferences enable row level security;
alter table public.notifications enable row level security;
alter table public.signals enable row level security;
alter table public.automations enable row level security;
alter table public.automation_runs enable row level security;
alter table public.reports enable row level security;

-- Membership helper (security definer avoids recursive RLS)
create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql
security definer set search_path = ''
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid() and status = 'active'
  );
$$;

-- Profiles: users manage their own row; members can read teammates
create policy "read own profile" on public.profiles
  for select using (id = auth.uid());
create policy "update own profile" on public.profiles
  for update using (id = auth.uid());

-- Workspaces
create policy "members read workspace" on public.workspaces
  for select using (public.is_workspace_member(id));
create policy "authenticated create workspace" on public.workspaces
  for insert with check (auth.uid() is not null);
create policy "owner updates workspace" on public.workspaces
  for update using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = id and user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Members
create policy "members read membership" on public.workspace_members
  for select using (public.is_workspace_member(workspace_id));
create policy "admins manage membership" on public.workspace_members
  for all using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- Per-user tables
create policy "own onboarding" on public.onboarding_state
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own preferences" on public.preferences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own notifications" on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Workspace-scoped tables
create policy "members read signals" on public.signals
  for select using (public.is_workspace_member(workspace_id));
create policy "members write signals" on public.signals
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "members read automations" on public.automations
  for select using (public.is_workspace_member(workspace_id));
create policy "members write automations" on public.automations
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "members read runs" on public.automation_runs
  for select using (
    exists (
      select 1 from public.automations a
      where a.id = automation_id and public.is_workspace_member(a.workspace_id)
    )
  );

create policy "members read reports" on public.reports
  for select using (public.is_workspace_member(workspace_id));
create policy "members write reports" on public.reports
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
