-- ESTORA required Supabase tables and security setup
create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('buyer', 'seller', 'agent', 'admin');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.listing_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text unique not null check (username ~ '^[a-zA-Z0-9_.]{3,30}$'),
  role public.user_role not null default 'buyer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null default 'Residential',
  purpose text not null check (purpose in ('sale', 'rent')),
  price numeric not null check (price >= 0),
  currency text not null default '€',
  city text not null,
  locality text,
  address text,
  beds integer not null default 0,
  baths integer not null default 0,
  area numeric,
  property_type text,
  furnished boolean not null default false,
  amenities text[] not null default '{}',
  cover_image text,
  status public.listing_status not null default 'pending',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0
);
create table if not exists public.favourites (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade, created_at timestamptz not null default now(),
  unique(user_id, property_id)
);
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(), property_id uuid references public.properties(id) on delete cascade,
  buyer_id uuid references public.profiles(id) on delete set null, name text, email text not null, phone text, message text not null,
  preferred_contact text default 'email', status text not null default 'new', created_at timestamptz not null default now()
);
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(), property_id uuid references public.properties(id) on delete cascade,
  buyer_id uuid references public.profiles(id) on delete set null, owner_id uuid references public.profiles(id) on delete set null,
  visit_date date not null, visit_time time not null, status text not null default 'pending', notes text, created_at timestamptz not null default now()
);
create table if not exists public.property_views (
  id uuid primary key default gen_random_uuid(), property_id uuid references public.properties(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null, viewed_at timestamptz not null default now()
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, message text not null, read boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(), property_id uuid references public.properties(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null, reason text not null, status text not null default 'open', created_at timestamptz not null default now()
);

create index if not exists properties_search_idx on public.properties(city, locality, status, purpose, price);
create index if not exists properties_owner_idx on public.properties(owner_id);
alter table public.enquiries add column if not exists phone text;
alter table public.enquiries add column if not exists status text default 'new';
update public.enquiries set status='new' where status is null;
alter table public.enquiries alter column status set default 'new';
alter table public.enquiries alter column status set not null;

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.favourites enable row level security;
alter table public.enquiries enable row level security;
alter table public.appointments enable row level security;
alter table public.property_views enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- Drop policies before recreating them so this script is safe to rerun.
drop policy if exists "profiles public read" on public.profiles;
drop policy if exists "profiles own update" on public.profiles;
drop policy if exists "approved properties public read" on public.properties;
drop policy if exists "owners manage properties" on public.properties;
drop policy if exists "property images public" on public.property_images;
drop policy if exists "property image owner" on public.property_images;
drop policy if exists "own favourites" on public.favourites;
drop policy if exists "buyer enquiry create" on public.enquiries;
drop policy if exists "involved users read enquiries" on public.enquiries;
drop policy if exists "appointment participants" on public.appointments;
drop policy if exists "own notifications" on public.notifications;
drop policy if exists "reports own create" on public.reports;

create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles own update" on public.profiles for update using (auth.uid() = id);
create policy "approved properties public read" on public.properties for select using (status = 'approved' or owner_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "owners manage properties" on public.properties for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "property images public" on public.property_images for select using (true);
create policy "property image owner" on public.property_images for all using (exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()));
create policy "own favourites" on public.favourites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "buyer enquiry create" on public.enquiries for insert with check (auth.uid() = buyer_id);
create policy "involved users read enquiries" on public.enquiries for select using (auth.uid() = buyer_id or exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()));
create policy "appointment participants" on public.appointments for all using (auth.uid() = buyer_id or auth.uid() = owner_id);
create policy "own notifications" on public.notifications for all using (auth.uid() = user_id);
create policy "reports own create" on public.reports for insert with check (auth.uid() = reporter_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare requested_role text := lower(coalesce(new.raw_user_meta_data->>'account_type', 'buyer'));
begin
  if requested_role not in ('buyer', 'seller', 'agent', 'admin') then requested_role := 'buyer'; end if;
  insert into public.profiles (id, full_name, username, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(coalesce(new.email, 'member'), '@', 1)),
    lower(coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''), 'user_' || substr(replace(new.id::text, '-', ''), 1, 12))),
    requested_role::public.user_role
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public) values ('property-images', 'property-images', true), ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;
