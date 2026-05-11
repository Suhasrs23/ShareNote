'use client'
// components/notification-bell.tsx
// Lets a user enable/disable browser push notifications for a room.
// Registers the service worker, subscribes via VAPID, and syncs with the server.

import { useState, useEffect } from 'react'
import { BellIcon, BellOffIcon } from 'lucide-react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)))
}

type NotifState = 'idle' | 'granted' | 'denied' | 'unsupported' | 'loading'

export function NotificationBell({ roomId }: { roomId: string }) {
  const [state, setState] = useState<NotifState>('idle')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  // On mount: check if SW is supported, if already subscribed, etc.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }

    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      const existing = await reg.pushManager.getSubscription()
      if (existing) {
        setSubscription(existing)
        setState('granted')
      } else if (Notification.permission === 'denied') {
        setState('denied')
      }
    })
  }, [])

  async function handleToggle() {
    if (state === 'unsupported' || state === 'denied') return
    setState('loading')

    try {
      const reg = await navigator.serviceWorker.ready

      if (state === 'granted' && subscription) {
        // ── Unsubscribe ──────────────────────────────────────────────────────
        await subscription.unsubscribe()
        await fetch('/api/push/unsubscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
        setSubscription(null)
        setState('idle')
      } else {
        // ── Subscribe ────────────────────────────────────────────────────────
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setState('denied')
          return
        }

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub.toJSON() }),
        })

        setSubscription(sub)
        setState('granted')
      }
    } catch (err) {
      console.error('[NotificationBell]', err)
      setState('idle')
    }
  }

  // Don't render on unsupported browsers silently
  if (state === 'unsupported') return null

  const isOn = state === 'granted'
  const isLoading = state === 'loading'
  const isDenied = state === 'denied'

  return (
    <button
      id={`notification-bell-${roomId}`}
      onClick={handleToggle}
      disabled={isLoading || isDenied}
      title={
        isDenied
          ? 'Notifications blocked in browser settings'
          : isOn
          ? 'Turn off notifications'
          : 'Get notified of new posts'
      }
      className={`
        relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200
        ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        ${isDenied ? 'opacity-40 cursor-not-allowed' : ''}
        ${isOn
          ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30'
          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
        }
      `}
      aria-label={isOn ? 'Notifications on' : 'Notifications off'}
      aria-pressed={isOn}
    >
      {isLoading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : isOn ? (
        <>
          <BellIcon className="w-4 h-4" strokeWidth={2} />
          {/* Active dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400" />
        </>
      ) : (
        <BellOffIcon className="w-4 h-4" strokeWidth={2} />
      )}
    </button>
  )
}
