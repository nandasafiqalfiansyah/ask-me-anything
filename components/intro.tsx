'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import authorImage from '@/public/images/authors/ndav.png'
import MacLogo from './mac-logo'

const floatingChips = [
  {
    label: 'Next.js 15',
    className: '-left-4 top-2 bg-foreground/90 text-background shadow-lg shadow-black/10'
  },
  {
    label: 'TensorFlow & AI',
    className: '-right-3 top-6 bg-primary/20 text-primary ring-1 ring-primary/30 shadow-lg shadow-primary/10'
  },
  {
    label: 'Full-Stack',
    className: '-left-2 bottom-4 bg-card/90 text-foreground ring-1 ring-border/80 shadow-lg shadow-black/5'
  },
  {
    label: 'Cloud & GCP',
    className: '-right-2 bottom-1 bg-primary text-primary-foreground shadow-lg shadow-primary/20'
  }
]

export default function Intro() {
  const portraitRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 160, damping: 18 })
  const springY = useSpring(mouseY, { stiffness: 160, damping: 18 })

  const rotateX = useTransform(springY, [-0.5, 0.5], [16, -16])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-16, 16])
  const glareX = useTransform(springX, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(springY, [-0.5, 0.5], ['0%', '100%'])

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = portraitRef.current
    if (!element) return

    const rect = element.getBoundingClientRect()
    const pctX = (event.clientX - rect.left) / rect.width - 0.5
    const pctY = (event.clientY - rect.top) / rect.height - 0.5

    mouseX.set(pctX)
    mouseY.set(pctY)
  }

  const resetRotation = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <section className='flex flex-col-reverse items-start gap-x-10 gap-y-8 pb-16 md:flex-row md:items-center md:pb-24'>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className='flex-1'
      >
        <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-xs'>
          <span className='relative flex h-2 w-2'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75' />
            <span className='relative inline-flex h-2 w-2 rounded-full bg-primary' />
          </span>
          <span>Available for projects & roles</span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl'
        >
          Hey, I&#39;m Nanda Safiq.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base'
        >
          I&#39;m a software engineer and Machine Learning distinction graduate based in East Java, Indonesia. I specialize in crafting modern, high-performance web applications, scalable distributed backends, and AI-powered interfaces.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='mt-6 flex flex-wrap items-center gap-3'
        >
          <Link
            href='/contact'
            className='inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-background shadow-md transition-all hover:scale-105 hover:bg-foreground/90 active:scale-95'
          >
            <span>Let&apos;s Connect</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='h-3.5 w-3.5'
            >
              <path
                fillRule='evenodd'
                d='M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z'
                clipRule='evenodd'
              />
            </svg>
          </Link>

          <Link
            href='/projects'
            className='inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-5 py-2 text-xs font-semibold text-foreground backdrop-blur-xs transition-all hover:scale-105 hover:border-foreground/30 hover:bg-card active:scale-95'
          >
            <span>View Projects</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* 3D Holographic Avatar Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        style={{ perspective: 1200 }}
        className='relative isolate shrink-0 [transform-style:preserve-3d]'
      >
        <motion.div
          ref={portraitRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetRotation}
          onPointerCancel={resetRotation}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d'
          }}
          className='group relative cursor-grab rounded-3xl p-1.5 active:cursor-grabbing'
        >
          {/* Ambient Glows */}
          <div className='absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary/30 via-primary/5 to-transparent blur-3xl' />
          
          {/* 3D Outer Layer */}
          <div className='relative rounded-2xl border border-border/80 bg-background/80 p-3 shadow-2xl backdrop-blur-md [transform-style:preserve-3d]'>
            {/* Dynamic Glare Reflection */}
            <motion.div
              style={{
                background: useTransform(
                  [glareX, glareY],
                  ([gx, gy]) =>
                    `radial-gradient(circle 220px at ${gx} ${gy}, rgba(255,255,255,0.22), transparent 70%)`
                )
              }}
              className='pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-70 transition-opacity duration-300'
            />

            <div className='relative h-44 w-44 overflow-hidden rounded-xl sm:h-48 sm:w-48'>
              <Image
                className='object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0'
                src={authorImage}
                alt='Nanda Safiq Alfiansyah'
                fill
                priority
              />
            </div>

            {/* macOS Style Signature Badge */}
            <div className='absolute -bottom-3 -right-3 z-30 drop-shadow-xl'>
              <MacLogo size='sm' showBadge={true} interactive={true} />
            </div>
          </div>
        </motion.div>

        {/* 3D Floating Chips */}
        {floatingChips.map((item, index) => (
          <motion.div
            key={item.label}
            aria-hidden='true'
            className={`absolute z-30 rounded-full px-2.5 py-1 text-[0.68rem] font-medium tracking-wide backdrop-blur-md ${item.className}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -6, 0],
              x: index % 2 === 0 ? [0, 3, 0] : [0, -3, 0],
              rotate: index % 2 === 0 ? [-2, 2, -2] : [2, -2, 2]
            }}
            transition={{
              duration: 3.8 + index * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2 * index
            }}
          >
            {item.label}
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

