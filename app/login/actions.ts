'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')
  const next = (formData.get('next') as string) || '/dashboard'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) redirect('/auth/error')
  if (data.url) redirect(data.url)
}
