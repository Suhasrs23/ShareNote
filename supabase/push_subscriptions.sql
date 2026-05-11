-- ============================================================
-- PUSH SUBSCRIPTIONS
-- Run in: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================
-- Stores browser PushSubscription objects per device per user.
-- One user can have multiple subscriptions (one per device/browser).

create table if not exists public.push_subscriptions (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  endpoint     text not null unique,
  subscription jsonb not null, -- full PushSubscription JSON (endpoint + keys)
  created_at   timestamptz default now()
);

alter table public.push_subscriptions enable row level security;

-- Only the owning user can read/write their own subscriptions.
create policy "Users manage own subscriptions"
  on public.push_subscriptions
  for all
  using (user_id = auth.uid());

-- Service-role (server actions) can read all subscriptions to fan out pushes.
-- This is enforced by using the service-role client on the server only.
