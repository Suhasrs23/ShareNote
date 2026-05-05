'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function joinRoom(inviteCode: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/join/${inviteCode}`)

  // Use SECURITY DEFINER function — same auth.uid() fix as createRoom
  const { data: roomId, error } = await supabase
    .rpc('join_room', { p_invite_code: inviteCode })

  if (error || !roomId) {
    console.error('joinRoom error:', JSON.stringify(error, null, 2))
    redirect('/dashboard')
  }

  redirect(`/room/${roomId}`)
}
