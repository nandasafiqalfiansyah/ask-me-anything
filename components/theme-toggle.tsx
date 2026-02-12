'use client'

import { useEffect, useState, useRef } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = { id: Date.now(), x, y }
    setRipples([...ripples, newRipple])

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 800)

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
            width: 200,
            height: 200,
            x: -100,
            y: -100,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
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
