'use client'

import { useEffect, useRef, useState } from 'react'

type PageViewCounterProps = {
  pageKey: string
  initialCount: number
  className?: string
}

export default function PageViewCounter({
  pageKey,
  initialCount,
  className
}: PageViewCounterProps) {
  const [count, setCount] = useState(initialCount)
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    if (!pageKey || hasTrackedRef.current) {
      return
    }

    hasTrackedRef.current = true

    const trackView = async () => {
      try {
        const response = await fetch('/api/v1/views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ key: pageKey }),
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
        // Fail silently to avoid breaking the page.
      }
    }

    void trackView()
  }, [pageKey])

  return <p className={className}>{count.toLocaleString('en-US')} views</p>
}
