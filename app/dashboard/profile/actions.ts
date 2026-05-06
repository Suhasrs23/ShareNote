'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const displayName = (formData.get('display_name') as string)?.trim()
  const avatarUrl = (formData.get('avatar_url') as string)?.trim() || null

  if (!displayName) {
    return { error: 'Display name is required' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Update profile record in public.profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .eq('id', user.id)

  if (profileError) {
    console.error('Failed to update profile record:', profileError)
    return { error: 'Failed to update profile' }
  }

  // Update user_metadata as well to keep them in sync
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: displayName,
      avatar_url: avatarUrl
    }
  })

  if (authError) {
    console.error('Failed to update auth metadata:', authError)
    // Non-fatal, profile is updated
  }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  revalidatePath('/room/[id]', 'layout')
  
  return { success: true }
}
