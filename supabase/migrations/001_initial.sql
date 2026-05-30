-- ============================================================================
-- 1776 CrossFit Surmount Challenge Tracker — Initial schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query),
-- or via the Supabase CLI: `supabase db push`.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enum: the three challenge movements
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'movement_type') then
    create type movement_type as enum ('pushups', 'situps', 'airsquats');
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- Table: users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  google_id   text unique not null,
  name        text not null,
  email       text unique not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Table: rep_entries
-- ---------------------------------------------------------------------------
create table if not exists public.rep_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  movement    movement_type not null,
  reps        integer not null check (reps > 0),
  entry_date  date not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists rep_entries_user_id_idx on public.rep_entries (user_id);
create index if not exists rep_entries_entry_date_idx on public.rep_entries (entry_date);
create index if not exists rep_entries_movement_idx on public.rep_entries (movement);

-- ---------------------------------------------------------------------------
-- Trigger: keep updated_at fresh on every UPDATE
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists rep_entries_set_updated_at on public.rep_entries;
create trigger rep_entries_set_updated_at
  before update on public.rep_entries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- This app talks to the database exclusively from the server using the
-- Supabase SERVICE ROLE key, which bypasses RLS. We still enable RLS so that
-- the public anon key (which is shipped to the browser) cannot read or write
-- these tables directly. No anon/public policies are created on purpose.
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.rep_entries enable row level security;
