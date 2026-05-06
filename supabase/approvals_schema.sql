-- ============================================================
-- Room Join Requests & Approvals Schema
-- Run in: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- 1. Create the room_join_requests table
create table if not exists public.room_join_requests (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  unique(room_id, user_id)
);

alter table public.room_join_requests enable row level security;

-- 2. RLS Policies
create policy "Users can view their own requests" on public.room_join_requests
  for select using (user_id = auth.uid());

create policy "Room owners can view requests for their rooms" on public.room_join_requests
  for select using (
    exists (
      select 1 from public.room_members
      where room_members.room_id = room_join_requests.room_id
      and room_members.user_id = auth.uid()
      and room_members.role = 'owner'
    )
  );

-- Allow pending users to see the room's name/description
create policy "Pending members can view rooms" on public.rooms
  for select using (
    exists (
      select 1 from public.room_join_requests
      where room_join_requests.room_id = rooms.id
      and room_join_requests.user_id = auth.uid()
      and room_join_requests.status = 'pending'
    )
  );

-- 3. RPC to request to join a room by invite code (Security Definer to bypass RLS on rooms)
create or replace function public.request_join_room(p_invite_code uuid)
returns uuid as $$
declare
  v_room_id uuid;
begin
  -- Find the room by invite code
  select id into v_room_id from public.rooms where invite_code = p_invite_code;
  if v_room_id is null then
    raise exception 'Invalid invite code';
  end if;

  -- Check if already a member
  if exists (select 1 from public.room_members where room_id = v_room_id and user_id = auth.uid()) then
    return v_room_id; -- Already a member
  end if;

  -- Insert or update request to pending
  insert into public.room_join_requests (room_id, user_id, status)
  values (v_room_id, auth.uid(), 'pending')
  on conflict (room_id, user_id) do update set status = 'pending', created_at = now();

  return v_room_id;
end;
$$ language plpgsql security definer;

-- 4. RPC to approve a join request
create or replace function public.approve_join_request(p_request_id uuid)
returns void as $$
declare
  v_room_id uuid;
  v_user_id uuid;
begin
  -- Get request details
  select room_id, user_id into v_room_id, v_user_id from public.room_join_requests where id = p_request_id;
  
  if v_room_id is null then
    raise exception 'Request not found';
  end if;

  -- Check if caller is owner
  if not exists (select 1 from public.room_members where room_id = v_room_id and user_id = auth.uid() and role = 'owner') then
    raise exception 'Not authorized';
  end if;

  -- Update request status
  update public.room_join_requests set status = 'approved' where id = p_request_id;

  -- Insert member
  insert into public.room_members (room_id, user_id, role)
  values (v_room_id, v_user_id, 'member')
  on conflict do nothing;
end;
$$ language plpgsql security definer;

-- 5. RPC to reject a join request
create or replace function public.reject_join_request(p_request_id uuid)
returns void as $$
declare
  v_room_id uuid;
begin
  -- Get room_id to check permissions
  select room_id into v_room_id from public.room_join_requests where id = p_request_id;
  
  if v_room_id is null then
    raise exception 'Request not found';
  end if;

  -- Check if caller is owner
  if not exists (select 1 from public.room_members where room_id = v_room_id and user_id = auth.uid() and role = 'owner') then
    raise exception 'Not authorized';
  end if;

  -- Update request status
  update public.room_join_requests set status = 'rejected' where id = p_request_id;
end;
$$ language plpgsql security definer;
