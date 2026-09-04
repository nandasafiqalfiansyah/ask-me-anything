'use client'

import React, { useEffect, useRef } from 'react'
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
  shape: 'sakura' | 'petal' | 'ribbon' | 'star'
}

const SAKURA_COLORS = ['#ffccd5', '#ffb7c5', '#ff9ebb', '#f472b6', '#fda4af', '#fbcfe8']
const ID_COLORS = ['#ef4444', '#dc2626', '#b91c1c', '#ffffff', '#f8fafc']
const EN_COLORS = ['#f59e0b', '#fbbf24', '#fde047', '#38bdf8', '#ffffff']

export default function LanguageSwitchEffect() {
  const { switchEffectLang } = useLanguage()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    if (!switchEffectLang) return

    const width = window.innerWidth
    const height = window.innerHeight
    const count = switchEffectLang === 'ja' ? 55 : switchEffectLang === 'id' ? 50 : 45
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      let shape: Particle['shape'] = 'sakura'
      let color = SAKURA_COLORS[Math.floor(Math.random() * SAKURA_COLORS.length)]

      if (switchEffectLang === 'ja') {
        shape = 'sakura'
        color = SAKURA_COLORS[Math.floor(Math.random() * SAKURA_COLORS.length)]
      } else if (switchEffectLang === 'id') {
        const rand = Math.random()
        if (rand < 0.5) {
          shape = 'petal'
          color = '#ef4444'
        } else if (rand < 0.85) {
          shape = 'ribbon'
          color = Math.random() > 0.5 ? '#dc2626' : '#ffffff'
        } else {
          shape = 'star'
          color = '#fbbf24'
        }
      } else {
        shape = 'star'
        color = EN_COLORS[Math.floor(Math.random() * EN_COLORS.length)]
      }

      newParticles.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.4 - 40,
        size: shape === 'sakura' ? 10 + Math.random() * 12 : 8 + Math.random() * 8,
        vx: (Math.random() - 0.5) * 1.2 + (switchEffectLang === 'ja' ? 0.6 : 0.1),
        vy: 1.2 + Math.random() * 2.2,
        rotation: Math.random() * Math.PI * 2,
        vRotation: (Math.random() - 0.5) * 0.04,
        flipAngle: Math.random() * Math.PI * 2,
        vFlip: 0.03 + Math.random() * 0.04,
        swayAngle: Math.random() * Math.PI * 2,
        vSway: 0.03 + Math.random() * 0.03,
        swayAmp: 0.8 + Math.random() * 1.4,
        opacity: 1,
        color,
        shape
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
        p.swayAngle += p.vSway
        p.flipAngle += p.vFlip
        p.rotation += p.vRotation

        p.x += p.vx + Math.sin(p.swayAngle) * p.swayAmp
        p.y += p.vy

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)

        const flipScale = Math.cos(p.flipAngle)
        ctx.scale(flipScale, 1)

        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity * globalFade))

        if (p.shape === 'sakura') {
          // Sakura petal with notch
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
        } else if (p.shape === 'ribbon') {
          ctx.beginPath()
          ctx.moveTo(-p.size * 0.4, -p.size)
          ctx.quadraticCurveTo(p.size * 0.5, -p.size * 0.2, -p.size * 0.3, p.size * 0.6)
          ctx.lineTo(p.size * 0.2, p.size)
          ctx.quadraticCurveTo(-p.size * 0.4, p.size * 0.2, p.size * 0.3, -p.size * 0.8)
          ctx.closePath()
          ctx.fillStyle = p.color
          ctx.fill()
          if (p.color === '#ffffff') {
            ctx.strokeStyle = 'rgba(220, 38, 38, 0.4)'
            ctx.lineWidth = 1
            ctx.stroke()
          }
        } else if (p.shape === 'star') {
          const spikes = 4
          const outerRadius = p.size * 0.75
          const innerRadius = p.size * 0.28
          let rot = (Math.PI / 2) * 3
          let x = 0
          let y = 0
          const step = Math.PI / spikes

          ctx.beginPath()
          ctx.moveTo(0, -outerRadius)
          for (let s = 0; s < spikes; s++) {
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
          ctx.fillStyle = p.color
          ctx.shadowColor = p.color
          ctx.shadowBlur = 6
          ctx.fill()
        } else {
          // Petal
          ctx.beginPath()
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.fill()
        }

        ctx.restore()
      })

      // Remove particles off screen
      particlesRef.current = particlesRef.current.filter(p => p.y < window.innerHeight + 50)

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
