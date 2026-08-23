'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface MacLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  interactive?: boolean
  showBadge?: boolean
  className?: string
}

const sizeConfig = {
  xs: {
    container: 'h-6 w-6 rounded-[6px]',
    text: 'text-[10px]',
    badge: 'h-1.5 w-1.5 -top-0.5 -right-0.5'
  },
  sm: {
    container: 'h-8 w-8 rounded-[8px]',
    text: 'text-xs',
    badge: 'h-2 w-2 -top-0.5 -right-0.5'
  },
  md: {
    container: 'h-10 w-10 rounded-[10px]',
    text: 'text-sm',
    badge: 'h-2.5 w-2.5 -top-1 -right-1'
  },
  lg: {
    container: 'h-14 w-14 rounded-[14px]',
    text: 'text-xl',
    badge: 'h-3 w-3 -top-1 -right-1'
  },
  xl: {
    container: 'h-20 w-20 rounded-[20px]',
    text: 'text-3xl',
    badge: 'h-4 w-4 -top-1.5 -right-1.5'
  },
  '2xl': {
    container: 'h-28 w-28 rounded-[26px]',
    text: 'text-5xl',
    badge: 'h-5 w-5 -top-2 -right-2'
  }
}

export default function MacLogo({
  size = 'md',
  interactive = true,
  showBadge = false,
  className = ''
}: MacLogoProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cfg = sizeConfig[size]

  return (
    <div className={`relative inline-flex select-none items-center justify-center ${className}`}>
      <motion.div
        whileHover={interactive ? { scale: 1.08, y: -2 } : undefined}
        whileTap={interactive ? { scale: 0.95 } : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`relative flex items-center justify-center overflow-hidden border border-white/20 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black shadow-lg shadow-black/30 ring-1 ring-inset ring-white/15 dark:border-white/15 dark:shadow-black/50 ${cfg.container}`}
        style={{
          aspectRatio: '1 / 1'
        }}
      >
        {/* macOS Top-Half Glass Glare Sheen */}
        <div className='pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/30 via-white/10 to-transparent' />

        {/* Ambient colored lighting behind monogram */}
        <div className='pointer-events-none absolute -bottom-2 -right-2 h-3/4 w-3/4 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-cyan-500/20 blur-sm' />
        <div className='pointer-events-none absolute -top-2 -left-2 h-3/4 w-3/4 rounded-full bg-gradient-to-br from-cyan-400/20 to-transparent blur-xs' />

        {/* macOS Inner Rim Highlight for Skeuomorphic tactile edge */}
        <div className='pointer-events-none absolute inset-[1px] rounded-[inherit] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.4)]' />

        {/* Dynamic Light Sweep animation on hover */}
        {interactive && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={isHovered ? { x: '200%', opacity: 0.6 } : { x: '-100%', opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className='pointer-events-none absolute inset-y-0 w-1/2 -skew-x-25 bg-gradient-to-r from-transparent via-white/40 to-transparent'
          />
        )}

        {/* Center macOS Brand Content */}
        <div className='relative z-10 flex flex-col items-center justify-center'>
          <div className='flex items-center tracking-tighter'>
            <span
              className={`font-mono font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-indigo-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${cfg.text}`}
            >
              N
            </span>
            <span
              className={`font-sans font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] ${
                size === 'xs' || size === 'sm' ? 'hidden' : 'text-[0.65em] -ml-0.5'
              }`}
            >
              .
            </span>
          </div>
        </div>
      </motion.div>

      {/* Optional macOS Notification / Active Badge Dot */}
      {showBadge && (
        <span
          className={`absolute rounded-full bg-emerald-500 ring-2 ring-background ${cfg.badge}`}
        />
      )}
    </div>
  )
}
