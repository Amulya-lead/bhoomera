-- Run this in Supabase SQL Editor once.
-- Creates or updates the viewing request table used by ESTORA.
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  buyer_id uuid references public.profiles(id) on delete set null,
  name text,
  email text not null,
  phone text,
  message text not null,
  preferred_contact text default 'email',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.enquiries add column if not exists name text;
alter table public.enquiries add column if not exists email text;
alter table public.enquiries add column if not exists phone text;
alter table public.enquiries add column if not exists message text;
alter table public.enquiries add column if not exists preferred_contact text default 'email';
alter table public.enquiries add column if not exists status text default 'new';
alter table public.enquiries alter column status set default 'new';
update public.enquiries set status = 'new' where status is null;
alter table public.enquiries alter column status set not null;

alter table public.enquiries enable row level security;

drop policy if exists "service role can manage viewing requests" on public.enquiries;
create policy "service role can manage viewing requests"
on public.enquiries for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create index if not exists enquiries_created_idx on public.enquiries(created_at desc);
create index if not exists enquiries_status_idx on public.enquiries(status);
