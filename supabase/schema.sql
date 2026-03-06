-- ATS Resume Optimizer — Supabase Schema
-- Run this in Supabase SQL Editor to initialize the database

-- Users table (synced from Supabase Auth on first login)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  credits_used integer not null default 0,
  credits_reset date not null default (date_trunc('month', now()) + interval '1 month')::date,
  ls_customer_id text,
  ls_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Analyses table
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  job_title text,
  company_name text,
  match_score integer not null check (match_score >= 0 and match_score <= 100),
  grade text not null check (grade in ('A', 'B', 'C', 'D')),
  missing_keywords text[] default '{}',
  section_feedback jsonb,
  format_warnings text[] default '{}',
  optimized_resume text,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.analyses enable row level security;

-- Users can only read/update their own row
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Service role can do anything (for API routes using service key)
create policy "service_all_users" on public.users
  for all using (auth.role() = 'service_role');

create policy "service_all_analyses" on public.analyses
  for all using (auth.role() = 'service_role');

-- Users can read their own analyses
create policy "analyses_select_own" on public.analyses
  for select using (auth.uid() = user_id);

-- Indexes
create index if not exists analyses_user_id_idx on public.analyses(user_id);
create index if not exists analyses_created_at_idx on public.analyses(created_at desc);

-- Auto-update updated_at on users
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();
