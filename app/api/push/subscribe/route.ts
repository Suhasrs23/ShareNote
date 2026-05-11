// app/api/push/subscribe/route.ts
// Receives a PushSubscription from the browser and stores it in Supabase.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const subscription = body.subscription as { endpoint: string };

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  // Upsert: same endpoint → update; new endpoint → insert
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        subscription: subscription,
      },
      { onConflict: 'endpoint' }
    );

  if (error) {
    console.error('[push/subscribe] DB error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
