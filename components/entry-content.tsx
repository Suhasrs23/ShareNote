'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import type { JSONContent } from '@tiptap/core'

export function EntryContent({ content }: { content: JSONContent }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false }),
      Link.configure({
        autolink: true,
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-indigo-400 underline hover:text-indigo-300',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: 'text-sm text-slate-200 leading-relaxed focus:outline-none',
      },
    },
  })

  return <EditorContent editor={editor} />
}
