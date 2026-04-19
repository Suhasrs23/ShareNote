'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function joinRoom(roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check not already a member
  const { data: existing } = await supabase
    .from('room_members')
    .select('user_id')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    await supabase
      .from('room_members')
      .insert({ room_id: roomId, user_id: user.id, role: 'member' })
  }

  redirect(`/room/${roomId}`)
}
