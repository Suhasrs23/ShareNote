// public/sw.js — TheDropZone Push Notification Service Worker
// Receives push events even when the app is closed.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'TheDropZone 🔔';
  const options = {
    body: data.body || 'New activity in your room',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/dashboard' },
    // Vibrate pattern: buzz, pause, buzz
    vibrate: [100, 50, 100],
    // Group notifications by room so they collapse
    tag: data.tag || 'dropzone-notification',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

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
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
