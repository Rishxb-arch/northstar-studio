-- Northstar Studio waitlist table for Supabase
-- Run this in Supabase Dashboard → SQL Editor.

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

alter table public.waitlist enable row level security;

-- Keep public anon clients from reading/writing directly.
-- The Vercel serverless function inserts using SUPABASE_SERVICE_ROLE_KEY.
