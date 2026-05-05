'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useTransition, useEffect, useMemo, useRef } from 'react'
import { createEntry } from '@/app/room/[id]/actions'

interface EntryEditorProps {
  roomId: string
  topicId: string | null
}

// Use the standard Link extension — SafeLink's addAttributes() override
// broke href serialisation in Tiptap v3, causing href to be saved as empty string.

const getExtensions = (topicId: string | null) => [
  StarterKit.configure({ heading: false, codeBlock: false, blockquote: false }),
  Link.configure({
    autolink: true,
    linkOnPaste: false, // handled manually so we control the attrs saved to JSON
    openOnClick: false,
    validate: () => true,
    HTMLAttributes: {
      class: 'text-indigo-400 underline hover:text-indigo-300 cursor-pointer pointer-events-auto',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  }),
  Placeholder.configure({
    placeholder: topicId
      ? 'Share a link or write a note… select text + 🔗 to add a hyperlink'
      : 'Select a topic above to post an entry',
  }),
]

export function EntryEditor({ roomId, topicId }: EntryEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)

  const extensions = useMemo(() => getExtensions(topicId), [topicId])

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    editorProps: {
      attributes: {
        class: 'min-h-[72px] text-sm text-white leading-relaxed focus:outline-none cursor-text',
      },
      // Handle paste: if a URL is pasted while text is selected, apply it as a link
      handlePaste: (view, event) => {
        const { selection } = view.state
        if (selection.empty) return false
        const text = event.clipboardData?.getData('text/plain')?.trim() ?? ''
        if (!text) return false
        const url = text.startsWith('http') ? text : `https://${text}`
        try { new URL(url) } catch { return false }
        // Use ProseMirror transaction directly — Tiptap v3 setLink drops attrs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const linkMark = (view.state.schema.marks as any).link
        if (!linkMark) return false
        const tr = view.state.tr.addMark(
          selection.from, selection.to,
          linkMark.create({ href: url, target: '_blank', rel: 'noopener noreferrer' })
        )
        view.dispatch(tr)
        return true
      },
    },
  })

  // (cursor style is static — no need to update editorProps on topicId change,
  //  doing so would overwrite the handlePaste we registered in useEditor)

  // Safe manual DOM injection for the title tooltip in the editor
  useEffect(() => {
    if (!containerRef.current || !editor) return
    const updateTitles = () => {
      if (!containerRef.current) return
      const links = containerRef.current.querySelectorAll('a')
      links.forEach(link => {
        if (link.href && !link.title) {
          link.title = link.href
        }
      })
    }
    
    // Update titles whenever editor content changes
    editor.on('update', updateTitles)
    updateTitles() // initial run
    
    return () => { editor.off('update', updateTitles) }
  }, [editor])

  function applyLinkMark(url: string, from: number, to: number) {
    if (!editor) return
    // Use ProseMirror transaction directly — Tiptap v3 setLink() doesn't serialize attrs to JSON
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const linkMark = (editor.state.schema.marks as any).link
    if (!linkMark) return
    const tr = editor.state.tr.addMark(
      from, to,
      linkMark.create({ href: url, target: '_blank', rel: 'noopener noreferrer' })
    )
    editor.view.dispatch(tr)
    editor.commands.focus()
  }

  function applyLink() {
    if (!editor || !linkUrl) return
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`

    if (editor.state.selection.empty) {
      // Insert the URL as text first, then wrap it as a link
      editor.chain().focus().insertContent(url + ' ').run()
      const to = editor.state.selection.from - 1  // before the trailing space
      applyLinkMark(url, to - url.length, to)
    } else {
      const { from, to } = editor.state.selection
      applyLinkMark(url, from, to)
    }

    setLinkUrl('')
    setShowLinkInput(false)
  }

  function removeLink() {
    editor?.chain().focus().unsetLink().run()
  }

  function handleSubmit() {
    if (!editor || !topicId || isPending) return
    const text = editor.getText().trim()
    if (!text) return
    // Save as HTML — Tiptap v3 getJSON() drops link href attrs; getHTML() is always correct
    const content = { type: 'html', html: editor.getHTML() }
    setError(null)

    startTransition(async () => {
      const result = await createEntry(roomId, topicId, content)
      if (result?.error) {
        setError(result.error)
      } else {
        editor.commands.clearContent()
        setShowLinkInput(false)
      }
    })
  }

  const isLinkActive = editor?.isActive('link')
  const isBoldActive = editor?.isActive('bold')
  const isItalicActive = editor?.isActive('italic')

  return (
    <div ref={containerRef} className="flex flex-col bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-white/5">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run() }}
          className={`w-7 h-7 rounded-md text-xs font-bold transition-colors flex items-center justify-center ${
            isBoldActive ? 'bg-white/15 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'
          }`}
          title="Bold"
        >B</button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run() }}
          className={`w-7 h-7 rounded-md text-xs italic transition-colors flex items-center justify-center ${
            isItalicActive ? 'bg-white/15 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'
          }`}
          title="Italic"
        >i</button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            if (isLinkActive) {
              removeLink()
            } else {
              setShowLinkInput((v) => !v)
            }
          }}
          className={`w-7 h-7 rounded-md text-xs transition-colors flex items-center justify-center ${
            isLinkActive || showLinkInput
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'text-slate-500 hover:text-white hover:bg-white/5'
          }`}
          title={isLinkActive ? 'Remove link' : 'Add link'}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
      </div>

      {/* Link input bar */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-indigo-950/30">
          <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); applyLink() }
              if (e.key === 'Escape') setShowLinkInput(false)
            }}
            placeholder="https://example.com"
            className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-none"
          />
          <button onClick={applyLink} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Apply</button>
          <button onClick={() => setShowLinkInput(false)} className="text-xs text-slate-600 hover:text-slate-400">✕</button>
        </div>
      )}

      {/* Editor area */}
      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pb-2 text-xs text-red-400">{error}</div>
      )}

      {/* Submit bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-white/5">
        <p className="text-xs text-slate-600">
          {topicId ? 'Select text + 🔗 to hyperlink' : '← Pick a topic first'}
        </p>
        <button
          id="post-entry-btn"
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !topicId}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all active:scale-95"
        >
          {isPending ? (
            <>
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Posting…
            </>
          ) : (
            <>Post <span className="opacity-60">↵</span></>
          )}
        </button>
      </div>
    </div>
  )
}
