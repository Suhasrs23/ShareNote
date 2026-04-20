import type { JSONContent } from '@tiptap/core'
import { EntryContent } from './entry-content'

interface EntryCardProps {
  id: string
  content: JSONContent
  createdAt: string
  author: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
  isCurrentUser: boolean
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function EntryCard({ content, createdAt, author, isCurrentUser }: EntryCardProps) {
  const displayName = author?.display_name ?? 'Unknown'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        {author?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.avatar_url}
            alt={displayName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-600/30 border border-indigo-500/20 flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-300">{initial}</span>
          </div>
        )}
      </div>

      {/* Content bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-sm font-semibold text-white">
            {displayName}
            {isCurrentUser && (
              <span className="text-slate-600 font-normal text-xs"> · you</span>
            )}
          </span>
          <span className="text-xs text-slate-600 tabular-nums">{formatTime(createdAt)}</span>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl rounded-tl-sm px-4 py-3 hover:border-white/10 transition-colors">
          <EntryContent content={content} />
        </div>
      </div>
    </div>
  )
}
