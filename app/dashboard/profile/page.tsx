import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { ProfileForm } from '@/components/profile-form'

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </main>
    }>
      <ProfileContent />
    </Suspense>
  )
}

async function ProfileContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch the actual profile from the database
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  const name = profile?.display_name || user.user_metadata?.full_name || user.email || 'User'
  const avatar = profile?.avatar_url || user.user_metadata?.avatar_url || ''

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-5 py-4">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <div className="ml-auto text-sm font-bold tracking-tight text-white/90">
            My Profile
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-2xl w-full mx-auto px-5 py-8 pb-32 flex flex-col gap-10">
        
        <section>
          <div className="flex items-center gap-4 mb-6">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={name} className="w-16 h-16 rounded-full border-2 border-white/10" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-600/30 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-indigo-300">{name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">{name}</h1>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>

          <ProfileForm initialName={name} initialAvatar={avatar} />
        </section>

      </div>
    </main>
  )
}
