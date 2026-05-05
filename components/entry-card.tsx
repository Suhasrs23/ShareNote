'use client'
import type { JSONContent } from '@tiptap/core'
import { EntryContent } from './entry-content'
import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { deleteEntry, updateEntry } from '@/app/room/[id]/actions'

interface EntryCardProps {
  id: string
  content: JSONContent
  createdAt: string
  author: { id: string; display_name: string | null; avatar_url: string | null } | null
  isCurrentUser: boolean
  roomId: string
  topicId: string
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

function getInitialHtml(content: JSONContent): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = content as any
  return c.type === 'html' ? (c.html as string) : ''
}

// ── Custom link bubble (Slack-style) ──
// Tiptap v3 removed BubbleMenu from @tiptap/react, so we implement it manually.
function LinkBubble({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [editMode, setEditMode] = useState(false)
  const [editUrl, setEditUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editor) return
    function sync() {
      if (editor!.isActive('link')) {
        const { from } = editor!.state.selection
        const coords = editor!.view.coordsAtPos(from)
        setPos({ top: coords.bottom + 6, left: coords.left })
        setVisible(true)
      } else {
        setVisible(false)
        setEditMode(false)
      }
    }
    editor.on('selectionUpdate', sync)
    editor.on('transaction', sync)
    return () => { editor.off('selectionUpdate', sync); editor.off('transaction', sync) }
  }, [editor])

  if (!visible || !editor) return null

  function openEdit() {
    setEditUrl(editor!.getAttributes('link').href ?? '')
    setEditMode(true)
    setTimeout(() => inputRef.current?.select(), 50)
  }

  function applyUrl() {
    if (!editUrl.trim()) return
    const url = editUrl.startsWith('http') ? editUrl : `https://${editUrl}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const linkMark = (editor!.state.schema.marks as any).link
    if (!linkMark) return
    const { from, to } = editor!.state.selection
    editor!.view.dispatch(
      editor!.state.tr.addMark(from, to, linkMark.create({ href: url, target: '_blank', rel: 'noopener noreferrer' }))
    )
    editor!.commands.focus()
    setEditMode(false)
  }

  const href = editor.getAttributes('link').href ?? ''
  const displayHref = href.length > 38 ? href.slice(0, 35) + '\u2026' : href

  return (
    // fixed so it escapes any overflow:hidden parents; onMouseDown prevents blur
    <div
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden text-xs flex items-stretch">
        {editMode ? (
          <div className="flex items-center gap-2 px-3 py-2">
            <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <input ref={inputRef} type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyUrl() } if (e.key === 'Escape') setEditMode(false) }}
              placeholder="https://example.com"
              className="w-52 bg-transparent text-white placeholder:text-slate-500 focus:outline-none" />
            <button onClick={applyUrl} className="text-indigo-400 hover:text-indigo-300 font-semibold px-1">Apply</button>
            <button onClick={() => setEditMode(false)} className="text-slate-500 hover:text-slate-300 px-1">✕</button>
          </div>
        ) : (
          <>
            <div className="px-3 py-2 text-slate-400 border-r border-white/10 max-w-[180px] truncate self-center" title={href}>
              {displayHref || 'No URL'}
            </div>
            <button onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 border-r border-white/10 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open
            </button>
            <button onClick={openEdit}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 border-r border-white/10 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button onClick={() => editor!.chain().focus().unsetLink().run()}
              className="flex items-center gap-1.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Inline edit editor ──
function EditMode({ entryId, roomId, initialHtml, onCancel, onSaved }: {
  entryId: string; roomId: string; initialHtml: string
  onCancel: () => void; onSaved: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false }),
      Link.configure({
        autolink: true,
        openOnClick: false, // clicks move cursor instead of navigating
        HTMLAttributes: { class: 'text-indigo-400 underline cursor-pointer', target: '_blank', rel: 'noopener noreferrer' },
      }),
    ],
    content: initialHtml,
    editorProps: { attributes: { class: 'min-h-[56px] text-sm text-white leading-relaxed focus:outline-none' } },
  })

  function handleSave() {
    if (!editor || isPending) return
    const content = { type: 'html', html: editor.getHTML() }
    startTransition(async () => { await updateEntry(entryId, content, roomId); onSaved() })
  }

  return (
    <div className="relative">
      {/* Slack-style link bubble menu */}
      <LinkBubble editor={editor} />

      <div className="bg-white/[0.06] border border-indigo-500/30 rounded-xl rounded-tl-sm px-4 py-3">
        <EditorContent
          editor={editor}
          onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); onCancel() } }}
        />
      </div>

      {/* Action row — always visible, not hover-only */}
      <div className="flex items-center gap-2 mt-2 px-1">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-white/10"
        >
          Cancel
        </button>
        <span className="text-xs text-slate-600 ml-auto">Click a link to edit it · Esc to cancel</span>
      </div>
    </div>
  )
}

// ── Icon helpers ──
const IconLink = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
)
const IconCheck = () => (
  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
)
const IconEdit = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)
const IconTrash = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

// ── Main card ──
export function EntryCard({ id, content, createdAt, author, isCurrentUser, roomId, topicId }: EntryCardProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const [isPendingDelete, startDeleteTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  if (isDeleted) return null

  const displayName = author?.display_name ?? 'Unknown'
  const initial = displayName.charAt(0).toUpperCase()

  function handleDelete() {
    if (!confirm('Delete this entry?')) return
    startDeleteTransition(async () => { setIsDeleted(true); await deleteEntry(id, roomId) })
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/room/${roomId}?topic=${topicId}&entry=${id}`
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className="flex gap-3 group" id={`entry-${id}`}>
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        {author?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={author.avatar_url} alt={displayName} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-600/30 border border-indigo-500/20 flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-300">{initial}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-semibold text-white">
            {displayName}
            {isCurrentUser && <span className="text-slate-600 font-normal text-xs"> · you</span>}
          </span>
          <span className="text-xs text-slate-600 tabular-nums">{formatTime(createdAt)}</span>

          {/* Action buttons — hover-reveal */}
          <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopyLink} title="Copy link to entry"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
              {copied ? <IconCheck /> : <IconLink />}
            </button>
            {isCurrentUser && !isEditing && (
              <button onClick={() => setIsEditing(true)} title="Edit entry"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
                <IconEdit />
              </button>
            )}
            {isCurrentUser && (
              <button onClick={handleDelete} disabled={isPendingDelete} title="Delete entry"
                className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-40">
                <IconTrash />
              </button>
            )}
          </div>
        </div>

        {/* Bubble or edit mode */}
        {isEditing ? (
          <EditMode entryId={id} roomId={roomId} initialHtml={getInitialHtml(content)}
            onCancel={() => setIsEditing(false)} onSaved={() => { setIsEditing(false); router.refresh() }} />
        ) : (
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl rounded-tl-sm px-4 py-3 hover:border-white/10 transition-colors">
            <EntryContent content={content} />
          </div>
        )}
      </div>
    </div>
  )
}
