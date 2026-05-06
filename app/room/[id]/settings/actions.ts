'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveJoinRequest(requestId: string, roomId: string) {
  const supabase = await createClient()

  // The RPC will handle checking if the caller is the owner
  const { error } = await supabase.rpc('approve_join_request', { p_request_id: requestId })

  if (error) {
    console.error('approve_join_request error:', JSON.stringify(error, null, 2))
    return { error: 'Failed to approve request' }
  }

  revalidatePath(`/room/${roomId}/settings`)
  revalidatePath(`/room/${roomId}`)
  return { success: true }
}

export async function rejectJoinRequest(requestId: string, roomId: string) {
  const supabase = await createClient()

  // The RPC will handle checking if the caller is the owner
  const { error } = await supabase.rpc('reject_join_request', { p_request_id: requestId })

  if (error) {
    console.error('reject_join_request error:', JSON.stringify(error, null, 2))
    return { error: 'Failed to reject request' }
  }

  revalidatePath(`/room/${roomId}/settings`)
  return { success: true }
}

export async function updateRoom(roomId: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null

  if (!name) return { error: 'Room name is required' }

  const supabase = await createClient()

  // Verify owner
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: member } = await supabase
    .from('room_members')
    .select('role')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .single()

  if (member?.role !== 'owner') return { error: 'Not authorized' }

  const { error } = await supabase
    .from('rooms')
    .update({ name, description })
    .eq('id', roomId)

  if (error) {
    console.error('updateRoom error:', error)
    return { error: 'Failed to update room' }
  }

  revalidatePath(`/room/${roomId}/settings`)
  revalidatePath(`/room/${roomId}`)
  return { success: true }
}

export async function deleteRoom(roomId: string) {
  const supabase = await createClient()

  // Verify owner
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: member } = await supabase
    .from('room_members')
    .select('role')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .single()

  if (member?.role !== 'owner') return { error: 'Not authorized' }

  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', roomId)

  if (error) {
    console.error('deleteRoom error:', error)
    return { error: 'Failed to delete room' }
  }

  return { success: true }
}
