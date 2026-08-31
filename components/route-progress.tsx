'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function RouteProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Whenever pathname or searchParams change, conclude loading
    setProgress(100)
    const timeout = setTimeout(() => {
      setLoading(false)
      setProgress(0)
    }, 200)

    return () => clearTimeout(timeout)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      const targetAttr = target.getAttribute('target')

      // Ignore external, anchor links, same-page links, or downloads
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        targetAttr === '_blank'
      ) {
        return
      }

      // Check if href is internal navigation
      const isInternal =
        href.startsWith('/') || href.startsWith(window.location.origin)

      if (isInternal && href !== window.location.pathname + window.location.search) {
        setLoading(true)
        setProgress(25)

        const t1 = setTimeout(() => setProgress(65), 150)
        const t2 = setTimeout(() => setProgress(85), 350)

        return () => {
          clearTimeout(t1)
          clearTimeout(t2)
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  if (!loading && progress === 0) return null

  return (
    <div className='fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-transparent pointer-events-none'>
      <div
        className='h-full bg-gradient-to-r from-indigo-500 via-primary to-emerald-400 transition-all duration-200 ease-out shadow-[0_0_8px_rgba(99,102,241,0.6)]'
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1
        }}
      />
    </div>
  )
}
