import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Server-only! Uses service role key to bypass RLS.
// NEVER import this in client components.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
