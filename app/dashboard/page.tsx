import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const name = user.user_metadata?.full_name ?? user.email ?? 'Friend'
  const avatar = user.user_metadata?.avatar_url as string | undefined
  const firstName = name.split(' ')[0]

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

      {/* Hero greeting */}
      <section className="max-w-2xl mx-auto px-5 pt-10 pb-6">
        <h1 className="text-2xl font-bold text-white">
          Hey, {firstName} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">Here are your rooms. Pick one to dive in.</p>
      </section>

      {/* Rooms section */}
      <section className="max-w-2xl mx-auto px-5 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">My Rooms</h2>
          <button
            id="create-room-btn"
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            disabled
            title="Coming soon"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Room
          </button>
        </div>

        {/* Empty state */}
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium text-sm">No rooms yet</p>
            <p className="text-slate-500 text-xs mt-1 max-w-xs">
              Create a room and share the invite link with your group. Everyone with the link can join.
            </p>
          </div>
          <button
            id="create-first-room-btn"
            className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            disabled
            title="Coming soon"
          >
            Create your first room
          </button>
        </div>
      </section>
    </main>
  )
}
