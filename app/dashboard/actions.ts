'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export type CreateRoomState = { error: string } | null

export async function createRoom(
  _prevState: CreateRoomState,
  formData: FormData
): Promise<CreateRoomState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null

  if (!name) return { error: 'Room name is required.' }

  // 1. Create the room
  const { data: room, error } = await supabase
    .from('rooms')
    .insert({ name, description, created_by: user.id })
    .select()
    .single()

  if (error || !room) {
    console.error('createRoom error:', error)
    // Common cause: RLS INSERT policy not yet added in Supabase
    if (error?.code === '42501') {
      return { error: 'Permission denied. Make sure you ran the Phase 2 SQL in Supabase.' }
    }
    return { error: error?.message ?? 'Failed to create room. Please try again.' }
  }

  // 2. Add creator as owner
  const { error: memberError } = await supabase
    .from('room_members')
    .insert({ room_id: room.id, user_id: user.id, role: 'owner' })

  if (memberError) {
    console.error('room_members insert error:', memberError)
    // Clean up the orphaned room
    await supabase.from('rooms').delete().eq('id', room.id)
    return { error: 'Failed to set up room membership. Please try again.' }
  }

  revalidatePath('/dashboard')
  redirect(`/room/${room.id}`)
}
