import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseAdminInstance: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL and Service Role Key are required')
    }

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
  get: (target, prop) => {
    const client = getSupabaseAdmin()
    const value = Reflect.get(client, prop)
    return typeof value === 'function' ? value.bind(client) : value
  }
})
