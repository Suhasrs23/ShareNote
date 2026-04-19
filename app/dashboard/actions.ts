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

  // Use SECURITY DEFINER function — bypasses RLS and validates auth.uid() inside Postgres
  // (Direct INSERT from Next.js server actions sometimes has auth.uid() = null in RLS context)
  const { data: roomId, error } = await supabase
    .rpc('create_room', {
      p_name: name,
      p_description: description,
    })

  if (error || !roomId) {
    console.error('createRoom rpc error:', JSON.stringify(error, null, 2))
    return {
      error: `Failed to create room: ${error?.message ?? 'Unknown error'}`,
    }
  }

  revalidatePath('/dashboard')
  redirect(`/room/${roomId}`)
}
