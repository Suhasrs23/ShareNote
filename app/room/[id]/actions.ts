'use server'
import { createClient } from '@/lib/supabase/server'
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
  return { entryId: entryId as string }
}
