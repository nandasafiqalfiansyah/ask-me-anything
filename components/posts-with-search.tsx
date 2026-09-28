'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { PostMetadata } from '@/lib/posts'
import Posts from '@/components/posts'
import BlogSidebar from '@/components/blog-sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import {
  Search,
  X,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Clock,
  Eye,
  Check
} from 'lucide-react'

type TabKey = 'for-you' | 'featured' | 'web' | 'backend' | 'shopify' | 'ai'
type SortKey = 'date-desc' | 'date-asc' | 'views-desc' | 'views-asc'

export default function PostsWithSearch({ posts = [] }: { posts?: PostMetadata[] }) {
  const safePosts = useMemo(() => (Array.isArray(posts) ? posts : []), [posts])
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabKey>('for-you')
  const [query, setQuery] = useState('')
  const [authorFilter, setAuthorFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>([])

  // Load bookmarks on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('portfolio_bookmarked_posts')
      if (saved) setBookmarkedSlugs(JSON.parse(saved))
    } catch {}
  }, [])

  const authors = useMemo(() => {
    const unique = new Set(safePosts.map(p => p.author).filter(Boolean) as string[])
    return Array.from(unique).sort()
  }, [safePosts])

  // Filter and sort logic
  const filtered = useMemo(() => {
    let result = [...safePosts]

    // 1. Tab filter
    if (activeTab === 'featured') {
      result = result.filter(p => (p.viewCount ?? 0) > 100 || (p.tags && p.tags.includes('Featured')))
      if (result.length === 0) result = [...safePosts].slice(0, 4)
    } else if (activeTab === 'web') {
      result = result.filter(p => {
        const text = (p.title + ' ' + (p.summary || '')).toLowerCase()
        return text.includes('next.js') || text.includes('react') || text.includes('web') || text.includes('astro')
      })
    } else if (activeTab === 'backend') {
      result = result.filter(p => {
        const text = (p.title + ' ' + (p.summary || '')).toLowerCase()
        return text.includes('backend') || text.includes('distributed') || text.includes('database') || text.includes('api') || text.includes('postgresql')
      })
    } else if (activeTab === 'shopify') {
      result = result.filter(p => {
        const text = (p.title + ' ' + (p.summary || '')).toLowerCase()
        return text.includes('shopify') || text.includes('e-commerce') || text.includes('store')
      })
    } else if (activeTab === 'ai') {
      result = result.filter(p => {
        const text = (p.title + ' ' + (p.summary || '')).toLowerCase()
        return text.includes('ai') || text.includes('machine learning') || text.includes('model') || text.includes('llm')
      })
    }

    // 2. Selected Topic filter from sidebar
    if (selectedTopic) {
      const q = selectedTopic.toLowerCase()
      result = result.filter(
        p =>
          p.tags?.some(tag => tag.toLowerCase().includes(q)) ||
          p.title?.toLowerCase().includes(q) ||
          p.summary?.toLowerCase().includes(q)
      )
    }

    // 3. Search query filter
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        post =>
          post.title?.toLowerCase().includes(q) ||
          post.summary?.toLowerCase().includes(q) ||
          post.tags?.some(tag => tag.toLowerCase().includes(q))
      )
    }

    // 4. Author filter
    if (authorFilter !== 'all') {
      result = result.filter(post => post.author === authorFilter)
    }

    // 5. Sorting
    switch (sortKey) {
      case 'date-desc':
        result.sort((a, b) => {
          if (new Date(a.publishedAt ?? '') < new Date(b.publishedAt ?? '')) return 1
          if (new Date(a.publishedAt ?? '') > new Date(b.publishedAt ?? '')) return -1
          return 0
        })
        break
      case 'date-asc':
        result.sort((a, b) => {
          if (new Date(a.publishedAt ?? '') < new Date(b.publishedAt ?? '')) return -1
          if (new Date(a.publishedAt ?? '') > new Date(b.publishedAt ?? '')) return 1
          return 0
        })
        break
      case 'views-desc':
        result.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
        break
      case 'views-asc':
        result.sort((a, b) => (a.viewCount ?? 0) - (b.viewCount ?? 0))
        break
    }

    return result
  }, [safePosts, activeTab, selectedTopic, query, authorFilter, sortKey])

  const isFiltered = query.length > 0 || authorFilter !== 'all' || sortKey !== 'date-desc' || selectedTopic !== null

  function resetFilter() {
    setQuery('')
    setAuthorFilter('all')
    setSortKey('date-desc')
    setSelectedTopic(null)
    setActiveTab('for-you')
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'for-you', label: 'For you' },
    { key: 'featured', label: 'Featured' },
    { key: 'web', label: 'Next.js & Web' },
    { key: 'backend', label: 'Distributed Backend' },
    { key: 'shopify', label: 'Shopify Dev' },
    { key: 'ai', label: 'AI & Systems' }
  ]

  return (
    <div className='w-full'>
      {/* 1. Medium Top Tabs Navigation Bar (matching image.png) */}
      <div className='mb-6 border-b border-border/60'>
        <div className='flex items-center gap-6 overflow-x-auto scrollbar-none'>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key && !selectedTopic
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setSelectedTopic(null)
                }}
                className={`relative pb-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className='absolute bottom-0 left-0 right-0 h-0.5 bg-foreground' />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className='mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
          <Input
            type='text'
            placeholder={t('posts_search_placeholder') || 'Cari topik, judul, atau kata kunci...'}
            className='h-9 pl-9 pr-8 text-xs rounded-xl bg-card/60 border-border/80'
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          )}
        </div>

        <div className='flex items-center gap-2 flex-wrap'>
          {authors.length > 1 && (
            <select
              value={authorFilter}
              onChange={e => setAuthorFilter(e.target.value)}
              className='h-8 rounded-xl border border-border/80 bg-card/60 px-2.5 text-xs text-foreground shadow-xs focus:outline-none'
            >
              <option value='all'>{t('posts_all_authors') || 'Semua Penulis'}</option>
              {authors.map(author => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
          )}

          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className='h-8 rounded-xl border border-border/80 bg-card/60 px-2.5 text-xs text-foreground shadow-xs focus:outline-none'
          >
            <option value='date-desc'>{t('posts_sort_newest') || 'Terbaru'}</option>
            <option value='date-asc'>{t('posts_sort_oldest') || 'Terlama'}</option>
            <option value='views-desc'>{t('posts_sort_most_views') || 'Paling Populer'}</option>
            <option value='views-asc'>{t('posts_sort_least_views') || 'Paling Sedikit Dibaca'}</option>
          </select>

          {isFiltered && (
            <Button
              size='sm'
              variant='outline'
              onClick={resetFilter}
              className='h-8 gap-1 rounded-xl text-xs px-2.5'
            >
              <span>Reset</span>
              <X className='h-3 w-3' />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Pill indicator if selectedTopic */}
      {selectedTopic && (
        <div className='mb-6 flex items-center gap-2 text-xs'>
          <span className='text-muted-foreground'>Filter topik:</span>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 font-medium text-background'>
            <span>{selectedTopic}</span>
            <button onClick={() => setSelectedTopic(null)} className='hover:opacity-75'>
              <X className='h-3 w-3' />
            </button>
          </span>
        </div>
      )}

      {/* 3. Main Articles Feed (Full width in max-w-3xl) */}
      <div className='w-full'>
        <div className='mb-4 flex items-center justify-between text-xs text-muted-foreground'>
          <span>Menampilkan {filtered.length} cerita / artikel</span>
          {filtered.length > 0 && <span>Diperbarui berkala</span>}
        </div>

        <Posts
          posts={filtered}
          onBookmarkChange={setBookmarkedSlugs}
        />
      </div>

      {/* 4. Editorial Discovery & Sidebar Content */}
      <div className='mt-16 pt-10 border-t border-border/60'>
        <BlogSidebar
          posts={safePosts}
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
          bookmarkedSlugs={bookmarkedSlugs}
        />
      </div>
    </div>
  )
}
