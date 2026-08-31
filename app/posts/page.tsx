import { getPosts } from '@/lib/posts'
import PostsPageClient from '@/components/posts-page-client'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const posts = await getPosts()

  return <PostsPageClient initialPosts={posts} />
}
