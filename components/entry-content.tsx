'use client'
import type { JSONContent } from '@tiptap/core'
import { useMemo } from 'react'

// ── Legacy Tiptap-JSON renderer (for entries saved before the HTML switch) ──

function esc(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function applyMarks(text: string, marks?: JSONContent['marks']): string {
  if (!marks?.length) return text
  let result = text
  for (const mark of marks) {
    if (mark.type === 'link') {
      const rawHref = (mark.attrs?.href as string) || ''
      if (!rawHref) return result // no href — render as plain text
      const href = esc(rawHref)
      const target = esc((mark.attrs?.target as string) || '_blank')
      result = `<a href="${href}" target="${target}" rel="noopener noreferrer" style="color:#818cf8;text-decoration:underline;cursor:pointer">${result}</a>`
    } else if (mark.type === 'bold') {
      result = `<strong>${result}</strong>`
    } else if (mark.type === 'italic') {
      result = `<em>${result}</em>`
    } else if (mark.type === 'code') {
      result = `<code style="background:rgba(255,255,255,.1);padding:0 4px;border-radius:3px;font-size:0.8em">${result}</code>`
    }
  }
  return result
}

function renderNode(node: JSONContent): string {
  if (node.type === 'text') return applyMarks(esc(node.text ?? ''), node.marks)
  const inner = (node.content ?? []).map(renderNode).join('')
  switch (node.type) {
    case 'doc':          return inner
    case 'paragraph':    return `<p style="margin:0">${inner}</p>`
    case 'hardBreak':    return '<br>'
    case 'bulletList':   return `<ul style="list-style:disc;padding-left:1.2rem;margin:0">${inner}</ul>`
    case 'orderedList':  return `<ol style="list-style:decimal;padding-left:1.2rem;margin:0">${inner}</ol>`
    case 'listItem':     return `<li>${inner}</li>`
    default:             return inner
  }
}

// ── Component ──

export function EntryContent({ content }: { content: JSONContent }) {
  const html = useMemo(() => {
    try {
      // New format: { type: 'html', html: '<p>...</p>' }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((content as any).type === 'html') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (content as any).html as string
      }
      // Legacy format: Tiptap JSON doc
      return renderNode(content)
    } catch {
      return '<span style="color:#94a3b8">(Unable to display content)</span>'
    }
  }, [content])

  return (
    <div
      className="text-sm text-slate-200 leading-relaxed [&_a]:text-indigo-400 [&_a]:underline [&_a]:cursor-pointer"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={(e) => {
        const link = (e.target as HTMLElement).closest('a')
        if (!link) return
        e.preventDefault()
        const href = link.getAttribute('href')
        if (href && href !== '#') window.open(href, '_blank', 'noopener,noreferrer')
      }}
    />
  )
}
