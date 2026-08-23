import Link from 'next/link'
import { getPosts } from '@/lib/posts'
import Posts from '@/components/posts'
import { MotionWrapper } from '@/components/motion-wrapper'

export default async function RecentPosts() {
  const posts = await getPosts(3)

  return (
    <section className='pb-16 sm:pb-24'>
      <MotionWrapper delay={0.2}>
        <div className='flex items-end justify-between gap-4 pb-8'>
          <div>
            <h2 className='font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
              Recent Articles & Writing
            </h2>
            <p className='mt-2 text-sm text-muted-foreground'>
              Insights on web development, AI integration, and engineering practices
            </p>
          </div>

          <Link
            href='/posts'
            className='hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground'
          >
            <span>All Articles</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='h-3.5 w-3.5'
            >
              <path
                fillRule='evenodd'
                d='M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z'
                clipRule='evenodd'
              />
            </svg>
          </Link>
        </div>

        <Posts posts={posts} />

        <div className='mt-8 sm:hidden'>
          <Link
            href='/posts'
            className='inline-flex items-center gap-2 text-xs font-medium text-muted-foreground underline decoration-1 underline-offset-2 transition-colors hover:text-foreground'
          >
            <span>All Articles</span>
          </Link>
        </div>
      </MotionWrapper>
    </section>
  )
}

