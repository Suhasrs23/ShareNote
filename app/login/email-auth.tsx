'use client'
import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { signInWithEmail, signUpWithEmail, type AuthState } from './actions'

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-150 flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {pendingLabel}
        </>
      ) : label}
    </button>
  )
}

export function EmailAuth({ nextUrl }: { nextUrl: string }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [signInState, signInAction] = useActionState<AuthState, FormData>(signInWithEmail, null)
  const [signUpState, signUpAction] = useActionState<AuthState, FormData>(signUpWithEmail, null)

  const isSignIn = mode === 'signin'
  const currentState = isSignIn ? signInState : signUpState
  const currentAction = isSignIn ? signInAction : signUpAction

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isSignIn ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
            !isSignIn ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Form */}
      <form action={currentAction} className="flex flex-col gap-3">
        <input type="hidden" name="next" value={nextUrl} />

        {!isSignIn && (
          <input
            id="name-input"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Display Name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
          />
        )}

        <input
          id="email-input"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
        />
        <input
          id="password-input"
          name="password"
          type="password"
          required
          autoComplete={isSignIn ? 'current-password' : 'new-password'}
          placeholder={isSignIn ? 'Password' : 'Password (min 6 characters)'}
          minLength={6}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
        />

        {/* Error message */}
        {currentState?.error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-3 py-2.5">
            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {currentState.error}
          </div>
        )}

        <SubmitButton
          label={isSignIn ? 'Sign In' : 'Create Account'}
          pendingLabel={isSignIn ? 'Signing in…' : 'Creating account…'}
        />
      </form>
    </div>
  )
}
