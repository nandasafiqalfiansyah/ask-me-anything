import { getPosts } from '@/lib/posts'
import PostsWithSearch from '@/components/posts-with-search'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <section className='pb-24 pt-40'>
      <div className='container max-w-4xl'>
        <h1 className='mb-12 font-serif text-4xl font-bold'>Posts</h1>

        <PostsWithSearch posts={posts} />
      </div>
    </section>
  )
}
