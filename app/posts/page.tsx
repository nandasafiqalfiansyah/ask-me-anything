import { getPosts } from '@/lib/posts'
import PostsPageClient from '@/components/posts-page-client'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  try {
    const posts = await getPosts()
    return <PostsPageClient initialPosts={posts || []} />
  } catch (error) {
    console.error('Error fetching posts in PostsPage:', error)
    return <PostsPageClient initialPosts={[]} />
  }
}
