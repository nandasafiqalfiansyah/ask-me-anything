'use client'

import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface Card3DProps {
  children: React.ReactNode
  className?: string
  intensity?: number
  glare?: boolean
}

export function Card3D({
  children,
  className = '',
  intensity = 15,
  glare = true
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 20 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [intensity, -intensity])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-intensity, intensity])

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%'])

  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(circle 250px at ${gx} ${gy}, rgba(255,255,255,0.18), transparent 70%)`
  )

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      className={`relative transition-shadow duration-300 ${className}`}
    >
      <div className='relative h-full w-full [transform-style:preserve-3d]'>
        {children}

        {glare && (
          <motion.div
            style={{
              background: glareBackground
            }}
            className='pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100'
          />
        )}
      </div>
    </motion.div>
  )
}
