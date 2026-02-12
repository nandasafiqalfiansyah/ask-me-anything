'use client'

import { useEffect, useState, useRef } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'

const RIPPLE_DURATION = 800 // ms
const RIPPLE_SIZE = 200 // px
const RIPPLE_OFFSET = -100 // px (half of RIPPLE_SIZE)

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleIdRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    setMounted(true)
    
    return () => {
      // Cleanup all pending timeouts on unmount
      const timeouts = timeoutRef.current
      timeouts.forEach(clearTimeout)
      timeoutRef.current = []
    }
  }, [])

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    rippleIdRef.current += 1
    const newRipple = { id: rippleIdRef.current, x, y }
    setRipples((prev) => [...prev, newRipple])

    const timeout = setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      // Remove timeout from array after it executes
      timeoutRef.current = timeoutRef.current.filter(t => t !== timeout)
    }, RIPPLE_DURATION)
    
    timeoutRef.current.push(timeout)

    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  if (!mounted) {
    return null
  }

  return (
    <Button
      ref={buttonRef}
      size='sm'
      variant='ghost'
      onClick={handleThemeToggle}
      className='relative overflow-hidden'
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className='absolute rounded-full bg-current opacity-20'
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
          initial={{ width: 0, height: 0, x: 0, y: 0 }}
          animate={{
            width: RIPPLE_SIZE,
            height: RIPPLE_SIZE,
            x: RIPPLE_OFFSET,
            y: RIPPLE_OFFSET,
          }}
          transition={{ duration: RIPPLE_DURATION / 1000, ease: 'easeOut' }}
        />
      ))}

      <AnimatePresence mode='wait'>
        {resolvedTheme === 'dark' ? (
          <motion.div
            key='sun'
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <SunIcon className='size-4 text-orange-300' />
          </motion.div>
        ) : (
          <motion.div
            key='moon'
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <MoonIcon className='size-4 text-sky-950' />
          </motion.div>
        )}
      </AnimatePresence>

      <span className='sr-only'>Toggle theme</span>
    </Button>
  )
}
