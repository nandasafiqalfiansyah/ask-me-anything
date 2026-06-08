'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Cross2Icon } from '@radix-ui/react-icons'

import { PostMetadata } from '@/lib/posts'
import { formatDate } from '@/lib/utils'
import { useCallback, useEffect, useState } from 'react'

export default function Posts({ posts }: { posts: PostMetadata[] }) {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null)

  const closeLightbox = useCallback(() => setLightboxImage(null), [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox()
    }
    if (lightboxImage) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [lightboxImage, closeLightbox])

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
    <>
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
            <div className='flex flex-col gap-5 sm:flex-row'>
              {post.image ? (
                <div
                  className='relative aspect-[16/10] w-full shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border/60 bg-muted sm:w-44 md:w-52'
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setLightboxImage({ src: post.image!, alt: post.title || '' })
                  }}
                >
                  <Image
                    src={post.image}
                    alt={post.title || ''}
                    fill
                    className='object-cover transition-transform duration-300 group-hover:scale-[1.03]'
                    sizes='(max-width: 640px) 100vw, 208px'
                  />
                  <div className='absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20'>
                    <svg
                      className='h-6 w-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={2}
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6' />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className='flex aspect-[16/10] w-full shrink-0 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/50 sm:w-44 md:w-52'>
                  <span className='text-xs text-muted-foreground'>No image</span>
                </div>
              )}

              <Link href={`/posts/${post.slug}`} className='flex min-w-0 flex-1 flex-col justify-center'>
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
              </Link>
            </div>
          </motion.article>
        ))}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className='absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20'
              aria-label='Close lightbox'
            >
              <Cross2Icon className='h-6 w-6' />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='relative max-h-[85vh] max-w-[90vw]'
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                width={1200}
                height={800}
                className='max-h-[85vh] w-auto rounded-lg object-contain'
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}