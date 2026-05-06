import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './actions'
import { CreateRoomModal, CreateRoomCTA } from '@/components/create-room-modal'
import { RoomCard } from '@/components/room-card'

import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </main>
    }>
      <DashboardContent />
    </Suspense>
  )
}

async function DashboardContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const name = user.user_metadata?.full_name ?? user.email ?? 'Friend'
  const avatar = user.user_metadata?.avatar_url as string | undefined
  const firstName = name.split(' ')[0]

  // Fetch rooms the user belongs to (RLS auto-filters)
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, name, description, invite_code, created_at')
    .order('created_at', { ascending: false })

  // Fetch user's roles across all rooms
  const { data: memberships } = await supabase
    .from('room_members')
    .select('room_id, role')
    .eq('user_id', user.id)

  // Fetch user's pending requests
  const { data: pendingRequests } = await supabase
    .from('room_join_requests')
    .select('room_id')
    .eq('user_id', user.id)
    .eq('status', 'pending')

  const roleMap = new Map(memberships?.map(m => [m.room_id, m.role as 'owner' | 'member']) ?? [])
  pendingRequests?.forEach(r => roleMap.set(r.room_id, 'pending' as any))

  const roomsWithRole = (rooms ?? []).map(r => ({
    ...r,
    role: roleMap.get(r.id) ?? 'member',
  }))

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">ShareNote</span>
          </div>

          <div className="flex items-center gap-3">
            <CreateRoomModal />
            {avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={name} className="w-8 h-8 rounded-full ring-2 ring-white/10" />
            )}
            <form action={signOut}>
              <button
                id="sign-out-btn"
                type="submit"
                className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Greeting */}
      <section className="max-w-2xl mx-auto px-5 pt-10 pb-6">
        <h1 className="text-2xl font-bold text-white">Hey, {firstName} 👋</h1>
        <p className="text-slate-400 text-sm mt-1">
          {roomsWithRole.length > 0
            ? 'Here are your rooms. Pick one to dive in.'
            : 'Create a room and invite your group to get started.'}
        </p>
      </section>

      {/* Rooms grid */}
      <section className="max-w-2xl mx-auto px-5 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            My Rooms
            {roomsWithRole.length > 0 && (
              <span className="ml-2 bg-white/5 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-full">
                {roomsWithRole.length}
              </span>
            )}
          </h2>
        </div>

        {roomsWithRole.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roomsWithRole.map(room => (
              <RoomCard
                key={room.id}
                id={room.id}
                name={room.name}
                description={room.description}
                inviteCode={room.invite_code}
                role={room.role}
                createdAt={room.created_at}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm">No rooms yet</p>
              <p className="text-slate-500 text-xs mt-1 max-w-xs">
                Create a room and share the invite link with your group.
              </p>
            </div>
            <CreateRoomCTA />
          </div>
        )}
      </section>
    </main>
  )
}
