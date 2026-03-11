import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Global singleton to survive HMR (Hot Module Replacement)
// Prevents "Multiple GoTrueClient instances" warning
declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: SupabaseClient<Database> | undefined
}

export function createClient() {
  if (typeof window !== 'undefined' && globalThis.__supabaseClient) {
    return globalThis.__supabaseClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build/prerendering ENV vars may not exist.
  // Use placeholder values so the build succeeds — the client
  // is never actually called during SSR (only inside useEffect).
  const client = createBrowserClient<Database>(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder-anon-key'
  )

  if (typeof window !== 'undefined') {
    globalThis.__supabaseClient = client
  }

  return client
}
