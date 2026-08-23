import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(
    url &&
      key &&
      url !== 'https://placeholder.supabase.co' &&
      key !== 'placeholder' &&
      !url.includes('placeholder') &&
      !key.includes('placeholder')
  )
}

let supabaseInstance: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

// Using a Proxy to delay initialization until the client is actually accessed
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabase()
    const value = Reflect.get(client, prop)
    return typeof value === 'function' ? value.bind(client) : value
  }
})

