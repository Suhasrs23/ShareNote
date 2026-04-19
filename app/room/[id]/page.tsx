import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface RoomPageProps {
  params: Promise<{ id: string }>
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch room (RLS auto-enforces membership)
  const { data: room } = await supabase
    .from('rooms')
    .select('id, name, description, invite_code, created_by, created_at')
    .eq('id', id)
    .single()

  // Not a member or room doesn't exist
  if (!room) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Access denied</h1>
            <p className="text-slate-400 text-sm mt-1">You&apos;re not a member of this room.</p>
          </div>
          <Link href="/dashboard" className="text-indigo-400 text-sm hover:underline">← Back to dashboard</Link>
        </div>
      </main>
    )
  }

  // Fetch members with profile info
  const { data: members } = await supabase
    .from('room_members')
    .select('role, joined_at, profiles(id, display_name, avatar_url)')
    .eq('room_id', id)

  const memberCount = members?.length ?? 0
  const myRole = members?.find(m => (m.profiles as { id: string } | null)?.id === user.id)?.role ?? 'member'

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-5 py-3">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            aria-label="Back to dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white truncate">{room.name}</h1>
            <p className="text-xs text-slate-500">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            myRole === 'owner'
              ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
              : 'bg-slate-700/50 text-slate-400 border border-slate-700'
          }`}>
            {myRole}
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-8 flex flex-col gap-6">
        {/* Room description */}
        {room.description && (
          <p className="text-slate-400 text-sm">{room.description}</p>
        )}

        {/* Topics placeholder — Phase 3 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Topics</h2>
            <button
              id="add-topic-btn"
              disabled
              className="flex items-center gap-1 text-xs text-slate-600 cursor-not-allowed"
              title="Topics coming in Phase 3"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add topic
            </button>
          </div>

          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm">No topics yet</p>
              <p className="text-slate-500 text-xs mt-1">Topics let you organize your group&apos;s notes by category.<br />Coming in the next update!</p>
            </div>
          </div>
        </section>

        {/* Members section */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Members</h2>
          <div className="flex flex-col gap-2">
            {members?.map((m, i) => {
              const profile = m.profiles as { id: string; display_name: string | null; avatar_url: string | null } | null
              return (
                <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt={profile.display_name ?? ''} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <span className="text-indigo-400 text-xs font-bold">
                        {(profile?.display_name ?? '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {profile?.display_name ?? 'Unknown'}
                      {profile?.id === user.id && <span className="text-slate-500 font-normal"> (you)</span>}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                    m.role === 'owner'
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {m.role}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
