'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Copy, ArrowDownRight, Sparkles } from 'lucide-react'
import authorImage from '@/public/images/authors/ndav.png'
import MacLogo from './mac-logo'

const skillBadges = [
  'Next.js & React',
  'TypeScript',
  'TensorFlow & AI',
  'Cloud Architecture',
  'PostgreSQL',
  'Python'
]

export default function Intro() {
  const [copied, setCopied] = useState(false)
  const email = 'nandasafiqalfiansyah@gmail.com'

  const copyEmail = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scrollToProjects = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.getElementById('featured-projects')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '/projects'
    }
  }

  return (
    <section className='flex flex-col-reverse items-start gap-x-12 gap-y-8 pb-16 md:flex-row md:items-center md:pb-24'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='flex-1'
      >
        {/* Availability Badge */}
        <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary'>
          <span className='relative flex h-2 w-2'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75' />
            <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-600' />
          </span>
          <span>Open for Software Engineer Roles</span>
        </div>

        <h1 className='font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl'>
          Hey, I&#39;m Nanda Safiq.
        </h1>

        <p className='mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base'>
          I&#39;m a software engineer and Machine Learning distinction graduate specializing in building production-ready web applications, scalable distributed backends, and AI-driven solutions.
        </p>

        {/* Core Stack Badges */}
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

        {/* Action CTAs: Project First & Instant Copy Email */}
        <div className='mt-7 flex flex-wrap items-center gap-3'>
          <a
            href='#featured-projects'
            onClick={scrollToProjects}
            className='inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90'
          >
            <span>Explore Projects</span>
            <ArrowDownRight className='h-3.5 w-3.5' />
          </a>

          <button
            type='button'
            onClick={copyEmail}
            className='inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted'
            title='Copy email to clipboard'
          >
            {copied ? (
              <>
                <Check className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                <span className='text-emerald-600 dark:text-emerald-400 font-semibold'>Email Copied!</span>
              </>
            ) : (
              <>
                <Copy className='h-3.5 w-3.5 text-muted-foreground' />
                <span>Copy Email</span>
              </>
            )}
          </button>

          <Link
            href='/contact'
            className='inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground'
          >
            <span>Get in touch &rarr;</span>
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



