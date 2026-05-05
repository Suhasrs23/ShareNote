'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createTopic } from '@/app/room/[id]/actions'

interface Topic {
  id: string
  name: string
  emoji: string
}

interface TopicTabsProps {
  topics: Topic[]
  roomId: string
  currentTopicId: string | null
}

const EMOJI_OPTIONS = ['📌', '🔗', '💡', '📚', '🎯', '🛠️', '🌐', '🎨', '📊', '🤖']

export function TopicTabs({ topics, roomId, currentTopicId }: TopicTabsProps) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📌')
  const [isPending, startTransition] = useTransition()
  const [loadingTopicId, setLoadingTopicId] = useState<string | null>(null)

  function selectTopic(topicId: string) {
    setLoadingTopicId(topicId)
    startTransition(() => {
      router.push(`/room/${roomId}?topic=${topicId}`)
    })
  }

  function handleAdd() {
    if (!name.trim() || isPending) return
    startTransition(async () => {
      const result = await createTopic(roomId, name.trim(), emoji)
      if (!result.error && result.topicId) {
        setName('')
        setEmoji('📌')
        setAdding(false)
        router.push(`/room/${roomId}?topic=${result.topicId}`)
      }
    })
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Tabs row */}
      <div className="flex items-center gap-2 px-5 py-3 overflow-x-auto no-scrollbar">
        {topics.map((t) => {
          const isLoading = isPending && loadingTopicId === t.id;
          return (
            <button
              key={t.id}
              id={`topic-tab-${t.id}`}
              onClick={() => selectTopic(t.id)}
              disabled={isPending}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                currentTopicId === t.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              } ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isLoading ? (
                <svg className="animate-spin w-3.5 h-3.5 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <span>{t.emoji}</span>
              )}
              <span>{t.name}</span>
            </button>
          )
        })}

        {/* Add topic button */}
        {!adding ? (
          <button
            id="add-topic-btn"
            onClick={() => setAdding(true)}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-slate-500 hover:text-slate-300 border border-dashed border-white/10 hover:border-white/20 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Topic
          </button>
        ) : (
          <div className="flex-shrink-0 flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5">
            {/* Emoji picker */}
            <select
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="bg-transparent text-base focus:outline-none cursor-pointer"
            >
              {EMOJI_OPTIONS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') setAdding(false)
              }}
              placeholder="Topic name…"
              maxLength={30}
              className="w-28 bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={isPending || !name.trim()}
              className="text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-40 font-medium"
            >
              {isPending ? '…' : 'Add'}
            </button>
            <button
              onClick={() => { setAdding(false); setName('') }}
              className="text-xs text-slate-600 hover:text-slate-400"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
