'use client'
import { useState } from 'react'
import Link from 'next/link'

interface RoomCardProps {
  id: string
  name: string
  description: string | null
  inviteCode: string
  role: 'owner' | 'member'
  createdAt: string
}

export function RoomCard({ id, name, description, inviteCode, role }: RoomCardProps) {
  const [copied, setCopied] = useState(false)

  function copyInviteLink() {
    const url = `${window.location.origin}/join/${inviteCode}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
      <Link href={`/room/${id}`} className="flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-white text-base group-hover:text-indigo-200 transition-colors">
          {name}
        </h3>
        {description && (
          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{description}</p>
        )}
      </Link>

      {/* Enter link */}
      <Link
        href={`/room/${id}`}
        id={`enter-room-${id}`}
        className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-500 hover:text-indigo-400 transition-colors group/link"
      >
        <span>Open room</span>
        <svg className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}
