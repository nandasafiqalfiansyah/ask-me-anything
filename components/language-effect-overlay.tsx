'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RotateCcw, X, Wind } from 'lucide-react'
import { useLanguage, Language } from '@/lib/language-context'

interface Particle {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  rotation: number
  vRotation: number
  flipAngle: number
  vFlip: number
  swayAngle: number
  vSway: number
  swayAmp: number
  opacity: number
  color: string
  secondaryColor?: string
  shape: 'sakura' | 'petal' | 'ribbon' | 'star' | 'leaf'
  type: Language
}

// Color palettes
const SAKURA_COLORS = ['#ffccd5', '#ffb7c5', '#ff9ebb', '#f472b6', '#fda4af', '#fbcfe8']
const INDO_COLORS = ['#ef4444', '#dc2626', '#b91c1c', '#ffffff', '#f8fafc', '#fef08a']
const EN_COLORS = ['#f59e0b', '#fbbf24', '#fde047', '#38bdf8', '#60a5fa', '#ffffff']

export default function LanguageEffectOverlay() {
  const {
    language,
    activeEffect,
    effectSessionId,
    triggerLanguageEffect,
    ambientEffect,
    setAmbientEffect,
    dismissEffect,
    t
  } = useLanguage()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const [showToast, setShowToast] = useState(false)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Determine current active effect language
  const currentEffectType = activeEffect || (ambientEffect ? language : null)

  const createParticle = useCallback(
    (type: Language, width: number, height: number, spawnAbove = false): Particle => {
      const isSakura = type === 'ja'
      const isIndo = type === 'id'

      let shape: Particle['shape'] = 'sakura'
      let color = SAKURA_COLORS[Math.floor(Math.random() * SAKURA_COLORS.length)]
      let secondaryColor: string | undefined = undefined

      if (isSakura) {
        shape = 'sakura'
        color = SAKURA_COLORS[Math.floor(Math.random() * SAKURA_COLORS.length)]
      } else if (isIndo) {
        // Mix of Merah Putih ribbons, petals, and celebratory sparkles
        const rand = Math.random()
        if (rand < 0.45) {
          shape = 'petal'
          color = '#ef4444' // Indonesian Red
          secondaryColor = '#ffffff'
        } else if (rand < 0.8) {
          shape = 'ribbon'
          color = Math.random() > 0.5 ? '#dc2626' : '#ffffff'
        } else {
          shape = 'star'
          color = '#fbbf24' // golden sparkle
        }
      } else {
        // English: Golden stars & autumn leaves
        const rand = Math.random()
        if (rand < 0.6) {
          shape = 'star'
          color = EN_COLORS[Math.floor(Math.random() * EN_COLORS.length)]
        } else {
          shape = 'leaf'
          color = Math.random() > 0.5 ? '#f59e0b' : '#38bdf8'
        }
      }

      const size = isSakura
        ? 10 + Math.random() * 12
        : shape === 'ribbon'
          ? 12 + Math.random() * 16
          : 8 + Math.random() * 10

      return {
        x: Math.random() * width,
        y: spawnAbove ? -20 - Math.random() * 40 : Math.random() * height * 0.8 - 20,
        size,
        vx: (Math.random() - 0.5) * 1.2 + (isSakura ? 0.6 : 0.2), // gentle wind towards right
        vy: 1.2 + Math.random() * 2.2,
        rotation: Math.random() * Math.PI * 2,
        vRotation: (Math.random() - 0.5) * 0.04,
        flipAngle: Math.random() * Math.PI * 2,
        vFlip: 0.02 + Math.random() * 0.05,
        swayAngle: Math.random() * Math.PI * 2,
        vSway: 0.03 + Math.random() * 0.04,
        swayAmp: 0.8 + Math.random() * 1.5,
        opacity: 0.85 + Math.random() * 0.15,
        color,
        secondaryColor,
        shape,
        type
      }
    },
    []
  )

  // Initialize particles when effect is triggered
  useEffect(() => {
    if (!currentEffectType) {
      particlesRef.current = []
      return
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const particleCount = currentEffectType === 'ja' ? 60 : currentEffectType === 'id' ? 55 : 50

    const newParticles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      newParticles.push(createParticle(currentEffectType, width, height, false))
    }
    particlesRef.current = newParticles

    // Show toast for 5 seconds
    setShowToast(true)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false)
    }, 5500)

    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [currentEffectType, effectSessionId, createParticle])

  // Drawing routines
  const drawSakura = (
    ctx: CanvasRenderingContext2D,
    size: number,
    color: string
  ) => {
    ctx.beginPath()
    ctx.moveTo(0, -size)
    // Left petal curve with soft heart/notched top
    ctx.bezierCurveTo(-size * 0.85, -size * 0.45, -size * 0.8, size * 0.5, 0, size)
    // Right petal curve
    ctx.bezierCurveTo(size * 0.8, size * 0.5, size * 0.85, -size * 0.45, 0, -size)
    // Indentation notch at the tip of sakura petal
    ctx.lineTo(0, -size * 0.75)
    ctx.closePath()

    // Soft gradient fill
    const grad = ctx.createLinearGradient(0, -size, 0, size)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(0.35, color)
    grad.addColorStop(1, '#f43f5e')
    ctx.fillStyle = grad
    ctx.fill()
  }

  const drawRibbon = (
    ctx: CanvasRenderingContext2D,
    size: number,
    color: string
  ) => {
    ctx.beginPath()
    ctx.moveTo(-size * 0.4, -size)
    ctx.quadraticCurveTo(size * 0.5, -size * 0.2, -size * 0.3, size * 0.6)
    ctx.lineTo(size * 0.2, size)
    ctx.quadraticCurveTo(-size * 0.4, size * 0.2, size * 0.3, -size * 0.8)
    ctx.closePath()

    ctx.fillStyle = color
    ctx.fill()
    if (color === '#ffffff') {
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.4)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    size: number,
    color: string
  ) => {
    const spikes = 4
    const outerRadius = size * 0.8
    const innerRadius = size * 0.3
    let rot = (Math.PI / 2) * 3
    let x = 0
    let y = 0
    const step = Math.PI / spikes

    ctx.beginPath()
    ctx.moveTo(0, -outerRadius)
    for (let i = 0; i < spikes; i++) {
      x = Math.cos(rot) * outerRadius
      y = Math.sin(rot) * outerRadius
      ctx.lineTo(x, y)
      rot += step

      x = Math.cos(rot) * innerRadius
      y = Math.sin(rot) * innerRadius
      ctx.lineTo(x, y)
      rot += step
    }
    ctx.lineTo(0, -outerRadius)
    ctx.closePath()

    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = 8
    ctx.fill()
    ctx.shadowBlur = 0
  }

  const drawLeaf = (
    ctx: CanvasRenderingContext2D,
    size: number,
    color: string
  ) => {
    ctx.beginPath()
    ctx.moveTo(0, -size)
    ctx.quadraticCurveTo(size * 0.9, 0, 0, size)
    ctx.quadraticCurveTo(-size * 0.9, 0, 0, -size)
    ctx.closePath()

    const grad = ctx.createLinearGradient(0, -size, 0, size)
    grad.addColorStop(0, '#fef08a')
    grad.addColorStop(1, color)
    ctx.fillStyle = grad
    ctx.fill()
  }

  // Animation render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let isRunning = true

    const handleResize = () => {
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const render = () => {
      if (!isRunning) return

      const width = window.innerWidth
      const height = window.innerHeight

      ctx.clearRect(0, 0, width, height)

      const activeParticles = particlesRef.current

      for (let i = 0; i < activeParticles.length; i++) {
        const p = activeParticles[i]

        // Physics update
        p.swayAngle += p.vSway
        p.flipAngle += p.vFlip
        p.rotation += p.vRotation

        p.x += p.vx + Math.sin(p.swayAngle) * p.swayAmp
        p.y += p.vy

        // Save context and transform
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)

        // 3D flip effect (rolling in the wind)
        const flipScale = Math.cos(p.flipAngle)
        ctx.scale(flipScale, 1)

        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity))

        // Draw shape
        if (p.shape === 'sakura') {
          drawSakura(ctx, p.size, p.color)
        } else if (p.shape === 'ribbon') {
          drawRibbon(ctx, p.size, p.color)
        } else if (p.shape === 'star') {
          drawStar(ctx, p.size, p.color)
        } else {
          drawLeaf(ctx, p.size, p.color)
        }

        ctx.restore()

        // Boundary check
        if (p.y > height + 40 || p.x < -40 || p.x > width + 40) {
          if (ambientEffect && currentEffectType) {
            // Respawn at top in ambient mode
            p.y = -20 - Math.random() * 30
            p.x = Math.random() * width
          } else {
            // Fade out
            p.opacity -= 0.05
          }
        }
      }

      // Filter out dead particles if not ambient
      if (!ambientEffect) {
        particlesRef.current = activeParticles.filter(p => p.opacity > 0 && p.y <= height + 50)
      }

      // Keep rendering if particles remain or ambient mode is on
      if (particlesRef.current.length > 0 || ambientEffect) {
        animFrameIdRef.current = requestAnimationFrame(render)
      } else {
        ctx.clearRect(0, 0, width, height)
      }
    }

    animFrameIdRef.current = requestAnimationFrame(render)

    return () => {
      isRunning = false
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [ambientEffect, currentEffectType, effectSessionId])

  if (!currentEffectType && particlesRef.current.length === 0) {
    return null
  }

  const getEffectDetails = () => {
    switch (currentEffectType) {
      case 'ja':
        return {
          icon: '🌸',
          title: t('effect_sakura_title'),
          desc: t('effect_sakura_desc'),
          accentClass: 'border-pink-500/40 bg-pink-500/10 text-pink-500 dark:border-pink-500/30'
        }
      case 'id':
        return {
          icon: '🇮🇩',
          title: t('effect_id_title'),
          desc: t('effect_id_desc'),
          accentClass: 'border-rose-500/40 bg-rose-500/10 text-rose-500 dark:border-rose-500/30'
        }
      case 'en':
      default:
        return {
          icon: '✨',
          title: t('effect_en_title'),
          desc: t('effect_en_desc'),
          accentClass: 'border-amber-500/40 bg-amber-500/10 text-amber-500 dark:border-amber-500/30'
        }
    }
  }

  const effectDetails = getEffectDetails()

  return (
    <>
      {/* Falling Canvas Layer */}
      <canvas
        ref={canvasRef}
        className='pointer-events-none fixed inset-0 z-50 h-full w-full'
        aria-hidden='true'
      />

      {/* Floating Interactive Toast Card */}
      <AnimatePresence>
        {showToast && currentEffectType && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className='fixed bottom-6 right-4 sm:right-6 z-50 max-w-sm rounded-2xl border border-border/80 bg-background/90 p-4 shadow-2xl backdrop-blur-xl'
          >
            <div className='flex items-start gap-3'>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xl ${effectDetails.accentClass}`}>
                <span>{effectDetails.icon}</span>
              </div>
              <div className='flex-1 pr-1'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-xs font-bold text-foreground sm:text-sm'>
                    {effectDetails.title}
                  </h4>
                  <button
                    type='button'
                    onClick={() => setShowToast(false)}
                    className='rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                    aria-label={t('effect_close_btn')}
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
                <p className='mt-1 text-xs text-muted-foreground leading-relaxed'>
                  {effectDetails.desc}
                </p>

                {/* Quick Interactive Actions */}
                <div className='mt-3 flex items-center gap-2 pt-1'>
                  <button
                    type='button'
                    onClick={() => triggerLanguageEffect(currentEffectType)}
                    className='inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[0.7rem] font-medium text-foreground transition-colors hover:bg-muted active:scale-95'
                    title={t('effect_replay_btn')}
                  >
                    <RotateCcw className='h-3 w-3 text-muted-foreground' />
                    <span>{t('effect_replay_btn')}</span>
                  </button>

                  <button
                    type='button'
                    onClick={() => setAmbientEffect(prev => !prev)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[0.7rem] font-medium transition-colors active:scale-95 ${
                      ambientEffect
                        ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    title={t('effect_ambient_toggle')}
                  >
                    <Wind className='h-3 w-3' />
                    <span>
                      {ambientEffect ? '✓ ' : ''}
                      {t('effect_ambient_toggle')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
