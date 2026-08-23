import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function isSupabaseAdminConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(
    url &&
      key &&
      url.startsWith('https://') &&
      !url.includes('placeholder') &&
      key !== 'placeholder'
  )
}

let supabaseAdminInstance: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'

    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  return supabaseAdminInstance
}

// This should only be used in server-side code (API routes)
// Using a Proxy to delay initialization until the client is actually accessed
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_target, prop) => {
    if (prop === 'then' || prop === 'inspect' || typeof prop === 'symbol') {
      return undefined
    }

    const client = getSupabaseAdmin()
    const value = Reflect.get(client, prop)
    return typeof value === 'function' ? value.bind(client) : value
  }
})

