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

  function handleDelete() {
    if (!confirm('Are you sure you want to delete this room? This action is permanent and will delete all topics and entries inside it.')) {
      return
    }

    startTransition(async () => {
      const result = await deleteRoom(roomId)
      if (result.error) {
        alert(result.error)
      } else {
        router.push('/dashboard')
      }
    })
  }

  return (
    <div className="bg-red-500/[0.02] border border-red-500/20 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 className="text-red-400 font-semibold mb-1">Delete Room</h3>
        <p className="text-slate-400 text-sm">
          Permanently delete this room and all its contents. This action cannot be undone.
        </p>
      </div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="shrink-0 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? 'Deleting...' : 'Delete Room'}
      </button>
    </div>
  )
}
