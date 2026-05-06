-- ============================================================
-- Room Management Policies
-- Run in: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- RLS: Room owners can update rooms
create policy "Room owners can update rooms" on public.rooms
  for update using (
    exists (
      select 1 from public.room_members
      where room_members.room_id = rooms.id
      and room_members.user_id = auth.uid()
      and room_members.role = 'owner'
    )
  );

-- RLS: Room owners can delete rooms
create policy "Room owners can delete rooms" on public.rooms
  for delete using (
    exists (
      select 1 from public.room_members
      where room_members.room_id = rooms.id
      and room_members.user_id = auth.uid()
      and room_members.role = 'owner'
    )
  );
