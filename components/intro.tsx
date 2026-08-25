'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import authorImage from '@/public/images/authors/ndav.png'
import MacLogo from './mac-logo'

const skillBadges = [
  'Next.js & React',
  'TypeScript',
  'TensorFlow & AI',
  'Cloud Architecture',
  'PostgreSQL'
]

export default function Intro() {
  return (
    <section className='flex flex-col-reverse items-start gap-x-12 gap-y-8 pb-16 md:flex-row md:items-center md:pb-24'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='flex-1'
      >
        <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary'>
          <span className='relative flex h-2 w-2'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75' />
            <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-600' />
          </span>
          <span>Open for Roles & Collaboration</span>
        </div>

        <h1 className='font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl'>
          Hey, I&#39;m Nanda Safiq.
        </h1>

        <p className='mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base'>
          I&#39;m a software engineer and Machine Learning graduate based in East Java, Indonesia. I specialize in building robust, performant web applications, scalable backend systems, and AI-driven solutions.
        </p>

        {/* Skill tags */}
        <div className='mt-5 flex flex-wrap items-center gap-2'>
          {skillBadges.map(skill => (
            <span
              key={skill}
              className='rounded-md border border-border/80 bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground'
            >
              {skill}
            </span>
          ))}
        </div>

        <div className='mt-7 flex flex-wrap items-center gap-3'>
          <Link
            href='/contact'
            className='inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90'
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
            className='inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted'
          >
            <span>View Projects</span>
          </Link>
        </div>
      </motion.div>

      {/* Formal Profile Portrait */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='relative shrink-0'
      >
        <div className='relative rounded-2xl border border-border/80 bg-card p-2 shadow-sm'>
          <div className='relative h-44 w-44 overflow-hidden rounded-xl bg-muted sm:h-52 sm:w-52'>
            <Image
              className='object-cover transition-all duration-300 hover:scale-102'
              src={authorImage}
              alt='Nanda Safiq Alfiansyah'
              fill
              priority
            />
          </div>

          <div className='absolute -bottom-2 -right-2 drop-shadow-md'>
            <MacLogo size='sm' showBadge={true} interactive={false} />
          </div>
        </div>
      </motion.div>
    </section>
  )
}


