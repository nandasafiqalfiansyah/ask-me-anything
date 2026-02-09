'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

import { PostMetadata } from '@/lib/posts'
import { formatDate } from '@/lib/utils'

export default function Posts({ posts }: { posts: PostMetadata[] }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <motion.ul
      variants={containerVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-50px' }}
      className='flex flex-col gap-8'
    >
      {posts.map(post => (
        <motion.li
          key={post.slug}
          variants={itemVariants}
          whileHover={{ x: 10, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Link
            href={`/posts/${post.slug}`}
            className='flex flex-col justify-between gap-x-4 gap-y-1 sm:flex-row'
          >
            <div className='max-w-lg'>
              <p className='text-lg font-semibold'>{post.title}</p>
              <p className='mt-1 line-clamp-2 text-sm font-light text-muted-foreground'>
                {post.summary}
              </p>
            </div>

            {post.publishedAt && (
              <p className='mt-1 text-sm font-light'>
                {formatDate(post.publishedAt)}
              </p>
            )}
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  )
}
