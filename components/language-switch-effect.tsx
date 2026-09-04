'use client'

import React, { useEffect, useRef } from 'react'
import { useLanguage, Language } from '@/lib/language-context'

interface Particle {
  x: number
  y: number
  startX: number
  startY: number
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
  accentColor?: string
  shape: 'sakura' | 'jasmine' | 'maple'
  spawnDelay: number // in ms, allows staggered waves of leaves entering
  origin: 'top' | 'left' | 'right'
}

const SAKURA_COLORS = ['#ffccd5', '#ffb7c5', '#ff9ebb', '#f472b6', '#fda4af', '#fbcfe8']

// Jasmine / Melati Putih colors (Puspa Bangsa - pure white, soft ivory, cream with subtle pale chartreuse/gold base)
const JASMINE_PALETTES = [
  { base: '#fefce8', main: '#ffffff', accent: '#fef08a' },
  { base: '#f8fafc', main: '#ffffff', accent: '#e2e8f0' },
  { base: '#f0fdf4', main: '#ffffff', accent: '#bbf7d0' },
  { base: '#fffbeb', main: '#ffffff', accent: '#fde68a' }
]

// Autumn Maple Leaves colors (warm golden amber, fiery orange, russet red, and deep golden yellow)
const MAPLE_PALETTES = [
  { main: '#f97316', secondary: '#ea580c', stem: '#7c2d12' },
  { main: '#ea580c', secondary: '#c2410c', stem: '#431407' },
  { main: '#eab308', secondary: '#ca8a04', stem: '#713f12' },
  { main: '#ef4444', secondary: '#b91c1c', stem: '#7f1d1d' },
  { main: '#f59e0b', secondary: '#d97706', stem: '#78350f' }
]

