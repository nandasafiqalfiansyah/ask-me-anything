'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { useLanguage, LANGUAGES } from '@/lib/language-context'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  return (
    <div className='relative' ref={menuRef}>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:border-foreground/30 hover:bg-muted hover:text-foreground active:scale-95'
        aria-label='Pilih Bahasa / Select Language'
        title='Pilih Bahasa / Language'
      >
        {/* Exactly 1 logo on navigation */}
        <span className='text-sm leading-none'>{currentLang.flag}</span>
        <span className='font-mono uppercase text-[0.72rem] font-semibold'>
          {currentLang.code}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className='absolute right-0 mt-2 w-44 origin-top-right rounded-2xl border border-border/80 bg-background/95 p-1.5 shadow-xl backdrop-blur-md z-50'
          >
            <div className='px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground'>
              Language / Bahasa
            </div>
            <div className='space-y-0.5'>
              {LANGUAGES.map(item => {
                const isSelected = item.code === language
                return (
                  <button
                    key={item.code}
                    type='button'
                    onClick={() => {
                      setLanguage(item.code)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
                      isSelected
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      <span className='text-sm leading-none'>{item.flag}</span>
                      <span>{item.nativeName}</span>
                    </div>
                    {isSelected && (
                      <Check className='h-3.5 w-3.5 text-primary' />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
