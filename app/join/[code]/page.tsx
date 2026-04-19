import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { joinRoom } from './actions'

interface JoinPageProps {
  params: Promise<{ code: string }>
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in — redirect to login preserving the join URL
  if (!user) {
    redirect(`/login?next=/join/${code}`)
  }

  // Look up the room by invite code using SECURITY DEFINER function
  const { data: rooms, error } = await supabase
    .rpc('get_room_by_invite', { invite_code_param: code })

  const room = rooms?.[0]

  if (error || !room) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Invite not found</h1>
            <p className="text-slate-400 text-sm mt-1">This invite link is invalid or has expired.</p>
          </div>
          <a href="/dashboard" className="text-indigo-400 text-sm hover:underline">← Back to dashboard</a>
        </div>
      </main>
    )
  }

  // Check if already a member — redirect straight to room
  const { data: existing } = await supabase
    .from('room_members')
    .select('user_id')
    .eq('room_id', room.id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    redirect(`/room/${room.id}`)
  }

  const name = user.user_metadata?.full_name ?? user.email ?? 'You'

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-6 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg">ShareNote</span>
        </div>

        {/* Invite card */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
          <div className="text-center">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-medium mb-3">You&apos;re invited to</p>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">{room.name}</h1>
            {room.description && (
              <p className="text-slate-400 text-sm mt-1">{room.description}</p>
            )}
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 text-center">
            <p className="text-slate-400 text-xs">Joining as</p>
            <p className="text-white font-medium text-sm mt-0.5">{name}</p>
          </div>

          <form action={joinRoom.bind(null, room.id)}>
            <button
              id="join-room-btn"
              type="submit"
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-indigo-500/20"
            >
              Join Room →
            </button>
          </form>
        </div>

        <a href="/dashboard" className="text-slate-600 text-xs hover:text-slate-400 transition-colors">
          ← Back to my rooms
        </a>
      </div>
    </main>
  )
}