export default function LanguageSwitchEffect() {
  const { switchEffectLang } = useLanguage()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    if (!switchEffectLang) return

    const width = window.innerWidth
    const height = window.innerHeight
    const count = switchEffectLang === 'ja' ? 55 : switchEffectLang === 'id' ? 45 : 42
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      let shape: Particle['shape'] = 'sakura'
      let color = SAKURA_COLORS[0]
      let accentColor = '#f43f5e'

      if (switchEffectLang === 'ja') {
        shape = 'sakura'
        color = SAKURA_COLORS[Math.floor(Math.random() * SAKURA_COLORS.length)]
        accentColor = '#f43f5e'
      } else if (switchEffectLang === 'id') {
        shape = 'jasmine'
        const palette = JASMINE_PALETTES[Math.floor(Math.random() * JASMINE_PALETTES.length)]
        color = palette.main
        accentColor = palette.accent
      } else {
        shape = 'maple'
        const palette = MAPLE_PALETTES[Math.floor(Math.random() * MAPLE_PALETTES.length)]
        color = palette.main
        accentColor = palette.secondary
      }

      const isMaple = shape === 'maple'
      const isJasmine = shape === 'jasmine'

      // Randomly spawn from top, left edge, or right edge for dynamic gust effect
      const randOrigin = Math.random()
      let origin: Particle['origin'] = 'top'
      let startX = Math.random() * width
      let startY = -(20 + Math.random() * 60)
      let vx = (Math.random() - 0.5) * (isMaple ? 1.6 : 1.2) + (switchEffectLang === 'ja' ? 0.7 : 0.1)
      let vy = isMaple ? 1.4 + Math.random() * 2.2 : isJasmine ? 1.1 + Math.random() * 1.7 : 1.2 + Math.random() * 2.2
      let spawnDelay = Math.random() * 350

      if (randOrigin > 0.45 && randOrigin <= 0.75) {
        // Blows inward from left side!
        origin = 'left'
        startX = -(20 + Math.random() * 80)
        startY = Math.random() * height * 0.75
        vx = 3.2 + Math.random() * 3.6 // Fast entrance from the left
        vy = 0.6 + Math.random() * 1.6
        spawnDelay = 180 + Math.random() * 1400 // Arrives in breezy waves
      } else if (randOrigin > 0.75) {
        // Blows inward from right side!
        origin = 'right'
        startX = width + (20 + Math.random() * 80)
        startY = Math.random() * height * 0.75
        vx = -(3.2 + Math.random() * 3.6) // Fast entrance from the right
        vy = 0.6 + Math.random() * 1.6
        spawnDelay = 220 + Math.random() * 1500 // Arrives in breezy waves
      }

      newParticles.push({
        x: startX,
        y: startY,
        startX,
        startY,
        size: isMaple ? 14 + Math.random() * 12 : isJasmine ? 11 + Math.random() * 9 : 10 + Math.random() * 12,
        vx,
        vy,
        rotation: Math.random() * Math.PI * 2,
        vRotation: (Math.random() - 0.5) * (isMaple ? 0.07 : 0.04),
        flipAngle: Math.random() * Math.PI * 2,
        vFlip: 0.025 + Math.random() * 0.04,
        swayAngle: Math.random() * Math.PI * 2,
        vSway: isMaple ? 0.04 + Math.random() * 0.03 : 0.025 + Math.random() * 0.03,
        swayAmp: isMaple ? 1.4 + Math.random() * 1.8 : 0.9 + Math.random() * 1.3,
        opacity: 1,
        color,
        accentColor,
        shape,
        spawnDelay,
        origin
      })
    }

    particlesRef.current = newParticles

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    ctx.scale(dpr, dpr)

    let isRunning = true
    const startTime = Date.now()
    const maxDuration = 4500 // 4.5 seconds

    const render = () => {
      if (!isRunning) return

      const elapsed = Date.now() - startTime
      if (elapsed > maxDuration || particlesRef.current.length === 0) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        particlesRef.current = []
        return
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const remainingRatio = Math.max(0, (maxDuration - elapsed) / 1000)
      const globalFade = Math.min(1, remainingRatio)

      particlesRef.current.forEach(p => {
        // Wait until particle's scheduled wave delay
        if (elapsed < p.spawnDelay) return

        p.swayAngle += p.vSway
        p.flipAngle += p.vFlip
        p.rotation += p.vRotation

        // Gentle atmospheric air drag: slows down sudden side gusts into a floating drift
        if (Math.abs(p.vx) > 0.8) {
          p.vx *= 0.988
        }

        // Ambient cross-breeze across the screen
        const ambientBreeze = Math.sin((elapsed + p.spawnDelay) * 0.0025) * (switchEffectLang === 'ja' ? 0.9 : 0.6)

        p.x += p.vx + Math.sin(p.swayAngle) * p.swayAmp + ambientBreeze
        p.y += p.vy

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)

        const flipScale = Math.cos(p.flipAngle)
        ctx.scale(flipScale, 1)

        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity * globalFade))

        if (p.shape === 'sakura') {
          // 🌸 Bunga Sakura Jepang: Petal with characteristic notched tip
          ctx.beginPath()
          ctx.moveTo(0, -p.size)
          ctx.bezierCurveTo(-p.size * 0.85, -p.size * 0.45, -p.size * 0.8, p.size * 0.5, 0, p.size)
          ctx.bezierCurveTo(p.size * 0.8, p.size * 0.5, p.size * 0.85, -p.size * 0.45, 0, -p.size)
          ctx.lineTo(0, -p.size * 0.75)
          ctx.closePath()

          const grad = ctx.createLinearGradient(0, -p.size, 0, p.size)
          grad.addColorStop(0, '#ffffff')
          grad.addColorStop(0.35, p.color)
          grad.addColorStop(1, '#f43f5e')
          ctx.fillStyle = grad
          ctx.fill()
        } else if (p.shape === 'jasmine') {
          // 🌼 Kelopak Bunga Melati Putih (Puspa Bangsa Indonesia):
          // Delicate oval/teardrop petal with smooth ivory glow, soft curve and pale golden base
          ctx.beginPath()
          ctx.moveTo(0, -p.size * 1.15)
          // Right side curve
          ctx.bezierCurveTo(p.size * 0.65, -p.size * 0.65, p.size * 0.75, p.size * 0.35, 0, p.size * 0.95)
          // Left side curve
          ctx.bezierCurveTo(-p.size * 0.75, p.size * 0.35, -p.size * 0.65, -p.size * 0.65, 0, -p.size * 1.15)
          ctx.closePath()

          const grad = ctx.createLinearGradient(0, -p.size * 1.15, 0, p.size * 0.95)
          grad.addColorStop(0, '#ffffff')
          grad.addColorStop(0.7, p.color)
          grad.addColorStop(1, p.accentColor || '#fef08a')
          ctx.fillStyle = grad
          ctx.fill()

          // Subtle natural center crease for realistic petal texture
          ctx.beginPath()
          ctx.moveTo(0, -p.size * 0.8)
          ctx.quadraticCurveTo(p.size * 0.08, 0, 0, p.size * 0.6)
          ctx.strokeStyle = 'rgba(217, 249, 157, 0.45)'
          ctx.lineWidth = 0.8
          ctx.stroke()

          // Faint soft edge border for contrast on light backgrounds
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)'
          ctx.lineWidth = 0.6
          ctx.stroke()
        } else if (p.shape === 'maple') {
          // 🍁 Daun Maple Musim Gugur (Autumn Maple Leaves - English):
          // Signature 5-lobed maple leaf silhouette with stem
          const s = p.size

          ctx.beginPath()
          // Top central tip
          ctx.moveTo(0, -s)
          // Top right sub-tooth & middle right lobe
          ctx.lineTo(s * 0.32, -s * 0.45)
          ctx.lineTo(s * 0.7, -s * 0.3)
          ctx.lineTo(s * 0.45, -s * 0.1)
          ctx.lineTo(s * 0.8, s * 0.2)
          // Lower right lobe
          ctx.lineTo(s * 0.28, s * 0.3)
          ctx.lineTo(s * 0.35, s * 0.58)
          // Base right
          ctx.lineTo(s * 0.08, s * 0.68)
          // Little stem
          ctx.lineTo(s * 0.05, s * 0.98)
          ctx.lineTo(-s * 0.05, s * 0.98)
          ctx.lineTo(-s * 0.08, s * 0.68)
          // Lower left lobe
          ctx.lineTo(-s * 0.35, s * 0.58)
          ctx.lineTo(-s * 0.28, s * 0.3)
          // Middle left lobe
          ctx.lineTo(-s * 0.8, s * 0.2)
          ctx.lineTo(-s * 0.45, -s * 0.1)
          ctx.lineTo(-s * 0.7, -s * 0.3)
          ctx.lineTo(-s * 0.32, -s * 0.45)
          ctx.closePath()

          const grad = ctx.createLinearGradient(-s * 0.5, -s, s * 0.5, s)
          grad.addColorStop(0, '#fef08a') // golden yellow highlight
          grad.addColorStop(0.35, p.color) // main autumn color
          grad.addColorStop(1, p.accentColor || '#c2410c') // rich warm ember/russet
          ctx.fillStyle = grad
          ctx.fill()

          // Subtle main leaf veins
          ctx.beginPath()
          ctx.moveTo(0, s * 0.7)
          ctx.lineTo(0, -s * 0.7)
          ctx.moveTo(0, s * 0.4)
          ctx.lineTo(s * 0.5, 0)
          ctx.moveTo(0, s * 0.4)
          ctx.lineTo(-s * 0.5, 0)
          ctx.strokeStyle = 'rgba(120, 53, 15, 0.3)'
          ctx.lineWidth = 0.9
          ctx.stroke()
        }

        ctx.restore()
      })

      // Remove particles only if they have already spawned and passed through the viewport
      particlesRef.current = particlesRef.current.filter(p => {
        if (elapsed < p.spawnDelay) return true
        if (p.y > window.innerHeight + 60) return false
        if (p.origin === 'left' && p.x > window.innerWidth + 120) return false
        if (p.origin === 'right' && p.x < -120) return false
        return true
      })

      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(render)
      }
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      isRunning = false
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [switchEffectLang])

  return (
    <canvas
      ref={canvasRef}
      className='pointer-events-none fixed inset-0 z-50 h-full w-full'
      aria-hidden='true'
    />
  )
}
