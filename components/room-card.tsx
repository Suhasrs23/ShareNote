'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface RoomCardProps {
  id: string
  name: string
  description: string | null
  inviteCode: string
  role: 'owner' | 'member'
  createdAt: string
}

export function RoomCard({ id, name, description, inviteCode, role }: RoomCardProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  function copyInviteLink() {
    const url = `${window.location.origin}/join/${inviteCode}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleOpen() {
    startTransition(() => {
      router.push(`/room/${id}`)
    })
  }

  return (
    <div className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 hover:border-indigo-500/30 rounded-2xl p-5 transition-all duration-200 flex flex-col gap-3">
      {/* Role badge */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
          role === 'owner'
            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
            : 'bg-slate-700/50 text-slate-400 border border-slate-700'
        }`}>
          {role}
        </span>
        <button
          onClick={copyInviteLink}
          title="Copy invite link"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Invite
            </>
          )}
        </button>
      </div>

      {/* Room info */}
      <button onClick={handleOpen} className="flex flex-col gap-1 flex-1 text-left">
        <h3 className="font-semibold text-white text-base group-hover:text-indigo-200 transition-colors">
          {name}
        </h3>
        {description && (
          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{description}</p>
        )}
      </button>

      {/* Enter link */}
      <button
        onClick={handleOpen}
        id={`enter-room-${id}`}
        disabled={isPending}
        className={`flex items-center justify-between pt-3 border-t border-white/5 text-xs transition-colors group/link ${
          isPending ? 'text-indigo-400 cursor-wait opacity-80' : 'text-slate-500 hover:text-indigo-400'
        }`}
      >
        <span className="flex items-center gap-2">
          {isPending ? (
            <>
              <svg className="animate-spin w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Opening…
            </>
          ) : (
            'Open room'
          )}
        </span>
        {!isPending && (
          <svg className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </div>
  )
}
