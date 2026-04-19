'use client'
import { useState, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createRoom, type CreateRoomState } from '@/app/dashboard/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      id="create-room-submit-btn"
      type="submit"
      disabled={pending}
      className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Creating…
        </>
      ) : (
        'Create Room'
      )}
    </button>
  )
}

function RoomForm({ onClose }: { onClose: () => void }) {
  const [state, action] = useActionState<CreateRoomState, FormData>(createRoom, null)

  return (
    <div
      className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-5"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Create a Room</h2>
          <p className="text-slate-400 text-xs mt-0.5">A room is a private space for your group.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Error banner */}
      {state?.error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-3">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{state.error}</span>
        </div>
      )}

      {/* Form */}
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="room-name" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Room Name <span className="text-indigo-400">*</span>
          </label>
          <input
            id="room-name"
            name="name"
            type="text"
            required
            placeholder="e.g. ML Resources, Weekend Plans"
            maxLength={60}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="room-description" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Description <span className="text-slate-600">(optional)</span>
          </label>
          <textarea
            id="room-description"
            name="description"
            placeholder="What is this room for?"
            rows={3}
            maxLength={200}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all resize-none"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}

export function CreateRoomModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        id="create-room-btn"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Room
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <RoomForm onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}

export function CreateRoomCTA() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        id="create-first-room-btn"
        onClick={() => setOpen(true)}
        className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
      >
        Create your first room
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <RoomForm onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
