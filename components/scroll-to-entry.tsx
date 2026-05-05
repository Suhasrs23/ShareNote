'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function ScrollToEntry() {
  const searchParams = useSearchParams()
  const entryId = searchParams.get('entry')

  useEffect(() => {
    if (!entryId) return
    // Small delay to let the DOM render
    const timer = setTimeout(() => {
      const el = document.getElementById(`entry-${entryId}`)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Brief highlight ring
      el.style.transition = 'box-shadow 0.3s ease'
      el.style.boxShadow = '0 0 0 2px #6366f1'
      setTimeout(() => { el.style.boxShadow = '' }, 2000)
    }, 300)
    return () => clearTimeout(timer)
  }, [entryId])

  return null
}
