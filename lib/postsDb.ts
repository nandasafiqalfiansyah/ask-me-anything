import { supabaseAdmin } from './supabaseAdmin'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type DbPost = {
  id: number
  slug: string
  title: string
  summary: string | null
  image_url: string | null
  author: string | null
  published_at: string
  published: boolean
  content: string
  created_at: string
  updated_at: string
}

export type PostApiItem = {
  id: string
  slug: string
  title: string
  summary: string
  author: string
  publishedAt: string
  published: boolean
  content: string
  image?: string
}

type SupabaseErrorLike = {
  message?: string
  code?: string
  details?: string
}

export function toUserFacingDbError(error: SupabaseErrorLike): string {
  const message = error.message ?? ''

  if (
    error.code === 'PGRST205' ||
    message.includes('Could not find the table') ||
    message.includes('relation "posts" does not exist')
  ) {
    return 'Tabel posts belum ada di Supabase. Jalankan migrasi: buka SQL Editor, salin isi file supabase/migrations/add_db_posts.txt, lalu Run.'
  }

  if (
    message.includes('fetch failed') ||
    message.includes('ENOTFOUND') ||
    message.includes('ECONNREFUSED')
  ) {
    return 'Tidak bisa terhubung ke Supabase. Periksa NEXT_PUBLIC_SUPABASE_URL di .env dan pastikan project Supabase masih aktif.'
  }

  if (error.code === '23505') {
    return 'Slug post sudah dipakai. Gunakan judul yang berbeda.'
  }

  return message || 'Gagal mengakses database Supabase'
}

export function hasSupabaseServerConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export function validateSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function toApiPost(row: DbPost): PostApiItem {
  return {
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? '',
    author: row.author ?? 'Admin',
    publishedAt: row.published_at,
    published: row.published,
    content: row.content,
    image: row.image_url ?? undefined
  }
}

export async function listPostsFromDb(options?: {
  includeDrafts?: boolean
}): Promise<PostApiItem[]> {
  let query = supabaseAdmin
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false })

  if (!options?.includeDrafts) {
    query = query.eq('published', true)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data as DbPost[]).map(toApiPost)
}

export async function getPostFromDb(
  slug: string,
  options?: { includeDrafts?: boolean }
): Promise<PostApiItem | null> {
  let query = supabaseAdmin.from('posts').select('*').eq('slug', slug)

  if (!options?.includeDrafts) {
    query = query.eq('published', true)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return toApiPost(data as DbPost)
}

export async function createUniqueSlug(baseTitle: string): Promise<string> {
  let slug = slugify(baseTitle)
  if (!slug) {
    slug = `post-${Date.now()}`
  }

  let counter = 0
  let candidate = slug

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('slug')
      .eq('slug', candidate)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) {
      return candidate
    }

    counter++
    candidate = `${slug}-${counter}`
  }
}
