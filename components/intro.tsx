'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import authorImage from '@/public/images/authors/ndav.png'

const floatingLabels = [
  {
    label: 'Next.js',
    className:
      'left-[-1.25rem] top-[1.25rem] bg-foreground/90 text-background shadow-[0_18px_40px_rgba(0,0,0,0.18)]'
  },
  {
    label: 'Supabase',
    className:
      'right-[-1rem] top-[0.5rem] bg-primary/15 text-primary ring-1 ring-primary/20 shadow-[0_18px_40px_rgba(0,0,0,0.12)]'
  },
  {
    label: 'UI',
    className:
      'left-[0.5rem] bottom-[-1rem] bg-card/90 text-foreground ring-1 ring-border shadow-[0_18px_40px_rgba(0,0,0,0.12)]'
  },
  {
    label: 'Motion',
    className:
      'right-[0.5rem] bottom-[0.5rem] bg-primary/90 text-primary-foreground shadow-[0_18px_40px_rgba(0,0,0,0.18)]'
  }
]

export default function Intro() {
  const portraitRef = useRef<HTMLDivElement>(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const scale = useMotionValue(1)

  const springRotateX = useSpring(rotateX, { stiffness: 140, damping: 18 })
  const springRotateY = useSpring(rotateY, { stiffness: 140, damping: 18 })
  const springScale = useSpring(scale, { stiffness: 180, damping: 18 })

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = portraitRef.current

    if (!element) {
      return
    }

    const rect = element.getBoundingClientRect()
    const percentX = (event.clientX - rect.left) / rect.width
    const percentY = (event.clientY - rect.top) / rect.height
    const rotateAmount = 14

    rotateY.set((percentX - 0.5) * rotateAmount)
    rotateX.set((0.5 - percentY) * rotateAmount)
    scale.set(1.03)
  }

  const resetRotation = () => {
    rotateX.set(0)
    rotateY.set(0)
    scale.set(1)
  }

  return (
    <section className='flex flex-col-reverse items-start gap-x-10 gap-y-4 pb-24 md:flex-row md:items-center'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='mt-2 flex-1 md:mt-0'
      >
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='title no-underline'
        >
          Hey, I&#39;m Nanda Safiq.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='mt-3 font-light text-muted-foreground'
        >
          I&#39;m a software engineer based in East java, Indonesia. I&#39;m
          passionate about learning new technologies and sharing knowledge with
          others.
        </motion.p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        style={{ perspective: 1200 }}
        className='relative isolate [transform-style:preserve-3d]'
      >
        <motion.div
          ref={portraitRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetRotation}
          onPointerCancel={resetRotation}
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY,
            scale: springScale,
            transformStyle: 'preserve-3d'
          }}
          className='relative cursor-grab rounded-[1.6rem] p-1 active:cursor-grabbing'
        >
          <div className='absolute -inset-7 rounded-[2.25rem] bg-gradient-to-br from-primary/25 via-transparent to-foreground/10 blur-3xl' />
          <div className='absolute inset-0 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_42%)] opacity-60 mix-blend-overlay' />
          <div className='absolute inset-0 rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-background/70 via-background/40 to-primary/10 shadow-[0_35px_90px_rgba(0,0,0,0.22)] backdrop-blur-md' />
          <div className='relative rounded-[1.45rem] border border-border/70 bg-background/80 p-3 shadow-2xl [transform-style:preserve-3d]'>
            <div className='absolute inset-0 rounded-[1.15rem] bg-gradient-to-tr from-primary/10 via-transparent to-transparent' />
            <div className='absolute inset-0 rounded-[1.15rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_35%,transparent_65%,rgba(255,255,255,0.08))] opacity-70' />
            <Image
              className='relative z-10 flex-1 rounded-[1.1rem] grayscale transition-all duration-300 hover:grayscale-0'
              src={authorImage}
              alt='Nanda Safiq Alfiansyah'
              width={210}
              height={200}
              priority
            />
          </div>
        </motion.div>

        {floatingLabels.map((item, index) => (
          <motion.div
            key={item.label}
            aria-hidden='true'
            className={`absolute rounded-full px-3 py-1 text-[0.7rem] font-medium tracking-wide backdrop-blur-md ${item.className}`}
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{
              opacity: 1,
              y: [0, -8, 0],
              x: index % 2 === 0 ? [0, 4, 0] : [0, -4, 0],
              rotate: index % 2 === 0 ? [-2, 2, -2] : [2, -2, 2]
            }}
            transition={{
              duration: 4.2 + index * 0.45,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2 * index
            }}
          >
            {item.label}
          </motion.div>
        ))}

        <motion.div
          aria-hidden='true'
          className='absolute -bottom-4 left-1/2 h-20 w-[72%] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl'
          animate={{ opacity: [0.35, 0.6, 0.35], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
