'use client'
import { useEffect, useRef, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// ── Inner component (needs Suspense because of useSearchParams) ──
function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)

  const rafRef = useRef<number>(0)
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevUrl = useRef(pathname + searchParams.toString())

  function start() {
    if (hideRef.current) clearTimeout(hideRef.current)
    cancelAnimationFrame(rafRef.current)
    setVisible(true)
    let w = 0
    function tick() {
      // Accelerate toward 85% but never reach it automatically
      w = w + (85 - w) * 0.04
      setWidth(Math.min(w, 85))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function complete() {
    cancelAnimationFrame(rafRef.current)
    setWidth(100)
    hideRef.current = setTimeout(() => {
      setVisible(false)
      setWidth(0)
    }, 400)
  }

  // Detect navigation completion (pathname or searchParams changed)
  useEffect(() => {
    const newUrl = pathname + searchParams.toString()
    if (newUrl !== prevUrl.current) {
      prevUrl.current = newUrl
      complete()
    }
  }, [pathname, searchParams])

  // Detect navigation start: intercept history.pushState + popstate + <a> clicks
  useEffect(() => {
    // Patch pushState so router.push() triggers the bar
    const originalPush = history.pushState.bind(history)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    history.pushState = function (data: any, unused: string, url?: string | URL | null) {
      // @ts-expect-error - TypeScript's bind() types are sometimes too strict with tuples
      originalPush(data, unused, url)
      window.dispatchEvent(new Event('nav:start'))
    }

    function onNavStart() { start() }
    function onPopState() { start() }
    function onLinkClick(e: MouseEvent) {
      const link = (e.target as HTMLElement).closest('a')
      if (!link || !link.href || link.target === '_blank') return
      try {
        const url = new URL(link.href)
        if (url.origin !== window.location.origin) return
        if (url.pathname + url.search !== window.location.pathname + window.location.search) {
          start()
        }
      } catch { /* ignore */ }
    }

    window.addEventListener('nav:start', onNavStart)
    window.addEventListener('popstate', onPopState)
    document.addEventListener('click', onLinkClick)

    return () => {
      history.pushState = originalPush
      window.removeEventListener('nav:start', onNavStart)
      window.removeEventListener('popstate', onPopState)
      document.removeEventListener('click', onLinkClick)
      cancelAnimationFrame(rafRef.current)
      if (hideRef.current) clearTimeout(hideRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] h-[2px] pointer-events-none">
      <div
        className="h-full bg-indigo-500 transition-[width] duration-200 ease-out"
        style={{ width: `${width}%`, boxShadow: '0 0 10px 1px rgba(99,102,241,0.7)' }}
      />
    </div>
  )
}

// ── Exported wrapper with Suspense boundary ──
export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  )
}
