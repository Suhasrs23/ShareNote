// lib/web-push.ts
// Server-side helper: configure VAPID and expose sendPushNotification().
// Only import this from Server Actions or API Routes — never from client code.

import webpush, { type PushSubscription } from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  /** Optional tag to group/collapse notifications per room */
  tag?: string;
}

/**
 * Send a push notification to a single PushSubscription.
 * Swallows errors so one bad sub doesn't block others.
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<void> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err: unknown) {
    // 410 Gone = subscription expired/revoked — caller should delete it
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 410 || status === 404) {
      console.warn('[web-push] stale subscription, should be deleted:', status);
    } else {
      console.error('[web-push] sendNotification error:', err);
    }
  }
}
