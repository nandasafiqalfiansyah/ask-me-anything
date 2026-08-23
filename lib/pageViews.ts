import { supabaseAdmin } from './supabaseAdmin'

const KEY_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function hasSupabaseServerConfig(): boolean {
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

function isValidKey(key: string): boolean {
  return KEY_REGEX.test(key)
}

export async function getPageViewCount(key: string): Promise<number> {
  if (!isValidKey(key) || !hasSupabaseServerConfig()) {
    return 0
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('page_views')
      .select('views')
      .eq('page_key', key)
      .maybeSingle()

    if (error) {
      console.error('Error fetching page view count:', error)
      return 0
    }

    return Number(data?.views ?? 0)
  } catch (error) {
    console.error('Error fetching page view count:', error)
    return 0
  }
}

export async function incrementPageViewCount(key: string): Promise<number> {
  if (!isValidKey(key) || !hasSupabaseServerConfig()) {
    return 0
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('increment_page_views', {
      page_key: key
    })

    if (error) {
      console.error('Error incrementing page views:', error)
      return getPageViewCount(key)
    }

    return Number(data ?? 0)
  } catch (error) {
    console.error('Error incrementing page views:', error)
    return getPageViewCount(key)
  }
}
