// lib/supabase/admin.ts
// Creates a Supabase client using the service-role key.
// ⚠️  NEVER import this from client-side code.
// Use only in Server Actions and API Routes that need to bypass RLS.

import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
