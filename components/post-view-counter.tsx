'use client'

import { useEffect, useRef, useState } from 'react'

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
  const [count, setCount] = useState(initialCount)
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    if (!slug || hasTrackedRef.current) {
      return
    }

    hasTrackedRef.current = true

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
          return
        }

        const payload = (await response.json()) as { views?: number }

        if (typeof payload.views === 'number') {
          setCount(payload.views)
        }
      } catch {
        // Fail silently to avoid breaking the article page.
      }
    }

    void trackView()
  }, [slug])

  return <p className={className}>{count.toLocaleString('en-US')} views</p>
}
