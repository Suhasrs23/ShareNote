---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Scaffold Next.js App + Supabase DB Schema

## Objective
Bootstrap the ShareNote project using the official Supabase Next.js template (which pre-wires `@supabase/ssr`, middleware, and App Router), then create the Supabase project and run the full database schema SQL.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- .gsd/phases/1/RESEARCH.md

## Pre-requisites (Human Steps — Do These First)

> These require accounts and browser actions. Do them before running `/execute 1`.

1. **Create a Supabase project** at https://supabase.com → New Project → note the **Project URL** and **anon public key** from Project Settings > API
2. **Create a Google Cloud project** at https://console.cloud.google.com:
   - APIs & Services > Credentials > Create OAuth 2.0 Client ID (Web Application)
   - Add Authorized redirect URIs: `http://localhost:3000/auth/callback`
   - Copy **Client ID** and **Client Secret**
3. **Enable Google in Supabase**: Dashboard > Authentication > Providers > Google → paste Client ID + Secret → Save

## Tasks

<task type="auto">
  <name>Scaffold Next.js app with Supabase template</name>
  <files>
    ./package.json
    ./app/
    ./lib/
    ./middleware.ts
    ./utils/supabase/
  </files>
  <action>
    Run this command from the ShareNote directory:
    ```
    npx create-next-app@latest -e with-supabase ./ --use-npm
    ```
    When prompted about existing files, choose to overwrite/merge (the template will add source files alongside existing .gsd/ and .gitignore).

    After scaffolding, verify these files exist:
    - `utils/supabase/client.ts` — browser Supabase client
    - `utils/supabase/server.ts` — server Supabase client
    - `middleware.ts` — session refresh middleware
    - `app/auth/callback/route.ts` — OAuth callback handler

    Do NOT rename or restructure the template's folder layout.
  </action>
  <verify>
    Run: `npm run dev` — should start on localhost:3000 without errors (will show Supabase demo page).
  </verify>
  <done>
    - `package.json` contains `@supabase/ssr` as a dependency
    - `middleware.ts` exists at root
    - `npm run dev` starts without crashing
  </done>
</task>

<task type="auto">
  <name>Create .env.local with Supabase credentials</name>
  <files>
    .env.local
  </files>
  <action>
    Create `.env.local` at the project root with:
    ```
    NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
    ```
    Replace values with real credentials from Supabase Dashboard > Project Settings > API.

    IMPORTANT: `.env.local` is already in `.gitignore` — never commit it.
  </action>
  <verify>
    Run: `npm run dev` — the Supabase demo login page at localhost:3000 should load without "Missing Supabase env variables" error.
  </verify>
  <done>
    - `.env.local` exists with real SUPABASE_URL and ANON_KEY
    - Dev server starts and Supabase connection is live (no env errors in terminal)
  </done>
</task>

<task type="auto">
  <name>Run database schema SQL in Supabase</name>
  <files>
    supabase/schema.sql (new file to create)
  </files>
  <action>
    Create file `supabase/schema.sql` with the following SQL, then run it in the Supabase Dashboard > SQL Editor:

    ```sql
    -- Enable UUID extension
    create extension if not exists "uuid-ossp";

    -- Profiles (extends auth.users)
    create table public.profiles (
      id uuid references auth.users(id) on delete cascade primary key,
      display_name text,
      avatar_url text,
      created_at timestamptz default now()
    );
    alter table public.profiles enable row level security;
    create policy "Users can view their own profile" on public.profiles
      for select using (auth.uid() = id);
    create policy "Users can update their own profile" on public.profiles
      for update using (auth.uid() = id);

    -- Auto-create profile on signup
    create or replace function public.handle_new_user()
    returns trigger as $$
    begin
      insert into public.profiles (id, display_name, avatar_url)
      values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
      return new;
    end;
    $$ language plpgsql security definer;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();

    -- Rooms
    create table public.rooms (
      id uuid default uuid_generate_v4() primary key,
      name text not null,
      description text,
      invite_code uuid default uuid_generate_v4() unique not null,
      created_by uuid references public.profiles(id) on delete set null,
      created_at timestamptz default now()
    );
    alter table public.rooms enable row level security;

    -- Room Members
    create table public.room_members (
      room_id uuid references public.rooms(id) on delete cascade,
      user_id uuid references public.profiles(id) on delete cascade,
      role text default 'member' check (role in ('owner', 'member')),
      joined_at timestamptz default now(),
      primary key (room_id, user_id)
    );
    alter table public.room_members enable row level security;

    -- RLS: rooms visible only to members
    create policy "Room members can view rooms" on public.rooms
      for select using (
        exists (
          select 1 from public.room_members
          where room_members.room_id = rooms.id
          and room_members.user_id = auth.uid()
        )
      );

    -- RLS: room_members visible to members of that room
    create policy "Members can see room membership" on public.room_members
      for select using (
        exists (
          select 1 from public.room_members rm
          where rm.room_id = room_members.room_id
          and rm.user_id = auth.uid()
        )
      );

    -- Topics
    create table public.topics (
      id uuid default uuid_generate_v4() primary key,
      room_id uuid references public.rooms(id) on delete cascade,
      name text not null,
      emoji text default '📌',
      created_by uuid references public.profiles(id) on delete set null,
      created_at timestamptz default now()
    );
    alter table public.topics enable row level security;
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

    -- Entries
    create table public.entries (
      id uuid default uuid_generate_v4() primary key,
      topic_id uuid references public.topics(id) on delete cascade,
      room_id uuid references public.rooms(id) on delete cascade,
      content jsonb not null,  -- Tiptap JSON format
      created_by uuid references public.profiles(id) on delete set null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    alter table public.entries enable row level security;
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
    ```

    Run this SQL in Supabase Dashboard > SQL Editor > New Query > Paste > Run.
  </action>
  <verify>
    In Supabase Dashboard > Table Editor — confirm these tables exist: `profiles`, `rooms`, `room_members`, `topics`, `entries`.
  </verify>
  <done>
    - All 5 tables exist in Supabase
    - RLS enabled on all tables
    - `on_auth_user_created` trigger active
  </done>
</task>

## Success Criteria
- [ ] Next.js app scaffolded from `with-supabase` template
- [ ] `.env.local` configured with real Supabase credentials
- [ ] `npm run dev` runs without errors at localhost:3000
- [ ] All 5 DB tables created in Supabase with RLS enabled
