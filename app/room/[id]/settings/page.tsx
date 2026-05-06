import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { approveJoinRequest, rejectJoinRequest } from './actions'
import { GeneralSettingsForm, DeleteRoomForm } from '@/components/settings-forms'

interface SettingsPageProps {
  params: Promise<{ id: string }>
}

export default function SettingsPage({ params }: SettingsPageProps) {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </main>
    }>
      <SettingsContent params={params} />
    </Suspense>
  )
}

async function SettingsContent({ params }: SettingsPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if user is owner
  const { data: memberData } = await supabase
    .from('room_members')
    .select('role')
    .eq('room_id', id)
    .eq('user_id', user.id)
    .single()

  if (!memberData || memberData.role !== 'owner') {
    redirect(`/room/${id}`) // Only owners can access settings
  }

  // Fetch room details
  const { data: room } = await supabase
    .from('rooms')
    .select('name, description, invite_code')
    .eq('id', id)
    .single()

  if (!room) redirect('/dashboard')

  // Fetch members
  const { data: membersRes } = await supabase
    .from('room_members')
    .select('user_id, role, joined_at, profiles(id, display_name, avatar_url)')
    .eq('room_id', id)
    .order('joined_at', { ascending: true })

  // Fetch pending requests
  const { data: pendingRequestsRes } = await supabase
    .from('room_join_requests')
    .select('id, created_at, profiles(id, display_name, avatar_url)')
    .eq('room_id', id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const members = (membersRes ?? []) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingRequests = (pendingRequestsRes ?? []) as any[]

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-5 py-4">
          <Link
            href={`/room/${id}`}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to {room.name}</span>
          </Link>
          <div className="ml-auto text-sm font-bold tracking-tight text-white/90">
            Members & Settings
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-2xl w-full mx-auto px-5 py-8 pb-32 flex flex-col gap-10">
        
        {/* General Settings Section */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">General Settings</h2>
          <GeneralSettingsForm roomId={id} initialName={room.name} initialDescription={room.description} />
        </section>

        {/* Pending Requests Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              Pending Requests
              {pendingRequests.length > 0 && (
                <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </h2>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 text-center">
              <p className="text-slate-500 text-sm">No pending requests right now.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingRequests.map(req => {
                const profile = req.profiles
                const name = profile?.display_name || 'Unknown User'
                const initial = name.charAt(0).toUpperCase()
                return (
                  <div key={req.id} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {profile?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.avatar_url} alt={name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-600/30 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-indigo-300">{initial}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{name}</p>
                        <p className="text-slate-500 text-xs">Requested {new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <form action={rejectJoinRequest.bind(null, req.id, id)}>
                        <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                          Reject
                        </button>
                      </form>
                      <form action={approveJoinRequest.bind(null, req.id, id)}>
                        <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-500/20 transition-colors">
                          Approve
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Current Members Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-white">Current Members</h2>
            <span className="text-slate-500 text-sm">({members.length})</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl divide-y divide-white/5">
            {members.map(member => {
              const profile = member.profiles
              const name = profile?.display_name || 'Unknown User'
              const initial = name.charAt(0).toUpperCase()
              return (
                <div key={member.user_id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt={name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-600/30 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-indigo-300">{initial}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {name} {member.user_id === user.id && <span className="text-slate-500 font-normal"> (You)</span>}
                      </p>
                      <p className="text-slate-500 text-xs">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    member.role === 'owner'
                      ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                      : 'bg-slate-700/50 text-slate-400 border border-slate-700'
                  }`}>
                    {member.role}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Danger Zone Section */}
        <section>
          <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
          <DeleteRoomForm roomId={id} />
        </section>

      </div>
    </main>
  )
}
