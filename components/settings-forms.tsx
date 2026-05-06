'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateRoom, deleteRoom } from '@/app/room/[id]/settings/actions'

interface SettingsFormsProps {
  roomId: string
  initialName: string
  initialDescription: string | null
}

export function GeneralSettingsForm({ roomId, initialName, initialDescription }: SettingsFormsProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  async function handleUpdate(formData: FormData) {
    setMessage('')
    startTransition(async () => {
      const result = await updateRoom(roomId, formData)
      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage('Settings saved successfully.')
        setTimeout(() => setMessage(''), 3000)
      }
    })
  }

  return (
    <form action={handleUpdate} className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
          Room Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={initialName}
          required
          className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={initialDescription || ''}
          rows={3}
          className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className={`text-sm ${message.includes('error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm shadow-indigo-500/20 transition-all"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

export function DeleteRoomForm({ roomId }: { roomId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  function confirmDelete() {
    setErrorMsg('')
    startTransition(async () => {
      const result = await deleteRoom(roomId)
      if (result.error) {
        setErrorMsg(result.error)
        setShowModal(false)
      } else {
        router.push('/dashboard')
      }
    })
  }

  return (
    <>
      <div className="bg-red-500/[0.02] border border-red-500/20 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
        <div className="relative z-10">
          <h3 className="text-red-400 font-semibold mb-1">Delete Room</h3>
          <p className="text-slate-400 text-sm">
            Permanently delete this room and all its contents. This action cannot be undone.
          </p>
          {errorMsg && <p className="text-red-400 text-sm mt-2">{errorMsg}</p>}
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          disabled={isPending}
          className="relative z-10 shrink-0 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {isPending ? 'Deleting...' : 'Delete Room'}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !isPending && setShowModal(false)} />
          <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-6 max-w-md w-full relative z-10 shadow-2xl shadow-red-500/10 transform transition-all">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete this room?</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              This action is permanent and cannot be undone. All topics, notes, and links shared in this room will be permanently erased.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
              >
                {isPending && (
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Yes, delete room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
