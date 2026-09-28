'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { PostMetadata } from '@/lib/posts'
import { formatDate } from '@/lib/utils'
import { useLanguage } from '@/lib/language-context'
import {
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Share2,
  Heart,
  MessageCircle,
  Eye,
  Check,
  ExternalLink,
  Flame,
  X
} from 'lucide-react'

interface PostsProps {
  posts: PostMetadata[]
  onBookmarkChange?: (slugs: string[]) => void
}

export default function Posts({ posts, onBookmarkChange }: PostsProps) {
  const { language } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null)
  const [claps, setClaps] = useState<Record<string, number>>({})
  const [bookmarked, setBookmarked] = useState<string[]>([])
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  // Load bookmarks and claps from localStorage once on mount
  useEffect(() => {
    setMounted(true)
    try {
      const savedBookmarks = localStorage.getItem('portfolio_bookmarked_posts')
      if (savedBookmarks) {
        const parsed = JSON.parse(savedBookmarks)
        setBookmarked(parsed)
        onBookmarkChange?.(parsed)
      }
      const savedClaps = localStorage.getItem('portfolio_claps_posts')
      if (savedClaps) {
        setClaps(JSON.parse(savedClaps))
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleBookmark = (e: React.MouseEvent, slug: string) => {
    e.preventDefault()
    e.stopPropagation()
    const next = bookmarked.includes(slug)
      ? bookmarked.filter(s => s !== slug)
      : [...bookmarked, slug]
    setBookmarked(next)
    try {
      localStorage.setItem('portfolio_bookmarked_posts', JSON.stringify(next))
    } catch {}
    onBookmarkChange?.(next)
  }

  const handleClap = (e: React.MouseEvent, slug: string) => {
    e.preventDefault()
    e.stopPropagation()
    const current = claps[slug] || 0
    const nextClaps = { ...claps, [slug]: current + 1 }
    setClaps(nextClaps)
    try {
      localStorage.setItem('portfolio_claps_posts', JSON.stringify(nextClaps))
    } catch {}
  }

  const handleShare = (e: React.MouseEvent, slug: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/posts/${slug}`
      navigator.clipboard.writeText(url)
      setCopiedSlug(slug)
      setTimeout(() => setCopiedSlug(null), 2000)
    }
  }

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

  // Estimate reading time from summary or title
  const getReadTime = (summary?: string) => {
    const words = (summary || '').split(/\s+/).length
    const minutes = Math.max(2, Math.ceil(words / 40) + 1)
    return `${minutes} min read`
  }

  // Derive publication or topic category
  const getTopic = (post: PostMetadata) => {
    if (post.tags && post.tags.length > 0) return post.tags[0]
    const lower = (post.title + ' ' + (post.summary || '')).toLowerCase()
    if (lower.includes('next.js') || lower.includes('react')) return 'Next.js & Web'
    if (lower.includes('astro')) return 'Astro.js'
    if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('model')) return 'AI & Machine Learning'
    if (lower.includes('shopify')) return 'Shopify Development'
    if (lower.includes('backend') || lower.includes('distributed')) return 'Backend Systems'
    return 'Software Engineering'
  }

  if (!posts || posts.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-border/80 p-12 text-center'>
        <p className='text-sm text-muted-foreground'>
          Belum ada artikel yang sesuai dengan filter pencarian.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className='space-y-6 sm:space-y-8'>
        {posts.map((post, idx) => {
          const isBookmarked = mounted && bookmarked.includes(post.slug)
          const topic = getTopic(post)
          const userClaps = mounted ? (claps[post.slug] || 0) : 0
          const baseClaps = (post.viewCount ? Math.floor(post.viewCount * 0.4) : 18) + userClaps
          const formattedClaps = baseClaps >= 1000 ? `${(baseClaps / 1000).toFixed(1)}K` : baseClaps

          return (
            <article
              key={post.slug || idx}
              className='group relative border-b border-border/60 pb-7 sm:pb-8 last:border-b-0'
            >
              {/* 1. Top Author & Publication Row (Medium style) */}
              <div className='flex items-center gap-2 mb-2.5 text-xs text-muted-foreground'>
                <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary/30 to-primary/10 text-[0.65rem] font-bold text-primary'>
                  {(post.author || 'N')[0].toUpperCase()}
                </div>
                <div className='flex flex-wrap items-center gap-1.5 truncate'>
                  <span className='font-medium text-foreground/80'>
                    In <span className='text-foreground font-semibold'>{topic}</span>
                  </span>
                  <span>by</span>
                  <span className='font-medium text-foreground/80'>
                    {post.author || 'Nanda Safiq'}
                  </span>
                  <span aria-hidden='true'>·</span>
                  {post.publishedAt && <time>{formatDate(post.publishedAt)}</time>}
                </div>
              </div>

              {/* 2. Main Content Body: Title + Excerpt on left, Image on right */}
              <div className='flex items-start justify-between gap-4 sm:gap-6'>
                <div className='flex-1 min-w-0 pr-1'>
                  <Link href={`/posts/${post.slug}`} className='block group-hover:text-primary transition-colors'>
                    <h2 className='font-serif text-lg sm:text-xl lg:text-2xl font-bold leading-snug tracking-tight text-foreground line-clamp-2'>
                      {post.title}
                    </h2>

                    {post.summary && (
                      <p className='mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2'>
                        {post.summary}
                      </p>
                    )}
                  </Link>

                  {/* 3. Bottom Action Bar (Medium style) */}
                  <div className='mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground'>
                    <div className='flex items-center gap-3.5 sm:gap-4'>
                      {/* Star / Recommended Icon */}
                      <span className='flex items-center text-amber-500' title='Pilihan Rekomendasi'>
                        <Sparkles className='h-3.5 w-3.5' />
                      </span>

                      {/* Claps / Likes */}
                      <button
                        onClick={(e) => handleClap(e, post.slug)}
                        title='Beri tepuk tangan (clap)'
                        className={`flex items-center gap-1.5 transition-colors hover:text-foreground ${
                          userClaps > 0 ? 'text-rose-500 font-semibold' : ''
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${userClaps > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span className='font-mono text-[0.72rem]'>{formattedClaps}</span>
                      </button>

                      {/* Views / Comments */}
                      <Link
                        href={`/posts/${post.slug}#comments`}
                        className='flex items-center gap-1.5 transition-colors hover:text-foreground'
                        title='Lihat tanggapan pembaca'
                      >
                        <MessageCircle className='h-3.5 w-3.5' />
                        <span className='font-mono text-[0.72rem]'>
                          {post.viewCount ? Math.floor(post.viewCount / 45) + 3 : 4}
                        </span>
                      </Link>

                      {/* Read time */}
                      <span className='text-[0.7rem] text-muted-foreground/80 hidden sm:inline-block'>
                        {getReadTime(post.summary)}
                      </span>
                    </div>

                    {/* Right side actions: Bookmark & Share */}
                    <div className='flex items-center gap-2'>
                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => toggleBookmark(e, post.slug)}
                        title={isBookmarked ? 'Hapus dari daftar bacaan' : 'Simpan ke daftar bacaan'}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                          isBookmarked
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className='h-4 w-4' />
                        ) : (
                          <Bookmark className='h-4 w-4' />
                        )}
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={(e) => handleShare(e, post.slug)}
                        title='Salin link artikel'
                        className='inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors'
                      >
                        {copiedSlug === post.slug ? (
                          <Check className='h-3.5 w-3.5 text-emerald-500' />
                        ) : (
                          <Share2 className='h-3.5 w-3.5' />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Article Thumbnail Image */}
                {post.image ? (
                  <div
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setLightboxImage({ src: post.image!, alt: post.title || '' })
                    }}
                    className='relative h-20 w-28 sm:h-24 sm:w-36 md:h-28 md:w-44 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-muted shadow-xs transition-transform duration-300 hover:scale-[1.02]'
                  >
                    <Image
                      src={post.image}
                      alt={post.title || ''}
                      fill
                      className='object-cover transition-transform duration-300 group-hover:scale-[1.04]'
                      sizes='(max-width: 640px) 112px, (max-width: 768px) 144px, 176px'
                    />
                  </div>
                ) : (
                  <div className='flex h-20 w-28 sm:h-24 sm:w-36 md:h-28 md:w-44 shrink-0 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/30 text-xs text-muted-foreground/60'>
                    <span>Artikel MDX</span>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm'
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className='absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20'
              aria-label='Close lightbox'
            >
              <X className='h-6 w-6' />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='relative max-h-[85vh] max-w-[90vw]'
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                width={1200}
                height={800}
                className='max-h-[85vh] w-auto rounded-xl object-contain shadow-2xl'
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
