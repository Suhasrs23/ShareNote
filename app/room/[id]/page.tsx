import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { JSONContent } from '@tiptap/core'
import { TopicTabs } from '@/components/topic-tabs'
import { EntryEditor } from '@/components/entry-editor'
import { EntryFeed } from '@/components/entry-feed'
import { ScrollToEntry } from '@/components/scroll-to-entry'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

interface RoomPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ topic?: string }>
}

export default async function RoomPage({ params, searchParams }: RoomPageProps) {
  const { id } = await params
  const { topic: topicId } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch room — RLS auto-blocks non-members
  const { data: room } = await supabase
    .from('rooms')
    .select('id, name, description, invite_code, created_by')
    .eq('id', id)
    .single()

  if (!room) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Access denied</h1>
            <p className="text-slate-400 text-sm mt-1">You&apos;re not a member of this room.</p>
          </div>
          <Link href="/dashboard" className="text-indigo-400 text-sm hover:underline">← Back to dashboard</Link>
        </div>
      </main>
    )
  }

  // Fetch topics, member count, my role — in parallel
  const [topicsRes, membersRes] = await Promise.all([
    supabase.from('topics').select('id, name, emoji').eq('room_id', id).order('created_at', { ascending: true }),
    supabase.from('room_members').select('user_id, role').eq('room_id', id),
  ])

  const topics = topicsRes.data ?? []
  const members = membersRes.data ?? []
  const memberCount = members.length
  const myRole = members.find(m => m.user_id === user.id)?.role ?? 'member'

  // Fetch entries for the selected topic
  type Profile = { id: string; display_name: string | null; avatar_url: string | null }
  type Entry = { id: string; content: JSONContent; created_at: string; created_by: string; profiles: Profile | null }
  let entries: Entry[] = []

  if (topicId) {
    const { data } = await supabase
      .from('entries')
      .select('id, content, created_at, created_by, profiles(id, display_name, avatar_url)')
      .eq('room_id', id)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true })
    entries = (data ?? []) as unknown as Entry[]
  }

  const activeTopic = topics.find(t => t.id === topicId)

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-5 py-3">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            aria-label="Back to dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white truncate">{room.name}</h1>
            <p className="text-xs text-slate-500">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            myRole === 'owner'
              ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
              : 'bg-slate-700/50 text-slate-400 border border-slate-700'
          }`}>
            {myRole}
          </span>
        </div>
      </header>

      {/* ── Topic tabs ── */}
      <div className="sticky top-[57px] z-20 border-b border-white/5 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto">
          <TopicTabs topics={topics} roomId={id} currentTopicId={topicId ?? null} />
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-5 py-6 pb-64 flex flex-col gap-4">
        {/* No topics yet */}
        {topics.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold">Create your first topic</p>
              <p className="text-slate-500 text-sm mt-1">
                Topics organise your notes into categories.<br />
                Hit <span className="font-semibold text-slate-400">+ Topic</span> above to get started.
              </p>
            </div>
          </div>
        )}

        {/* Topic selected but no entries */}
        {topicId && topics.length > 0 && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="text-3xl">{activeTopic?.emoji ?? '📌'}</div>
            <div>
              <p className="text-white font-semibold">{activeTopic?.name ?? 'Topic'}</p>
              <p className="text-slate-500 text-sm mt-1">No entries yet. Be the first to post something!</p>
            </div>
          </div>
        )}

        {/* No topic selected */}
        {!topicId && topics.length > 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-slate-500 text-sm">← Select a topic to see its entries</p>
          </div>
        )}

        {/* Entries feed */}
        {entries.length > 0 && (
          <div>
            <Suspense fallback={null}>
              <ScrollToEntry />
            </Suspense>
            <EntryFeed
              entries={entries}
              currentUserId={user.id}
              roomId={id}
              topicId={topicId!}
            />
          </div>
        )}
      </div>

      {/* ── Sticky entry editor ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/5 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <EntryEditor roomId={id} topicId={topicId ?? null} />
        </div>
      </div>
    </main>
  )
}
