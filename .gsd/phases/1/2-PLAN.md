---
phase: 1
plan: 2
wave: 2
---

# Plan 1.2: Google OAuth Login + Authenticated Home Page

## Objective
Wire up Google OAuth through Supabase so users can sign in with Gmail, and build an authenticated home screen that shows the logged-in user's name/avatar — proving end-to-end auth works before building any features.

## Context
- .gsd/SPEC.md
- .gsd/phases/1/RESEARCH.md
- utils/supabase/client.ts
- utils/supabase/server.ts
- middleware.ts
- app/auth/callback/route.ts

## Pre-requisites
- Plan 1.1 must be complete (app running, DB schema created, Google provider enabled in Supabase)

## Tasks

<task type="auto">
  <name>Build the Login page with Google OAuth button</name>
  <files>
    app/login/page.tsx (new)
    app/login/actions.ts (new)
  </files>
  <action>
    Create `app/login/page.tsx` — a full-page mobile-first login screen with:
    - ShareNote logo/wordmark (text-based, no image needed)
    - Tagline: "Your group's shared memory"
    - "Sign in with Google" button (styled with Google colors)
    - Uses a Server Action from `actions.ts` to trigger OAuth

    Create `app/login/actions.ts`:
    ```ts
    'use server'
    import { createClient } from '@/utils/supabase/server'
    import { redirect } from 'next/navigation'
    import { headers } from 'next/headers'

    export async function signInWithGoogle() {
      const supabase = await createClient()
      const origin = (await headers()).get('origin')

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      })

      if (error) redirect('/error')
      if (data.url) redirect(data.url)
    }
    ```

    In `app/login/page.tsx`:
    ```tsx
    import { signInWithGoogle } from './actions'

    export default function LoginPage() {
      return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="w-full max-w-sm flex flex-col items-center gap-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white tracking-tight">ShareNote</h1>
              <p className="text-slate-400 mt-2 text-sm">Your group's shared memory</p>
            </div>
            <form action={signInWithGoogle} className="w-full">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 font-medium py-3 px-6 rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </form>
            <p className="text-slate-500 text-xs text-center">
              Only people with the invite link can join a room
            </p>
          </div>
        </main>
      )
    }
    ```
  </action>
  <verify>
    Navigate to http://localhost:3000/login — login page renders with Google button.
  </verify>
  <done>
    - Login page renders at /login
    - Google button is visible and styled
    - Clicking button initiates OAuth redirect (even if Google credentials aren't set — it should redirect to Supabase OAuth URL)
  </done>
</task>

<task type="auto">
  <name>Build authenticated Home page showing user info</name>
  <files>
    app/page.tsx (modify)
    middleware.ts (verify correct)
  </files>
  <action>
    Replace the default `app/page.tsx` with a protected home page:
    - If user is NOT logged in → redirect to /login
    - If user IS logged in → show: greeting with their Google name, avatar, and a placeholder "Your Rooms" section

    ```tsx
    // app/page.tsx
    import { createClient } from '@/utils/supabase/server'
    import { redirect } from 'next/navigation'

    export default async function HomePage() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) redirect('/login')

      const name = user.user_metadata?.full_name ?? user.email
      const avatar = user.user_metadata?.avatar_url

      return (
        <main className="min-h-screen bg-slate-900 text-white">
          <header className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h1 className="text-lg font-bold text-white">ShareNote</h1>
            <div className="flex items-center gap-2">
              {avatar && <img src={avatar} alt={name} className="w-8 h-8 rounded-full" />}
              <span className="text-sm text-slate-300">{name}</span>
            </div>
          </header>
          <section className="px-5 py-8">
            <h2 className="text-xl font-semibold mb-4">Your Rooms</h2>
            <div className="text-slate-400 text-sm">
              No rooms yet. Create one to get started.
            </div>
          </section>
        </main>
      )
    }
    ```

    Verify `middleware.ts` protects routes — the `with-supabase` template already includes this, but confirm it refreshes sessions on every request and doesn't accidentally block `/login` or `/auth/callback`.
  </action>
  <verify>
    1. Visit http://localhost:3000 without being logged in → should redirect to /login
    2. Complete Google login flow → should land on home page showing your Google name and avatar
    3. Hard refresh → should stay logged in (session persists)
  </verify>
  <done>
    - Unauthenticated users hit / → redirected to /login
    - After Google OAuth completes → home page shows user's real name and avatar
    - Session persists across page refreshes
  </done>
</task>

<task type="checkpoint:human-verify">
  <name>Verify end-to-end auth flow on mobile</name>
  <action>
    Open http://localhost:3000 on your phone browser (use your computer's local IP, e.g., http://192.168.x.x:3000 — or use ngrok for HTTPS).
    - Verify login page looks good on mobile
    - Sign in with Google on mobile
    - Confirm you land on the home page with your name showing
  </action>
  <done>
    - Mobile login flow works
    - UI is readable and usable on a phone screen
  </done>
</task>

## Success Criteria
- [ ] /login renders a clean Google OAuth button
- [ ] Clicking "Continue with Google" → completes OAuth and lands on /
- [ ] Home page shows logged-in user's name and avatar from Google
- [ ] Unauthenticated requests to / redirect to /login
- [ ] Works on mobile browser
