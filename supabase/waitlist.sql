-- Northstar Studio product backend schema for Supabase
-- Run this in Supabase Dashboard → SQL Editor.
-- Public clients should not access these tables directly; Vercel API uses SUPABASE_SERVICE_ROLE_KEY server-side.

create extension if not exists pgcrypto;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  handle text,
  niche text not null,
  platform text default 'Instagram/TikTok',
  source text default 'website',
  user_agent text,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_unique
  on public.waitlist (lower(email));

-- Primary working product persistence table.
-- Stores the full creator workspace document so the app flow works reliably before over-normalizing.
create table if not exists public.creator_workspaces (
  id uuid primary key default gen_random_uuid(),
  user_key text not null unique,
  inputs jsonb not null default '{}'::jsonb,
  workspace jsonb not null default '{}'::jsonb,
  task_statuses jsonb not null default '{}'::jsonb,
  active_idea_index integer not null default 0,
  analytics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creator_workspaces_user_key_idx
  on public.creator_workspaces (user_key);

-- Normalized tables for the next product phase. The current frontend does not require these yet.
create table if not exists public.creator_profiles (
  id uuid primary key default gen_random_uuid(),
  user_key text not null unique,
  handle text not null,
  niche text not null,
  primary_platform text not null default 'Both',
  positioning text,
  monetization_goal text,
  content_pillars jsonb not null default '[]'::jsonb,
  voice_traits jsonb not null default '[]'::jsonb,
  brand_categories jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_integrations (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  provider text not null,
  status text not null default 'disconnected',
  scopes jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_key, provider)
);

create table if not exists public.content_ideas (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  title text not null,
  tag text,
  hook text,
  length text,
  score integer,
  status text not null default 'backlog',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_briefs (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  idea_id text,
  title text not null,
  markdown text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sprint_tasks (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  task_key text not null,
  day text,
  focus text,
  task text not null,
  status text not null default 'todo',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_key, task_key)
);

create table if not exists public.calendar_items (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  slot text not null,
  title text not null,
  platform text,
  status text not null default 'scheduled',
  linked_task_id text,
  linked_idea_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  brand text not null,
  category text,
  fit integer,
  stage text not null default 'research',
  outreach_angle text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  views integer not null default 0,
  saves integer not null default 0,
  shares integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists creator_profiles_user_key_idx on public.creator_profiles (user_key);
create index if not exists creator_integrations_user_key_idx on public.creator_integrations (user_key);
create index if not exists content_ideas_user_key_idx on public.content_ideas (user_key);
create index if not exists content_briefs_user_key_idx on public.content_briefs (user_key);
create index if not exists sprint_tasks_user_key_idx on public.sprint_tasks (user_key);
create index if not exists calendar_items_user_key_idx on public.calendar_items (user_key);
create index if not exists brand_opportunities_user_key_idx on public.brand_opportunities (user_key);
create index if not exists performance_snapshots_user_key_idx on public.performance_snapshots (user_key);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists creator_workspaces_set_updated_at on public.creator_workspaces;
create trigger creator_workspaces_set_updated_at before update on public.creator_workspaces for each row execute function public.set_updated_at();
drop trigger if exists creator_profiles_set_updated_at on public.creator_profiles;
create trigger creator_profiles_set_updated_at before update on public.creator_profiles for each row execute function public.set_updated_at();
drop trigger if exists creator_integrations_set_updated_at on public.creator_integrations;
create trigger creator_integrations_set_updated_at before update on public.creator_integrations for each row execute function public.set_updated_at();
drop trigger if exists content_ideas_set_updated_at on public.content_ideas;
create trigger content_ideas_set_updated_at before update on public.content_ideas for each row execute function public.set_updated_at();
drop trigger if exists content_briefs_set_updated_at on public.content_briefs;
create trigger content_briefs_set_updated_at before update on public.content_briefs for each row execute function public.set_updated_at();
drop trigger if exists sprint_tasks_set_updated_at on public.sprint_tasks;
create trigger sprint_tasks_set_updated_at before update on public.sprint_tasks for each row execute function public.set_updated_at();
drop trigger if exists calendar_items_set_updated_at on public.calendar_items;
create trigger calendar_items_set_updated_at before update on public.calendar_items for each row execute function public.set_updated_at();
drop trigger if exists brand_opportunities_set_updated_at on public.brand_opportunities;
create trigger brand_opportunities_set_updated_at before update on public.brand_opportunities for each row execute function public.set_updated_at();

alter table public.waitlist enable row level security;
alter table public.creator_workspaces enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.creator_integrations enable row level security;
alter table public.content_ideas enable row level security;
alter table public.content_briefs enable row level security;
alter table public.sprint_tasks enable row level security;
alter table public.calendar_items enable row level security;
alter table public.brand_opportunities enable row level security;
alter table public.performance_snapshots enable row level security;
