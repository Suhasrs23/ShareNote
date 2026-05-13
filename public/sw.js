// public/sw.js — TheDropZone Push Notification Service Worker
// Receives push events even when the app is closed.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'TheDropZone';
  const options = {
    body: data.body || 'New activity in your room',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/dashboard' },
    // Subtle vibration: tap, pause, tap-tap
    vibrate: [80, 100, 80, 100, 200],
    // Group + collapse by room so you don't get spammed
    tag: data.tag || 'dropzone-notification',
    renotify: true,
    // Keep notification visible until user interacts (where supported)
    requireInteraction: false,
    // Quick-action button so user can open without dismissing
    actions: [
      { action: 'open', title: '→ Open room' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // "Dismiss" action — just close, no navigation
  if (event.action === 'dismiss') return;

  const relativePath = event.notification.data?.url || '/dashboard';
  // clients.openWindow() and client.navigate() both require an absolute URL
  const targetUrl = relativePath.startsWith('http')
    ? relativePath
    : self.location.origin + relativePath;

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // If a window is already open, focus it and navigate
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            return client.navigate(targetUrl);
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
