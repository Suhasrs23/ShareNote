'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/app/dashboard/profile/actions'

interface ProfileFormProps {
  initialName: string
  initialAvatar: string | null
}

export function ProfileForm({ initialName, initialAvatar }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  async function handleUpdate(formData: FormData) {
    setMessage('')
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage('Profile updated successfully.')
        setTimeout(() => setMessage(''), 3000)
      }
    })
  }

  return (
    <form action={handleUpdate} className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col gap-5">
      
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-slate-300 mb-1.5">
          Display Name
        </label>
        <input
          type="text"
          id="display_name"
          name="display_name"
          defaultValue={initialName}
          required
          className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <p className="text-slate-500 text-xs mt-1.5">
          This is the name that will be visible to other members in your rooms.
        </p>
      </div>

      <div>
        <label htmlFor="avatar_url" className="block text-sm font-medium text-slate-300 mb-1.5">
          Avatar URL (Optional)
        </label>
        <input
          type="url"
          id="avatar_url"
          name="avatar_url"
          defaultValue={initialAvatar || ''}
          placeholder="https://example.com/avatar.png"
          className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <p className="text-slate-500 text-xs mt-1.5">
          Provide a direct link to an image to use as your profile picture.
        </p>
      </div>

      <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
        <p className={`text-sm ${message.includes('error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm shadow-indigo-500/20 transition-all"
        >
          {isPending ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  )
}
