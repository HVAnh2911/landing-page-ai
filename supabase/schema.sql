-- TrangDich.vn — Supabase Schema
-- Run this in the Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase Auth)
-- ============================================================
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text not null,
  full_name   text,
  plan        text not null default 'free' check (plan in ('free', 'pro', 'business')),
  is_admin    boolean not null default false,
  pages_used  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- GENERATED PAGES
-- ============================================================
create table if not exists public.pages (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.profiles(id) on delete cascade,
  -- Generator input
  industry        text not null,
  brand           text not null,
  tagline         text,
  usp             text not null,
  phone           text not null,
  address         text,
  color_primary   text not null default '#2563eb',
  color_accent    text not null default '#f59e0b',
  -- AI output
  content         jsonb not null,
  unsplash_url    text,
  -- Publishing
  slug            text unique,
  is_published    boolean not null default false,
  custom_domain   text,
  -- Meta
  view_count      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index for subdomain lookup
create index if not exists pages_slug_idx on public.pages(slug);
create index if not exists pages_user_id_idx on public.pages(user_id);

-- ============================================================
-- LEADS (visitors who tap CTA on a published page)
-- ============================================================
create table if not exists public.leads (
  id          uuid default uuid_generate_v4() primary key,
  page_id     uuid references public.pages(id) on delete cascade not null,
  name        text,
  phone       text,
  message     text,
  source      text default 'cta_button',
  ip_address  inet,
  created_at  timestamptz not null default now()
);

create index if not exists leads_page_id_idx on public.leads(page_id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table if not exists public.subscriptions (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references public.profiles(id) on delete cascade not null,
  plan                text not null check (plan in ('pro', 'business')),
  status              text not null check (status in ('active', 'cancelled', 'past_due')),
  stripe_customer_id  text,
  stripe_sub_id       text,
  current_period_end  timestamptz,
  created_at          timestamptz not null default now()
);

create unique index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles: users can only read/write their own
alter table public.profiles enable row level security;
create policy "profiles_self" on public.profiles
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Pages: owner full access; admin sees all; published pages are public-readable
alter table public.pages enable row level security;
create policy "pages_owner" on public.pages
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "pages_admin" on public.pages
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
create policy "pages_public_read" on public.pages
  for select using (is_published = true);

-- Leads: page owner can read; anyone can insert
alter table public.leads enable row level security;
create policy "leads_insert" on public.leads
  for insert with check (true);
create policy "leads_owner_read" on public.leads
  for select using (
    exists (
      select 1 from public.pages p
      where p.id = page_id and p.user_id = auth.uid()
    )
  );

-- Subscriptions: owner only
alter table public.subscriptions enable row level security;
create policy "subscriptions_owner" on public.subscriptions
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
