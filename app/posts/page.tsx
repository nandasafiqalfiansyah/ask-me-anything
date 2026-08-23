import { getPosts } from '@/lib/posts'
import PostsWithSearch from '@/components/posts-with-search'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <section className='pb-24 pt-36 sm:pt-40'>
      <div className='container max-w-3xl px-4 sm:px-6'>
        <div className='mb-10'>
          <h1 className='font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
            Articles & Notes
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            Thoughts, technical tutorials, and insights on modern web engineering and AI.
          </p>
        </div>

        <PostsWithSearch posts={posts} />
      </div>
    </section>
  )
}
