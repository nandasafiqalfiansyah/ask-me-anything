'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

import { PostMetadata } from '@/lib/posts'
import { formatDate } from '@/lib/utils'

export default function Posts({ posts }: { posts: PostMetadata[] }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-50px' }}
      className='flex flex-col gap-10'
    >
      {posts.map(post => (
        <motion.article
          key={post.slug}
          variants={itemVariants}
          className='group'
        >
          <Link href={`/posts/${post.slug}`} className='flex flex-col gap-5 sm:flex-row'>
            {post.image && (
              <div className='relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-sm sm:w-48 md:w-56'>
                <Image
                  src={post.image}
                  alt={post.title || ''}
                  fill
                  className='object-cover transition-transform duration-300 group-hover:scale-105'
                  sizes='(max-width: 640px) 100vw, 224px'
                />
              </div>
            )}

            <div className='flex min-w-0 flex-1 flex-col justify-center'>
              <h2 className='font-serif text-xl font-bold leading-snug transition-colors group-hover:text-primary sm:text-2xl'>
                {post.title}
              </h2>

              {post.summary && (
                <p className='mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground'>
                  {post.summary}
                </p>
              )}

              <div className='mt-3 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground'>
                {post.author && <span>{post.author}</span>}
                {post.author && post.publishedAt && <span aria-hidden>·</span>}
                {post.publishedAt && <time>{formatDate(post.publishedAt)}</time>}
                <span aria-hidden>·</span>
                <span>{(post.viewCount ?? 0).toLocaleString('en-US')} views</span>
              </div>
            </div>
          </Link>
        </motion.article>
      ))}
    </motion.div>
  )
}
