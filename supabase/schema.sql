-- ============================================================
-- TheDropZone Database Schema
-- Run in: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

grant select on public.profiles to anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup (populates from Google OAuth metadata)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROOMS
-- ============================================================
create table public.rooms (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  invite_code uuid default uuid_generate_v4() unique not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.rooms enable row level security;

grant select on public.rooms to anon;
grant select, insert, update, delete on public.rooms to authenticated;
grant select, insert, update, delete on public.rooms to service_role;

-- ============================================================
-- ROOM MEMBERS
-- ============================================================
create table public.room_members (
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);
alter table public.room_members enable row level security;

grant select on public.room_members to anon;
grant select, insert, update, delete on public.room_members to authenticated;
grant select, insert, update, delete on public.room_members to service_role;

-- RLS: rooms are visible only to members of that room
create policy "Room members can view rooms" on public.rooms
  for select using (
    exists (
      select 1 from public.room_members
      where room_members.room_id = rooms.id
      and room_members.user_id = auth.uid()
    )
  );

-- RLS: only members can see who else is in a room
create policy "Members can see room membership" on public.room_members
  for select using (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = room_members.room_id
      and rm.user_id = auth.uid()
    )
  );

-- ============================================================
-- TOPICS
-- ============================================================
create table public.topics (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.rooms(id) on delete cascade,
  name text not null,
  emoji text default '📌',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.topics enable row level security;

grant select on public.topics to anon;
grant select, insert, update, delete on public.topics to authenticated;
grant select, insert, update, delete on public.topics to service_role;

create policy "Room members can view topics" on public.topics
  for select using (
    exists (
      select 1 from public.room_members
      where room_members.room_id = topics.room_id
      and room_members.user_id = auth.uid()
    )
  );

create policy "Room members can insert topics" on public.topics
  for insert with check (
    exists (
      select 1 from public.room_members
      where room_members.room_id = topics.room_id
      and room_members.user_id = auth.uid()
    )
  );

-- ============================================================
-- ENTRIES
-- ============================================================
create table public.entries (
  id uuid default uuid_generate_v4() primary key,
  topic_id uuid references public.topics(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete cascade,
  content jsonb not null,  -- Tiptap JSON document format
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.entries enable row level security;

grant select on public.entries to anon;
grant select, insert, update, delete on public.entries to authenticated;
grant select, insert, update, delete on public.entries to service_role;

create policy "Room members can view entries" on public.entries
  for select using (
    exists (
      select 1 from public.room_members
      where room_members.room_id = entries.room_id
      and room_members.user_id = auth.uid()
    )
  );

create policy "Room members can insert entries" on public.entries
  for insert with check (
    exists (
      select 1 from public.room_members
      where room_members.room_id = entries.room_id
      and room_members.user_id = auth.uid()
    )
  );

create policy "Entry authors can update their own entries" on public.entries
  for update using (auth.uid() = created_by);

create policy "Entry authors can delete their own entries" on public.entries
  for delete using (auth.uid() = created_by);
