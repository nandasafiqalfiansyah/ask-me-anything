'use client'

import React, { useRef, useState, useEffect } from 'react'
import Image, { StaticImageData } from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RotateCcw } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface AvengersAvatarProps {
  src: StaticImageData | string
  alt: string
  className?: string
}

interface Particle {
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  rotation: number
  vRot: number
  delay: number
}

export default function AvengersAvatar({ src, alt, className }: AvengersAvatarProps) {
  const { t } = useLanguage()
  const [isSnapped, setIsSnapped] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const animationFrameId = useRef<number | null>(null)
  const imageSourceRef = useRef<HTMLImageElement | null>(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  // Pre-load image into an HTMLImageElement for canvas pixel extraction
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    if (typeof src === 'string') {
      img.src = src
    } else {
      img.src = src.src
    }
    img.onload = () => {
      imageSourceRef.current = img
      setImgLoaded(true)
    }
  }, [src])

  const triggerSnapDisintegration = () => {
    if (isAnimating) return
    if (isSnapped) {
      // Reassemble / restore
      handleRestore()
      return
    }

    const canvas = canvasRef.current
    const img = imageSourceRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    setIsAnimating(true)
    setIsSnapped(true)

    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    let imgData: ImageData
    try {
      imgData = ctx.getImageData(0, 0, width, height)
    } catch {
      setIsAnimating(false)
      return
    }

    const data = imgData.data
    const particles: Particle[] = []
    const step = 3 // sampling step

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4
        const a = data[index + 3]

        if (a > 30) {
          const r = data[index]
          const g = data[index + 1]
          const b = data[index + 2]

          // Avengers Thanos Snap dust effect: dust sweeps upwards and towards top-right
          // Delay factor based on x and y position (dust starts dissolving from top-left/random sweep)
          const sweepFactor = (x / width) * 0.4 + (1 - y / height) * 0.4 + Math.random() * 0.2
          const delay = sweepFactor * 25 // in frames

          particles.push({
            x,
            y,
            originX: x,
            originY: y,
            // Drifting up and to the right with turbulence
            vx: (Math.random() * 2.5 + 1.2) * (Math.random() > 0.3 ? 1 : -0.3),
            vy: -(Math.random() * 3.5 + 1.5),
            size: Math.random() * 2.8 + 1.2,
            color: `rgba(${r},${g},${b},`,
            alpha: 1,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.1,
            delay
          })
        }
      }
    }

    let currentFrame = 0
    const totalFrames = 130

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      let activeCount = 0

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (currentFrame >= p.delay) {
          // Progress of particle dissolution
          const life = (currentFrame - p.delay) / (totalFrames - p.delay)
          if (life < 1) {
            activeCount++
            // Add subtle wind and upward drift
            p.x += p.vx + Math.sin(currentFrame * 0.08 + p.originY) * 0.6
            p.y += p.vy + Math.cos(currentFrame * 0.06 + p.originX) * 0.3
            p.rotation += p.vRot
            p.alpha = Math.max(0, 1 - Math.pow(life, 1.4))

            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate(p.rotation)
            ctx.fillStyle = `${p.color}${p.alpha})`
            // Draw diamond/dust speck
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
            ctx.restore()
          }
        } else {
          // Hasn't disintegrated yet, draw steady
          activeCount++
          ctx.fillStyle = `${p.color}1)`
          ctx.fillRect(p.originX, p.originY, step, step)
        }
      }

      currentFrame++

      if (activeCount > 0 && currentFrame < totalFrames) {
        animationFrameId.current = requestAnimationFrame(render)
      } else {
        ctx.clearRect(0, 0, width, height)
        setIsAnimating(false)
      }
    }

    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
    animationFrameId.current = requestAnimationFrame(render)
  }

  const handleRestore = () => {
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
    setIsSnapped(false)
    setIsAnimating(false)
  }

  useEffect(() => {
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
    }
  }, [])

  return (
    <div className='group relative inline-block' ref={containerRef}>
      {/* Clickable Profile Card Container */}
      <div
        onClick={triggerSnapDisintegration}
        className='relative cursor-pointer select-none rounded-2xl border border-border/80 bg-card p-2 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg active:scale-98'
        title={isSnapped ? t('avatar_snap_restore_tip') : t('avatar_snap_trigger_tip')}
      >
        <div className='relative h-44 w-44 overflow-hidden rounded-xl bg-muted sm:h-52 sm:w-52'>
          {/* Real Next.js Image Component (Visible when not disintegrated) */}
          <div
            className={`h-full w-full transition-opacity duration-200 ${
              isSnapped ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <Image
              className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-103'
              src={src}
              alt={alt}
              fill
              priority
              sizes='(max-width: 640px) 176px, 208px'
            />
          </div>

          {/* Canvas for Thanos Snap Particle Physics */}
          <canvas
            ref={canvasRef}
            width={208}
            height={208}
            className={`absolute inset-0 h-full w-full object-cover pointer-events-none ${
              isSnapped ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Disintegration Hint Badge (Appears on Hover) */}
          {!isSnapped && !isAnimating && (
            <div className='absolute inset-x-2 bottom-2 flex items-center justify-center gap-1.5 rounded-lg bg-background/85 py-1 px-2 text-[0.65rem] font-medium text-foreground opacity-0 shadow-xs backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100'>
              <Sparkles className='h-3 w-3 text-amber-500 fill-amber-500 animate-pulse' />
              <span>{t('avatar_snap_badge')}</span>
            </div>
          )}

          {/* Snap Disintegration Restore Prompt */}
          {isSnapped && !isAnimating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='absolute inset-0 flex flex-col items-center justify-center bg-background/90 p-3 text-center backdrop-blur-xs'
            >
              <div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shadow-xs'>
                <RotateCcw className='h-4 w-4' />
              </div>
              <p className='mt-2 text-xs font-semibold text-foreground'>
                {t('avatar_snap_quote')}
              </p>
              <p className='mt-0.5 text-[0.68rem] text-muted-foreground'>
                {t('avatar_snap_restore')}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
