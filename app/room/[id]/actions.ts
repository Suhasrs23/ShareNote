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
  sendPushesToRoomMembers(roomId, topicId, user.id, content).catch((e) =>
    console.error('[push fan-out] error:', e)
  )

  return { entryId: entryId as string }
}

/** Extracts a plain-text preview from a Tiptap JSON document (max N chars). */
function extractTextPreview(content: unknown, maxLength = 100): string {
  function walk(node: unknown): string {
    if (!node || typeof node !== 'object') return ''
    const n = node as Record<string, unknown>
    if (n.type === 'text') return typeof n.text === 'string' ? n.text : ''
    if (Array.isArray(n.content)) {
      return (n.content as unknown[]).map(walk).join('')
    }
    return ''
  }
  const text = walk(content).replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text
}

/** Fetches all room members (except poster) and sends them a push notification. */
async function sendPushesToRoomMembers(
  roomId: string,
  topicId: string,
  posterId: string,
  content: object
) {
  const admin = createAdminClient()

  // Fetch poster, room, topic — in parallel
  const [posterRes, roomRes, topicRes] = await Promise.all([
    admin.from('profiles').select('display_name').eq('id', posterId).single(),
    admin.from('rooms').select('name').eq('id', roomId).single(),
    admin.from('topics').select('name, emoji').eq('id', topicId).single(),
  ])

  // Fetch all member user_ids except the poster
  const { data: members } = await admin
    .from('room_members')
    .select('user_id')
    .eq('room_id', roomId)
    .neq('user_id', posterId)

  if (!members || members.length === 0) return

  const memberIds = members.map((m) => m.user_id)

  // Fetch all push subscriptions for those members
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('subscription')
    .in('user_id', memberIds)

  if (!subs || subs.length === 0) return

  // Build the rich notification payload
  const posterName = posterRes.data?.display_name ?? 'Someone'
  const roomName   = roomRes.data?.name ?? 'a room'
  const topicEmoji = topicRes.data?.emoji ?? '📌'
  const topicName  = topicRes.data?.name ?? 'General'
  const preview    = extractTextPreview(content, 90)

  // Title: room name — where it happened
  // Body:  who · which topic (new line) content preview in quotes
  const bodyLine1 = `${posterName}  ·  ${topicEmoji} ${topicName}`
  const bodyLine2 = preview ? `"${preview}"` : ''

  const payload: PushPayload = {
    title: `📬 ${roomName}`,
    body: bodyLine2 ? `${bodyLine1}\n${bodyLine2}` : bodyLine1,
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

