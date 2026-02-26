-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table if not exists
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  avatar_url text,
  rank text default 'ROOKIE',
  trips_count integer default 0,
  countries_count integer default 0,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for profiles
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Create trip_members table for collaboration
create table if not exists public.trip_members (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'viewer' check (role in ('owner', 'editor', 'viewer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(trip_id, user_id)
);

-- Enable RLS
alter table public.trip_members enable row level security;

-- Policies for trip_members
drop policy if exists "Trip members are viewable by members" on public.trip_members;
create policy "Trip members are viewable by members" on public.trip_members
  for select using (
    auth.uid() in (
      select user_id from public.trip_members where trip_id = public.trip_members.trip_id
    )
  );

drop policy if exists "Owners can manage members" on public.trip_members;
create policy "Owners can manage members" on public.trip_members
  for all using (
    auth.uid() in (
      select user_id from public.trip_members where trip_id = public.trip_members.trip_id and role = 'owner'
    )
  );

-- Update Trips policies to include members
drop policy if exists "Trips are viewable by everyone" on public.trips;
drop policy if exists "Enable insert for all users" on public.trips;
drop policy if exists "Enable update for all users" on public.trips;
drop policy if exists "Enable delete for all users" on public.trips;

drop policy if exists "Trips are viewable by members" on public.trips;
create policy "Trips are viewable by members" on public.trips
  for select using (
    auth.uid() in (select user_id from public.trip_members where trip_id = id)
    or
    created_by = auth.uid() -- Fallback for legacy or if member record missing
  );

drop policy if exists "Trips can be inserted by authenticated users" on public.trips;
create policy "Trips can be inserted by authenticated users" on public.trips
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Trips can be updated by owners and editors" on public.trips;
create policy "Trips can be updated by owners and editors" on public.trips
  for update using (
    auth.uid() in (select user_id from public.trip_members where trip_id = id and role in ('owner', 'editor'))
    or
    created_by = auth.uid()
  );

drop policy if exists "Trips can be deleted by owners" on public.trips;
create policy "Trips can be deleted by owners" on public.trips
  for delete using (
    auth.uid() in (select user_id from public.trip_members where trip_id = id and role = 'owner')
    or
    created_by = auth.uid()
  );

-- Update Itinerary Items policies
drop policy if exists "Itinerary items are viewable by everyone" on public.itinerary_items;
drop policy if exists "Enable insert for all users" on public.itinerary_items;
drop policy if exists "Enable update for all users" on public.itinerary_items;
drop policy if exists "Enable delete for all users" on public.itinerary_items;

drop policy if exists "Itinerary items viewable by trip members" on public.itinerary_items;
create policy "Itinerary items viewable by trip members" on public.itinerary_items
  for select using (
    exists (
      select 1 from public.trip_members 
      where trip_id = public.itinerary_items.trip_id 
      and user_id = auth.uid()
    )
    or
    exists (
      select 1 from public.trips
      where id = public.itinerary_items.trip_id
      and created_by = auth.uid()
    )
  );

drop policy if exists "Itinerary items insertable by editors" on public.itinerary_items;
create policy "Itinerary items insertable by editors" on public.itinerary_items
  for insert with check (
    exists (
      select 1 from public.trip_members 
      where trip_id = public.itinerary_items.trip_id 
      and user_id = auth.uid()
      and role in ('owner', 'editor')
    )
    or
    exists (
      select 1 from public.trips
      where id = public.itinerary_items.trip_id
      and created_by = auth.uid()
    )
  );

drop policy if exists "Itinerary items updatable by editors" on public.itinerary_items;
create policy "Itinerary items updatable by editors" on public.itinerary_items
  for update using (
    exists (
      select 1 from public.trip_members 
      where trip_id = public.itinerary_items.trip_id 
      and user_id = auth.uid()
      and role in ('owner', 'editor')
    )
    or
    exists (
      select 1 from public.trips
      where id = public.itinerary_items.trip_id
      and created_by = auth.uid()
    )
  );

drop policy if exists "Itinerary items deletable by editors" on public.itinerary_items;
create policy "Itinerary items deletable by editors" on public.itinerary_items
  for delete using (
    exists (
      select 1 from public.trip_members 
      where trip_id = public.itinerary_items.trip_id 
      and user_id = auth.uid()
      and role in ('owner', 'editor')
    )
    or
    exists (
      select 1 from public.trips
      where id = public.itinerary_items.trip_id
      and created_by = auth.uid()
    )
  );

-- Trigger to automatically add creator as owner in trip_members
create or replace function public.handle_new_trip() 
returns trigger as $$
begin
  insert into public.trip_members (trip_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_trip_created on public.trips;
create trigger on_trip_created
  after insert on public.trips
  for each row execute procedure public.handle_new_trip();

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Add unique constraint to username (idempotent way)
alter table public.profiles drop constraint if exists profiles_username_key;
alter table public.profiles add constraint profiles_username_key unique (username);

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles for existing users (Run this once)
insert into public.profiles (id, username, avatar_url)
select id, raw_user_meta_data->>'username', raw_user_meta_data->>'avatar_url'
from auth.users
where id not in (select id from public.profiles);

-- Backfill trip owners for existing trips (Run this once)
insert into public.trip_members (trip_id, user_id, role)
select t.id, t.created_by, 'owner'
from public.trips t
where not exists (
  select 1 from public.trip_members tm where tm.trip_id = t.id
)
and exists (
  select 1 from public.profiles p where p.id = t.created_by
);
