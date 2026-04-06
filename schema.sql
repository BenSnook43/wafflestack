-- WaffleStack Database Schema
-- Run this in the Supabase SQL Editor to set up the database.
-- Update this file whenever the schema changes.

-- Users
-- `active` = user's own pause/unsubscribe toggle (user-controlled).
-- `subscription_status` = billing state (system-controlled).
-- n8n sends only to users where active=true AND subscription_status IN ('trialing','active').
create table public.users (
  id                      uuid primary key default gen_random_uuid(),
  email                   text not null unique,
  created_at              timestamptz not null default now(),
  active                  boolean not null default true,

  -- Billing / trial
  trial_ends_at           timestamptz not null default (now() + interval '30 days'),
  subscription_status     text not null default 'trialing'
                          check (subscription_status in ('trialing','active','past_due','cancelled')),
  emails_sent             integer not null default 0,
  last_email_sent_at      timestamptz,
  cancelled_at            timestamptz,

  -- Stripe (Phase 4 — nullable until wired up)
  stripe_customer_id      text unique,
  stripe_subscription_id  text
);

-- Preferences
-- Each connector gets its own column — n8n checks IS NOT NULL / non-empty to decide what to fetch.
-- section_order controls the display order of sections in the email.
-- settings is reserved for future non-connector preferences (send_time, tone, formatting).
create table public.preferences (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  location      text,
  subreddits    text[] default '{}',
  stocks        text[] default '{}',
  rss_feeds     text[] default '{}',
  hacker_news   boolean not null default false,
  section_order text[] default '{}',
  settings      jsonb not null default '{}',
  updated_at    timestamptz not null default now()
);

create unique index preferences_user_id_idx on public.preferences(user_id);

-- OAuth tokens (Phase 3 — Google Calendar, Gmail)
create table public.oauth_tokens (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  provider      text not null,  -- 'google_calendar', 'gmail', etc.
  access_token  text not null,
  refresh_token text,
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index oauth_tokens_user_provider_idx on public.oauth_tokens(user_id, provider);

-- RLS: allow anonymous inserts for the signup form
-- n8n uses the service role key and bypasses RLS entirely
alter table public.users enable row level security;
alter table public.preferences enable row level security;

create policy "allow anon insert" on public.users
  for insert to anon with check (true);

create policy "allow anon insert" on public.preferences
  for insert to anon with check (true);

-- RLS: authenticated users can read and update their own records
-- Note: auth.jwt() ->> 'email' reads the email from the Supabase session JWT
create policy "users: read own" on public.users
  for select to authenticated
  using (email = auth.jwt() ->> 'email');

create policy "users: update own" on public.users
  for update to authenticated
  using (email = auth.jwt() ->> 'email');

create policy "preferences: read own" on public.preferences
  for select to authenticated
  using (user_id = (select id from public.users where email = auth.jwt() ->> 'email'));

create policy "preferences: update own" on public.preferences
  for update to authenticated
  using (user_id = (select id from public.users where email = auth.jwt() ->> 'email'));
