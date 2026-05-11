'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushNotification, type PushPayload } from '@/lib/web-push'
import { revalidatePath } from 'next/cache'

export async function createTopic(roomId: string, name: string, emoji: string) {
  const supabase = await createClient()
  const { data: topicId, error } = await supabase.rpc('create_topic', {
    p_room_id: roomId,
    p_name: name,
    p_emoji: emoji || '📌',
  })

  if (error) {
    console.error('createTopic error:', error)
    return { error: error.message }
  }

  revalidatePath(`/room/${roomId}`)
  return { topicId: topicId as string }
}

export async function createEntry(roomId: string, topicId: string, content: object) {
  const supabase = await createClient()

  // Get the current user's profile so we can include their name in the notification
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: entryId, error } = await supabase.rpc('create_entry', {
    p_room_id: roomId,
    p_topic_id: topicId,
    p_content: content,
  })

  if (error) {
    console.error('createEntry error:', error)
    return { error: error.message }
  }

  revalidatePath(`/room/${roomId}`)

  // ── Fan-out push notifications (non-blocking) ──────────────────────────────
  // Run in background: a failure here should never affect the user's post.
  sendPushesToRoomMembers(roomId, topicId, user.id).catch((e) =>
    console.error('[push fan-out] error:', e)
  )

  return { entryId: entryId as string }
}

/** Fetches all room members (except poster) and sends them a push notification. */
async function sendPushesToRoomMembers(
  roomId: string,
  topicId: string,
  posterId: string
) {
  const admin = createAdminClient()

  // 1. Fetch poster's display name
  const { data: poster } = await admin
    .from('profiles')
    .select('display_name')
    .eq('id', posterId)
    .single()

  // 2. Fetch room name
  const { data: room } = await admin
    .from('rooms')
    .select('name')
    .eq('id', roomId)
    .single()

  // 3. Fetch all member user_ids except the poster
  const { data: members } = await admin
    .from('room_members')
    .select('user_id')
    .eq('room_id', roomId)
    .neq('user_id', posterId)

  if (!members || members.length === 0) return

  const memberIds = members.map((m) => m.user_id)

  // 4. Fetch all push subscriptions for those members
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('subscription')
    .in('user_id', memberIds)

  if (!subs || subs.length === 0) return

  // 5. Build payload and send to each subscription
  const posterName = poster?.display_name ?? 'Someone'
  const roomName = room?.name ?? 'a room'

  const payload: PushPayload = {
    title: 'TheDropZone 🔔',
    body: `${posterName} posted in ${roomName}`,
    url: `/room/${roomId}?topic=${topicId}`,
    tag: `room-${roomId}`,
  }

  await Promise.all(
    subs.map((row) =>
      sendPushNotification(
        row.subscription as Parameters<typeof sendPushNotification>[0],
        payload
      )
    )
  )
}


export async function deleteEntry(entryId: string, roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', entryId)
    .eq('created_by', user.id)

  if (error) {
    console.error('deleteEntry error:', error)
    return { error: error.message }
  }

  revalidatePath(`/room/${roomId}`)
  return { success: true }
}

export async function updateEntry(entryId: string, content: object, roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('entries')
    .update({ content })
    .eq('id', entryId)
    .eq('created_by', user.id)

  if (error) {
    console.error('updateEntry error:', error)
    return { error: error.message }
  }

  revalidatePath(`/room/${roomId}`)
  return { success: true }
}

