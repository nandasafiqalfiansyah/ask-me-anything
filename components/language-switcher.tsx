'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Check, Wind, Sparkles } from 'lucide-react'
import { useLanguage, LANGUAGES, Language } from '@/lib/language-context'

export function LanguageSwitcher() {
  const { language, setLanguage, ambientEffect, setAmbientEffect, triggerLanguageEffect, t } = useLanguage()
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

  const getEffectIcon = (code: Language) => {
    switch (code) {
      case 'ja':
        return '🌸'
      case 'id':
        return '🇮🇩'
      case 'en':
      default:
        return '✨'
    }
  }

  const getEffectLabel = (code: Language) => {
    switch (code) {
      case 'ja':
        return 'Sakura Fall'
      case 'id':
        return 'Merah Putih'
      case 'en':
      default:
        return 'Starlight'
    }
  }

  return (
    <div className='relative' ref={menuRef}>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:border-foreground/30 hover:bg-muted hover:text-foreground active:scale-95'
        aria-label='Pilih Bahasa / Select Language'
        title='Pilih Bahasa / Language'
      >
        <span className='text-sm leading-none'>{currentLang.flag}</span>
        <span className='hidden sm:inline font-mono uppercase text-[0.72rem] font-semibold'>
          {currentLang.code}
        </span>
        <span className='text-xs' aria-hidden='true'>
          {getEffectIcon(currentLang.code)}
        </span>
        <Globe className='h-3 w-3 text-muted-foreground ml-0.5' />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className='absolute right-0 mt-2 w-52 origin-top-right rounded-2xl border border-border/80 bg-background/95 p-1.5 shadow-xl backdrop-blur-md z-50'
          >
            <div className='flex items-center justify-between px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground'>
              <span>Language & Effects</span>
              <Sparkles className='h-3 w-3 text-primary/70' />
            </div>
            <div className='space-y-1'>
              {LANGUAGES.map(item => {
                const isSelected = item.code === language
                return (
                  <button
                    key={item.code}
                    type='button'
                    onClick={() => {
                      setLanguage(item.code)
                      triggerLanguageEffect(item.code)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors ${
                      isSelected
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      <span className='text-sm leading-none'>{item.flag}</span>
                      <div className='flex flex-col text-left'>
                        <span className='leading-tight'>{item.nativeName}</span>
                        <span className='text-[0.68rem] text-muted-foreground font-normal flex items-center gap-1'>
                          <span>{getEffectIcon(item.code)}</span>
                          <span>{getEffectLabel(item.code)}</span>
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className='h-3.5 w-3.5 text-primary' />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Ambient Mode Toggle */}
            <div className='mt-1.5 border-t border-border/60 pt-1.5 px-1'>
              <button
                type='button'
                onClick={() => setAmbientEffect(prev => !prev)}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[0.72rem] transition-colors ${
                  ambientEffect
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
                title='Tetap tampilkan efek secara terus-menerus di latar belakang'
              >
                <div className='flex items-center gap-1.5'>
                  <Wind className='h-3.5 w-3.5' />
                  <span>{t('effect_ambient_toggle')}</span>
                </div>
                <span className={`text-[0.65rem] px-1.5 py-0.5 rounded font-mono ${ambientEffect ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {ambientEffect ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

