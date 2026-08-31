'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'

type PostViewCounterProps = {
  slug: string
  initialCount: number
  className?: string
}

export default function PostViewCounter({
  slug,
  initialCount,
  className
}: PostViewCounterProps) {
  const { language } = useLanguage()
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    if (!slug) return

    let isMounted = true

    // Optimistically update count if initial is 0 or display existing
    const trackView = async () => {
      try {
        const response = await fetch('/api/v1/posts/views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ slug }),
          cache: 'no-store'
        })

        if (!response.ok) {
          // If server returned non-ok, still give optimistic bump
          if (isMounted) {
            setCount(prev => Math.max(prev + 1, 1))
          }
          return
        }

        const payload = (await response.json()) as { views?: number }

        if (isMounted && typeof payload.views === 'number') {
          setCount(payload.views)
        }
      } catch {
        if (isMounted) {
          setCount(prev => Math.max(prev + 1, 1))
        }
      }
    }

    void trackView()

    return () => {
      isMounted = false
    }
  }, [slug])

  const formatViews = (val: number) => {
    const locale = language === 'id' ? 'id-ID' : language === 'ja' ? 'ja-JP' : 'en-US'
    const numStr = (val || 0).toLocaleString(locale)
    if (language === 'id') return `${numStr} kali dilihat`
    if (language === 'ja') return `${numStr} 回閲覧`
    return `${numStr} views`
  }

  return <span className={className}>{formatViews(count)}</span>
}
