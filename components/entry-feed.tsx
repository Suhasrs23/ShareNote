'use client'
import { useState } from 'react'
import type { JSONContent } from '@tiptap/core'
import { EntryCard } from './entry-card'

function extractText(content: JSONContent): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = content as any
  if (c.type === 'html') return (c.html as string).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  function walk(node: JSONContent): string {
    if (node.type === 'text') return node.text ?? ''
    return (node.content ?? []).map(walk).join(' ')
  }
  return walk(content)
}

interface Entry {
  id: string
  content: JSONContent
  created_at: string
  created_by: string
  profiles: { id: string; display_name: string | null; avatar_url: string | null } | null
}

interface EntryFeedProps {
  entries: Entry[]
  currentUserId: string
  roomId: string
  topicId: string
}

export function EntryFeed({ entries, currentUserId, roomId, topicId }: EntryFeedProps) {
  const [search, setSearch] = useState('')
  const term = search.toLowerCase().trim()
  const filtered = term ? entries.filter(e => extractText(e.content).toLowerCase().includes(term)) : entries

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar — only show when there are entries */}
      {entries.length > 2 && (
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries…"
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-9 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* No search results */}
      {term && filtered.length === 0 && (
        <div className="text-center py-10 text-slate-500 text-sm">
          No entries match &ldquo;{search}&rdquo;
        </div>
      )}

      {/* Entries */}
      <div className="flex flex-col gap-5">
        {filtered.map((entry) => (
          <EntryCard
            key={entry.id}
            id={entry.id}
            content={entry.content}
            createdAt={entry.created_at}
            author={entry.profiles}
            isCurrentUser={entry.created_by === currentUserId}
            roomId={roomId}
            topicId={topicId}
          />
        ))}
      </div>
    </div>
  )
}
