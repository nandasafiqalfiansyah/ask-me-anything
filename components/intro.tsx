'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
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
        whileHover={{ scale: 1.03, rotateY: -8, rotateX: 4 }}
        style={{ perspective: 1200 }}
        className='relative isolate'
      >
        <div className='absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-foreground/10 blur-3xl' />
        <div className='absolute -inset-1 rounded-[1.75rem] border border-border/60 bg-gradient-to-br from-background/70 via-background/30 to-primary/10 shadow-[0_30px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm' />
        <div className='relative rounded-[1.5rem] border border-border/70 bg-background/80 p-3 shadow-2xl [transform-style:preserve-3d]'>
          <div className='absolute inset-0 rounded-[1.25rem] bg-gradient-to-tr from-primary/10 via-transparent to-transparent' />
          <Image
            className='relative flex-1 rounded-[1.1rem] grayscale transition-all duration-300 hover:grayscale-0'
            src={authorImage}
            alt='Nanda Safiq Alfiansyah'
            width={210}
            height={200}
            priority
          />
        </div>

        {floatingLabels.map((item, index) => (
          <motion.div
            key={item.label}
            aria-hidden='true'
            className={`absolute rounded-full px-3 py-1 text-[0.7rem] font-medium tracking-wide ${item.className}`}
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{
              opacity: 1,
              y: [0, -8, 0],
              x: index % 2 === 0 ? [0, 4, 0] : [0, -4, 0],
              rotate: index % 2 === 0 ? [-2, 2, -2] : [2, -2, 2]
            }}
            transition={{
              duration: 4.5 + index * 0.4,
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
