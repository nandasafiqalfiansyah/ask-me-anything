import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { supabaseAdmin } from './supabaseAdmin'

const rootDirectory = path.join(process.cwd(), 'content', 'posts')
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type Post = {
  metadata: PostMetadata
  content: string
}

export type PostMetadata = {
  title?: string
  summary?: string
  image?: string
  author?: string
  publishedAt?: string
  slug: string
  viewCount?: number
}

function hasSupabaseServerConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug)
}

async function getPostViewsMap(
  slugs: string[]
): Promise<Record<string, number>> {
  if (!hasSupabaseServerConfig() || slugs.length === 0) {
    return {}
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('post_views')
      .select('slug, views')
      .in('slug', slugs)

    if (error) {
      console.error('Error fetching post views:', error)
      return {}
    }

    return (data || []).reduce<Record<string, number>>((acc, item) => {
      acc[item.slug] = Number(item.views ?? 0)
      return acc
    }, {})
  } catch (error) {
    console.error('Error fetching post views:', error)
    return {}
  }
}

export async function getPostViewCount(slug: string): Promise<number> {
  if (!isValidSlug(slug) || !hasSupabaseServerConfig()) {
    return 0
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('post_views')
      .select('views')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('Error fetching post view count:', error)
      return 0
    }

    return Number(data?.views ?? 0)
  } catch (error) {
    console.error('Error fetching post view count:', error)
    return 0
  }
}

export async function incrementPostViewCount(slug: string): Promise<number> {
  if (!isValidSlug(slug) || !hasSupabaseServerConfig()) {
    return 0
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('increment_post_views', {
      post_slug: slug
    })

    if (error) {
      console.error('Error incrementing post views:', error)
      return getPostViewCount(slug)
    }

    return Number(data ?? 0)
  } catch (error) {
    console.error('Error incrementing post views:', error)
    return getPostViewCount(slug)
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const filePath = path.join(rootDirectory, `${slug}.mdx`)
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
    const { data, content } = matter(fileContent)
    return { metadata: { ...data, slug }, content }
  } catch (error) {
    return null
  }
}

export async function getPosts(limit?: number): Promise<PostMetadata[]> {
  const files = fs.readdirSync(rootDirectory)

  const posts = files
    .map(file => getPostMetadata(file))
    .sort((a, b) => {
      if (new Date(a.publishedAt ?? '') < new Date(b.publishedAt ?? '')) {
        return 1
      } else {
        return -1
      }
    })

  const postList = limit ? posts.slice(0, limit) : posts
  const viewsMap = await getPostViewsMap(postList.map(post => post.slug))

  return postList.map(post => ({
    ...post,
    viewCount: viewsMap[post.slug] ?? 0
  }))
}

export function getPostMetadata(filepath: string): PostMetadata {
  const slug = filepath.replace(/\.mdx$/, '')
  const filePath = path.join(rootDirectory, filepath)
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
  const { data } = matter(fileContent)
  return { ...data, slug }
}
