-- Worklog Portal schema
-- Run this in the Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  client_name text not null,
  description text,
  hourly_rate numeric(10,2) not null default 0,
  currency text not null default 'RON',
  status text not null default 'active' check (status in ('active', 'paused', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.project_viewers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  viewer_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, viewer_user_id)
);

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  work_date date not null,
  hours numeric(8,2) not null check (hours >= 0),
  notes text,
  category text,
  billable boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  period_label text not null,
  total_amount numeric(10,2) not null default 0,
  status text not null default 'unpaid' check (status in ('unpaid', 'partial', 'paid')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    'viewer'
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_viewers enable row level security;
alter table public.time_entries enable row level security;
alter table public.payments enable row level security;

-- profiles
create policy "users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- projects
create policy "admins can view own projects"
on public.projects for select
using (owner_user_id = auth.uid());

create policy "viewers can view assigned projects"
on public.projects for select
using (
  exists (
    select 1 from public.project_viewers pv
    where pv.project_id = projects.id
      and pv.viewer_user_id = auth.uid()
  )
);

create policy "admins can insert own projects"
on public.projects for insert
with check (owner_user_id = auth.uid());

create policy "admins can update own projects"
on public.projects for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "admins can delete own projects"
on public.projects for delete
using (owner_user_id = auth.uid());

-- project_viewers
create policy "admins can view project viewers for owned projects"
on public.project_viewers for select
using (
  exists (
    select 1 from public.projects p
    where p.id = project_viewers.project_id
      and p.owner_user_id = auth.uid()
  )
  or viewer_user_id = auth.uid()
);

create policy "admins can insert project viewers for owned projects"
on public.project_viewers for insert
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_viewers.project_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "admins can delete project viewers for owned projects"
on public.project_viewers for delete
using (
  exists (
    select 1 from public.projects p
    where p.id = project_viewers.project_id
      and p.owner_user_id = auth.uid()
  )
);

-- time_entries
create policy "admins can view time entries for owned projects"
on public.time_entries for select
using (
  exists (
    select 1 from public.projects p
    where p.id = time_entries.project_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "viewers can view time entries for assigned projects"
on public.time_entries for select
using (
  exists (
    select 1 from public.project_viewers pv
    where pv.project_id = time_entries.project_id
      and pv.viewer_user_id = auth.uid()
  )
);

create policy "admins can insert time entries for owned projects"
on public.time_entries for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.projects p
    where p.id = time_entries.project_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "admins can update time entries for owned projects"
on public.time_entries for update
using (
  exists (
    select 1 from public.projects p
    where p.id = time_entries.project_id
      and p.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = time_entries.project_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "admins can delete time entries for owned projects"
on public.time_entries for delete
using (
  exists (
    select 1 from public.projects p
    where p.id = time_entries.project_id
      and p.owner_user_id = auth.uid()
  )
);

-- payments
create policy "admins can manage payments for owned projects"
on public.payments for all
using (
  exists (
    select 1 from public.projects p
    where p.id = payments.project_id
      and p.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = payments.project_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "viewers can read payments for assigned projects"
on public.payments for select
using (
  exists (
    select 1 from public.project_viewers pv
    where pv.project_id = payments.project_id
      and pv.viewer_user_id = auth.uid()
  )
);
