import fs from 'fs'
import path from 'path'
import { supabaseAdmin } from './supabaseAdmin'
import { hasSupabaseServerConfig } from './postsDb'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const STORAGE_DIR = path.join(process.cwd(), '.data')
const STORAGE_FILE = path.join(STORAGE_DIR, 'post-views.json')

// Initial base view counts for built-in posts so they look authentic and active
const DEFAULT_VIEWS: Record<string, number> = {
  'introduction-to-nextjs': 248,
  'introduction-to-mdx': 175
}

// In-memory cache for fast, synchronous reads
let memoryCache: Record<string, number> = { ...DEFAULT_VIEWS }
let isLoadedFromFile = false

function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug)
}

function loadLocalViews(): Record<string, number> {
  if (isLoadedFromFile) {
    return memoryCache
  }

  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true })
    }

    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      const parsed = JSON.parse(data)
      if (parsed && typeof parsed === 'object') {
        memoryCache = { ...DEFAULT_VIEWS, ...parsed }
      }
    } else {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(DEFAULT_VIEWS, null, 2), 'utf8')
    }
  } catch (error) {
    console.error('Failed to load local post views file:', error)
  }

  isLoadedFromFile = true
  return memoryCache
}

function saveLocalViews(views: Record<string, number>) {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true })
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(views, null, 2), 'utf8')
  } catch (error) {
    console.error('Failed to save local post views file:', error)
  }
}

export async function getPostViewsMapStore(
  slugs: string[]
): Promise<Record<string, number>> {
  const localMap = loadLocalViews()
  const result: Record<string, number> = {}

  slugs.forEach(slug => {
    result[slug] = localMap[slug] ?? 0
  })

  if (!hasSupabaseServerConfig() || slugs.length === 0) {
    return result
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('post_views')
      .select('slug, views')
      .in('slug', slugs)

    if (!error && data) {
      data.forEach(item => {
        const remoteCount = Number(item.views ?? 0)
        const localCount = result[item.slug] ?? 0
        // Use the highest count between remote and local fallback
        const highest = Math.max(remoteCount, localCount)
        result[item.slug] = highest
        memoryCache[item.slug] = highest
      })
    }
  } catch (error) {
    console.error('Error fetching views from Supabase in getPostViewsMapStore:', error)
  }

  return result
}

export async function getPostViewCountStore(slug: string): Promise<number> {
  if (!isValidSlug(slug)) {
    return 0
  }

  const localMap = loadLocalViews()
  let currentViews = localMap[slug] ?? 0

  if (!hasSupabaseServerConfig()) {
    return currentViews
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('post_views')
      .select('views')
      .eq('slug', slug)
      .maybeSingle()

    if (!error && data) {
      const remoteViews = Number(data.views ?? 0)
      currentViews = Math.max(remoteViews, currentViews)
      memoryCache[slug] = currentViews
    }
  } catch (error) {
    console.error('Error fetching single post view count from Supabase:', error)
  }

  return currentViews
}

export async function incrementPostViewCountStore(slug: string): Promise<number> {
  if (!isValidSlug(slug)) {
    return 0
  }

  // 1. First increment in local memory/file store
  const localMap = loadLocalViews()
  const currentCount = localMap[slug] ?? 0
  const updatedCount = currentCount + 1
  memoryCache[slug] = updatedCount
  saveLocalViews(memoryCache)

  // 2. If Supabase is configured, sync to Supabase
  if (hasSupabaseServerConfig()) {
    try {
      // First try RPC
      const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
        'increment_post_views',
        { post_slug: slug }
      )

      if (!rpcError && typeof rpcData === 'number') {
        const finalViews = Math.max(Number(rpcData), updatedCount)
        memoryCache[slug] = finalViews
        saveLocalViews(memoryCache)
        return finalViews
      }

      // If RPC fails (e.g., function does not exist), fallback to direct upsert on post_views table
      const { data: existingData } = await supabaseAdmin
        .from('post_views')
        .select('views')
        .eq('slug', slug)
        .maybeSingle()

      const remoteBase = Number(existingData?.views ?? 0)
      const nextDbViews = Math.max(remoteBase + 1, updatedCount)

      const { error: upsertError } = await supabaseAdmin
        .from('post_views')
        .upsert(
          {
            slug,
            views: nextDbViews,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'slug' }
        )

      if (!upsertError) {
        memoryCache[slug] = nextDbViews
        saveLocalViews(memoryCache)
        return nextDbViews
      }
    } catch (error) {
      console.error('Error incrementing post views in Supabase:', error)
    }
  }

  return updatedCount
}
