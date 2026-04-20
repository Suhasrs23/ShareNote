import { signInWithGoogle } from './actions'
import { EmailAuth } from './email-auth'

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams
  const nextUrl = next || '/dashboard'

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">ShareNote</h1>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your group&apos;s shared memory.<br />
            Save links & notes, organised by topic.
          </p>
        </div>

        {/* Auth card */}
        <div className="w-full bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-5 shadow-xl">

          {/* Email / Password auth */}
          <EmailAuth nextUrl={nextUrl} />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-600 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google OAuth */}
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={nextUrl} />
            <button
              id="google-signin-btn"
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 font-semibold py-3 px-6 rounded-xl hover:bg-slate-50 active:scale-95 transition-all duration-150 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>
        </div>

        <p className="text-slate-600 text-xs text-center">
          🔒 Private rooms — only people with an invite can join
        </p>
      </div>
    </main>
  )
}
