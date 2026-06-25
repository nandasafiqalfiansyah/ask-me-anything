'use client'

import { useMemo, useState } from 'react'
import { PostMetadata } from '@/lib/posts'

import Posts from '@/components/posts'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Cross2Icon } from '@radix-ui/react-icons'

type SortKey = 'date-desc' | 'date-asc' | 'views-desc' | 'views-asc'

export default function PostsWithSearch({ posts }: { posts: PostMetadata[] }) {
  const [query, setQuery] = useState('')
  const [authorFilter, setAuthorFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')

  const authors = useMemo(() => {
    const unique = new Set(posts.map(p => p.author).filter(Boolean) as string[])
    return Array.from(unique).sort()
  }, [posts])

  const filtered = useMemo(() => {
    let result = [...posts]

    // Filter by search query
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        post =>
          post.title?.toLowerCase().includes(q) ||
          post.summary?.toLowerCase().includes(q)
      )
    }

    // Filter by author
    if (authorFilter !== 'all') {
      result = result.filter(post => post.author === authorFilter)
    }

    // Sort
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
  }, [posts, query, authorFilter, sortKey])

  const isFiltered = query.length > 0 || authorFilter !== 'all' || sortKey !== 'date-desc'

  function resetFilter() {
    setQuery('')
    setAuthorFilter('all')
    setSortKey('date-desc')
  }

  return (
    <div>
      <div className='mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3'>
        <Input
          type='text'
          placeholder='Search posts...'
          className='h-9 w-full sm:w-1/3'
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        {authors.length > 0 && (
          <select
            value={authorFilter}
            onChange={e => setAuthorFilter(e.target.value)}
            className='h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring'
          >
            <option value='all'>All authors</option>
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
          className='h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring'
        >
          <option value='date-desc'>Newest first</option>
          <option value='date-asc'>Oldest first</option>
          <option value='views-desc'>Most views</option>
          <option value='views-asc'>Least views</option>
        </select>

        {isFiltered && (
          <Button
            size='sm'
            variant='secondary'
            onClick={resetFilter}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>

      <Posts posts={filtered} />
    </div>
  )
}
