'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PostMetadata } from '@/lib/posts'
import { formatDate } from '@/lib/utils'
import {
  Sparkles,
  TrendingUp,
  Mail,
  Code2,
  Globe,
  CheckCircle2,
  ArrowRight,
  Award
} from 'lucide-react'

const POPULAR_TOPICS = [
  'Next.js 15',
  'TypeScript',
  'Shopify Dev',
  'Distributed Backend',
  'AI & ML',
  'PostgreSQL',
  'Web Performance',
  'Cloud Architecture'
]

interface BlogSidebarProps {
  posts?: PostMetadata[]
  selectedTopic?: string | null
  onSelectTopic?: (topic: string | null) => void
  bookmarkedSlugs?: string[]
}

export default function BlogSidebar({
  posts = [],
  selectedTopic = null,
  onSelectTopic
}: BlogSidebarProps) {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const safePosts = Array.isArray(posts) ? posts.filter(Boolean) : []

  // Staff Picks: up to 3 posts
  const staffPicks = safePosts.slice(0, 3)

  // Trending: top 4 sorted by view count
  const trendingPosts = [...safePosts]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 4)

  const handleCopyEmail = () => {
    if (typeof window !== 'undefined' && navigator && navigator.clipboard) {
      navigator.clipboard.writeText('nandasafiqalfiansyah@gmail.com')
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    }
  }

  return (
    <aside className='space-y-8'>
      {/* 1. Staff Picks */}
      <div className='space-y-3.5'>
        <div className='flex items-center gap-2'>
          <Award className='h-4 w-4 text-primary' />
          <h3 className='font-semibold text-sm tracking-tight text-foreground'>
            Staff Picks
          </h3>
        </div>

        <div className='space-y-3.5'>
          {staffPicks.map((post, idx) => {
            const authorName = post.author || 'Nanda Safiq'
            const initial = (authorName.trim()[0] || 'N').toUpperCase()
            return (
              <div key={post.slug || `pick-${idx}`} className='group space-y-1'>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-bold text-primary'>
                    {initial}
                  </div>
                  <span className='truncate font-medium text-foreground/80'>
                    {authorName}
                  </span>
                </div>

                <Link
                  href={`/posts/${post.slug || ''}`}
                  className='block font-serif text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2'
                >
                  {post.title || 'Untitled Post'}
                </Link>

                <div className='flex items-center gap-1.5 text-[0.7rem] text-muted-foreground'>
                  <Sparkles className='h-3 w-3 text-amber-500 shrink-0' />
                  {post.publishedAt && <time>{formatDate(post.publishedAt)}</time>}
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => onSelectTopic?.(null)}
          className='text-xs font-medium text-muted-foreground transition-colors hover:text-foreground inline-flex items-center gap-1 pt-1'
        >
          <span>Lihat semua pilihan</span>
          <ArrowRight className='h-3 w-3' />
        </button>
      </div>

      <div className='border-t border-border/60' />

      {/* 2. Recommended Topics */}
      <div className='space-y-3'>
        <h3 className='font-semibold text-sm tracking-tight text-foreground'>
          Recommended Topics
        </h3>
        <p className='text-xs text-muted-foreground'>
          Filter artikel berdasarkan topik keahlian
        </p>
        <div className='flex flex-wrap gap-2 pt-1'>
          {POPULAR_TOPICS.map(topic => {
            const isSelected = selectedTopic === topic
            return (
              <button
                key={topic}
                onClick={() => onSelectTopic?.(isSelected ? null : topic)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-foreground text-background font-semibold shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'
                }`}
              >
                {topic}
              </button>
            )
          })}
        </div>
      </div>

      <div className='border-t border-border/60' />

      {/* 3. Author Profile */}
      <div className='rounded-2xl border border-border/80 bg-card/60 p-5 space-y-3.5 shadow-xs'>
        <div className='flex items-center gap-3'>
          <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20 bg-muted'>
            <Image
              src='/images/authors/ndav.png'
              alt='Nanda Safiq Alfiansyah'
              width={48}
              height={48}
              className='h-12 w-12 rounded-full object-cover'
              referrerPolicy='no-referrer'
            />
          </div>
          <div>
            <div className='flex items-center gap-1.5'>
              <h4 className='font-bold text-sm text-foreground'>Nanda Safiq</h4>
              <CheckCircle2 className='h-3.5 w-3.5 text-blue-500 shrink-0' />
            </div>
            <p className='text-xs text-muted-foreground font-mono'>
              @ndav · Software Engineer
            </p>
          </div>
        </div>

        <p className='text-xs leading-relaxed text-muted-foreground'>
          Software engineer independen berfokus membangun aplikasi web modern performa tinggi, sistem backend terdistribusi yang scalable dan juga dev Shopify.
        </p>

        <div className='flex items-center gap-2 pt-1'>
          <Link
            href='/contact'
            className='flex-1 inline-flex items-center justify-center rounded-xl bg-foreground px-3.5 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90'
          >
            Hubungi / Hire
          </Link>
          <button
            onClick={handleCopyEmail}
            title='Salin email'
            className='inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:text-foreground hover:bg-muted'
          >
            <Mail className='h-3.5 w-3.5' />
          </button>
          <a
            href='https://github.com/nandasafiqalfiansyah'
            target='_blank'
            rel='noopener noreferrer'
            title='GitHub Profile'
            className='inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:text-foreground hover:bg-muted'
          >
            <Code2 className='h-3.5 w-3.5' />
          </a>
          <a
            href='https://linkedin.com/in/nandasafiqalfiansyah'
            target='_blank'
            rel='noopener noreferrer'
            title='LinkedIn Profile'
            className='inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:text-foreground hover:bg-muted'
          >
            <Globe className='h-3.5 w-3.5' />
          </a>
        </div>
        {copiedEmail && (
          <p className='text-[0.7rem] text-emerald-600 font-medium text-center'>
            Email tersalin ke clipboard!
          </p>
        )}
      </div>

      <div className='border-t border-border/60' />

      {/* 4. Trending on Blog */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <TrendingUp className='h-4 w-4 text-emerald-500' />
          <h3 className='font-semibold text-sm tracking-tight text-foreground'>
            Trending on Blog
          </h3>
        </div>

        <div className='space-y-3.5'>
          {trendingPosts.map((post, idx) => {
            const authorName = post.author || 'Nanda Safiq'
            return (
              <div key={post.slug || `trend-${idx}`} className='group flex items-start gap-3'>
                <span className='font-serif text-lg font-bold text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 w-6'>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className='space-y-1 min-w-0'>
                  <div className='flex items-center gap-1.5 text-[0.7rem] text-muted-foreground'>
                    <span className='truncate font-medium text-foreground/75'>
                      {authorName}
                    </span>
                    <span>·</span>
                    {post.publishedAt && <time>{formatDate(post.publishedAt)}</time>}
                  </div>
                  <Link
                    href={`/posts/${post.slug || ''}`}
                    className='block font-serif text-xs font-bold leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2'
                  >
                    {post.title || 'Untitled Post'}
                  </Link>
                  <div className='text-[0.65rem] text-muted-foreground font-mono'>
                    {post.viewCount || 0} pembaca
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Footer Navigation */}
      <div className='pt-2 text-[0.7rem] text-muted-foreground/80 space-y-2 border-t border-border/60'>
        <div className='flex flex-wrap gap-x-3 gap-y-1'>
          <Link href='/' className='hover:text-foreground transition-colors'>Beranda</Link>
          <Link href='/projects' className='hover:text-foreground transition-colors'>Proyek</Link>
          <Link href='/certificate' className='hover:text-foreground transition-colors'>Sertifikat</Link>
          <Link href='/privacy' className='hover:text-foreground transition-colors'>Privasi</Link>
          <Link href='/contact' className='hover:text-foreground transition-colors'>Kontak</Link>
          <Link href='/dashboard' className='hover:text-foreground transition-colors'>Admin</Link>
        </div>
        <p>© 2026 Nanda Safiq Alfiansyah</p>
      </div>
    </aside>
  )
}
