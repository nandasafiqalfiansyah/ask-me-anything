import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

import { formatDate, getReadingTime } from '@/lib/utils'
import MDXContent from '@/components/mdx-content'
import { getPosts, getPostBySlug, getPostViewCount } from '@/lib/posts'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { notFound } from 'next/navigation'
import NewsletterForm from '@/components/newsletter-form'
import PostViewCounter from '@/components/post-view-counter'
import PostComments from '@/components/post-comments'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateStaticParams() {
  const posts = await getPosts()
  const slugs = posts.map(post => ({ slug: post.slug }))

  return slugs
}

export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return { title: 'Post not found' }
  }

  const { title, summary, image } = post.metadata

  return {
    title,
    description: summary,
    openGraph: {
      title,
      description: summary,
      type: 'article',
      ...(image && { images: [{ url: image }] })
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description: summary,
      ...(image && { images: [image] })
    }
  }
}

export default async function Post({ params }: { params: { slug: string } }) {
  const { slug } = params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const { metadata, content } = post
  const { title, summary, image, author, publishedAt } = metadata
  const initialViewCount = await getPostViewCount(slug)
  const readingTime = getReadingTime(content)

  return (
    <article className='pb-24 pt-32'>
      {/* Back link */}
      <div className='container mb-8 max-w-3xl'>
        <Link
          href='/posts'
          className='inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeftIcon className='h-4 w-4' />
          <span>Back to posts</span>
        </Link>
      </div>

      {/* Title block — Medium-style centered header */}
      <header className='container mx-auto max-w-3xl px-4 text-center'>
        <h1 className='font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl'>
          {title}
        </h1>

        {summary && (
          <p className='mx-auto mt-5 max-w-2xl text-lg text-muted-foreground'>
            {summary}
          </p>
        )}

        <div className='mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground'>
          <span className='font-medium text-foreground'>{author}</span>
          <span aria-hidden>·</span>
          <time dateTime={publishedAt}>{formatDate(publishedAt ?? '')}</time>
          <span aria-hidden>·</span>
          <span>{readingTime} min read</span>
          <span aria-hidden>·</span>
          <PostViewCounter
            slug={slug}
            initialCount={initialViewCount}
            className='text-sm text-muted-foreground'
          />
        </div>
      </header>

      {/* Banner — lebar sama dengan navbar */}
      {image && (
        <div className='container mt-10 max-w-3xl sm:mt-12'>
          <div className='relative aspect-[2/1] overflow-hidden rounded-lg border border-border/60 bg-muted'>
            <Image
              src={image}
              alt={title || ''}
              className='object-cover'
              fill
              priority
              sizes='(max-width: 768px) 100vw, 768px'
            />
          </div>
        </div>
      )}

      {/* Article body */}
      <main className='container mx-auto mt-12 max-w-3xl sm:mt-16'>
        <div className='prose prose-lg max-w-none dark:prose-invert'>
          <MDXContent source={content} />
        </div>

        <PostComments slug={slug} />
      </main>

      <footer className='container mx-auto mt-20 max-w-3xl'>
        <NewsletterForm />
      </footer>
    </article>
  )
}
