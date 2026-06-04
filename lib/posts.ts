import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unstable_noStore as noStore } from 'next/cache'
import { supabaseAdmin } from './supabaseAdmin'
import {
  getPostFromDb,
  hasSupabaseServerConfig,
  listPostsFromDb
} from './postsDb'

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
  published?: boolean
  slug: string
  viewCount?: number
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

async function getPostBySlugFromFiles(slug: string): Promise<Post | null> {
  try {
    const filePath = path.join(rootDirectory, `${slug}.mdx`)
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
    const { data, content } = matter(fileContent)
    if (data.published === false) {
      return null
    }
    return { metadata: { ...data, slug }, content }
  } catch {
    return null
  }
}

async function getPostsFromFiles(limit?: number): Promise<PostMetadata[]> {
  if (!fs.existsSync(rootDirectory)) {
    return []
  }

  const files = fs.readdirSync(rootDirectory)

  const posts = files
    .map(file => getPostMetadata(file))
    .filter(post => post.published !== false)
    .sort((a, b) => {
      if (new Date(a.publishedAt ?? '') < new Date(b.publishedAt ?? '')) {
        return 1
      }
      return -1
    })

  return limit ? posts.slice(0, limit) : posts
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  noStore()

  if (hasSupabaseServerConfig()) {
    try {
      const row = await getPostFromDb(slug)
      if (row) {
        return {
          metadata: {
            title: row.title,
            summary: row.summary,
            image: row.image,
            author: row.author,
            publishedAt: row.publishedAt,
            slug: row.slug
          },
          content: row.content
        }
      }
    } catch (error) {
      console.error('Error fetching post from Supabase:', error)
    }
  }

  return getPostBySlugFromFiles(slug)
}

export async function getPosts(limit?: number): Promise<PostMetadata[]> {
  noStore()

  if (hasSupabaseServerConfig()) {
    try {
      const rows = await listPostsFromDb()
      const postList = limit ? rows.slice(0, limit) : rows
      const viewsMap = await getPostViewsMap(postList.map(post => post.slug))

      return postList.map(post => ({
        title: post.title,
        summary: post.summary,
        image: post.image,
        author: post.author,
        publishedAt: post.publishedAt,
        slug: post.slug,
        viewCount: viewsMap[post.slug] ?? 0
      }))
    } catch (error) {
      console.error('Error fetching posts from Supabase:', error)
    }
  }

  const postList = await getPostsFromFiles(limit)
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
  return { ...data, slug, published: data.published !== false }
}
