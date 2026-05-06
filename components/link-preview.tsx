'use client'

import { useEffect, useState } from 'react'

interface LinkPreviewData {
  title: string
  description: string
  image: string
  siteName: string
  url: string
  error?: string
}

export function LinkPreview({ url }: { url: string }) {
  const [data, setData] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchPreview() {
      try {
        setLoading(true)
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
        if (!res.ok) {
          throw new Error('Failed to fetch preview')
        }
        const json = await res.json()
        if (isMounted) {
          setData(json)
        }
      } catch (err) {
        console.error('Error fetching link preview:', err)
        if (isMounted) {
          setData({ error: 'Failed to load preview', url, title: '', description: '', image: '', siteName: '' })
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchPreview()

    return () => {
      isMounted = false
    }
  }, [url])

  if (loading) {
    return (
      <div className="mt-3 max-w-xl rounded-xl border border-white/10 bg-white/5 overflow-hidden animate-pulse flex h-[100px] sm:h-[120px]">
        <div className="w-[100px] sm:w-[120px] bg-white/10 shrink-0"></div>
        <div className="p-3 flex flex-col justify-center gap-2 flex-1 min-w-0">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-3 bg-white/10 rounded w-1/2"></div>
          <div className="h-3 bg-white/10 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (!data || data.error || (!data.title && !data.description && !data.image)) {
    // If no useful data or error, just don't render the preview to save space
    return null
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 max-w-xl rounded-xl border border-white/10 bg-slate-800/50 hover:bg-slate-800 transition-colors overflow-hidden flex flex-col sm:flex-row group"
      // Stop propagation so clicking the preview doesn't trigger parent handlers if any
      onClick={(e) => e.stopPropagation()}
    >
      {data.image && (
        <div className="w-full sm:w-[140px] h-[140px] sm:h-auto shrink-0 bg-slate-900 overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.image}
            alt={data.title || 'Link preview image'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Hide image container on error
              (e.target as HTMLElement).parentElement!.style.display = 'none'
            }}
          />
        </div>
      )}
      <div className="p-3 sm:p-4 flex flex-col justify-center flex-1 min-w-0">
        <div className="text-xs text-slate-400 mb-1 truncate flex items-center gap-1.5">
          {data.siteName}
        </div>
        <div className="font-semibold text-sm text-slate-200 line-clamp-2 leading-tight mb-1.5 group-hover:text-indigo-400 transition-colors">
          {data.title || url}
        </div>
        {data.description && (
          <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {data.description}
          </div>
        )}
      </div>
    </a>
  )
}
