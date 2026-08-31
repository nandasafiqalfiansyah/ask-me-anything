'use client'

import Image from 'next/image'
import Link from 'next/link'
import * as Collapsible from '@radix-ui/react-collapsible'
import { RowSpacingIcon, Cross2Icon } from '@radix-ui/react-icons'
import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

type Experience = {
  id: number
  title: string
  summary: string
  published_at: string
  logo_url: string | null
  link: string | null
  description: string | null
  sort_order: number
}

const FALLBACK_EXPERIENCES: Experience[] = [
  {
    id: 1,
    title: 'Machine Learning Cohort - Google Bangkit Academy',
    summary: 'Distinction Graduate led by Google, GoTo, and Traveloka',
    published_at: '2024-01-15',
    logo_url: '/Google__G__logo.svg',
    link: 'https://grow.google/intl/id_id/bangkit/',
    description: `Specialized in Machine Learning, Deep Learning, and Cloud deployments.
- Implemented real-world Computer Vision & NLP models using TensorFlow.
- Deployed scalable ML model endpoints onto Google Cloud Platform (GCP).
- Collaborated in an agile cross-functional team to build a capstone project.`,
    sort_order: 1
  },
  {
    id: 2,
    title: 'Back-End & Front-End Web Engineer',
    summary: 'Full-stack application architecture and cloud engineering',
    published_at: '2023-08-01',
    logo_url: '/next.svg',
    link: 'https://github.com/nandasafiqalfiansyah',
    description: `Engineered high-performance web applications and REST APIs.
- Built responsive user interfaces with Next.js, React, Tailwind CSS, and Framer Motion.
- Designed database schemas, authentication flows, and microservices.
- Applied clean code principles, automated unit testing, and continuous integration.`,
    sort_order: 2
  },
  {
    id: 3,
    title: 'Informatics Engineering - Univ. Muhammadiyah Ponorogo',
    summary: 'Bachelor of Computer Science / Informatics Engineering',
    published_at: '2021-09-01',
    logo_url: '/images/umpo.png',
    link: 'https://umpo.ac.id',
    description: `Comprehensive study in Software Engineering, Algorithms & Data Structures, Database Systems, Artificial Intelligence, and Computer Networks.`,
    sort_order: 3
  }
]

const getExperienceLogo = (exp: Experience) => {
  if (exp.logo_url) return exp.logo_url
  const titleLower = exp.title.toLowerCase()
  if (titleLower.includes('bangkit') || titleLower.includes('google')) {
    return '/Google__G__logo.svg'
  }
  if (
    titleLower.includes('umpo') ||
    titleLower.includes('muhammadiyah') ||
    titleLower.includes('informatics')
  ) {
    return '/images/umpo.png'
  }
  return '/next.svg'
}

// Utility function to format date
function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

export default function RecentWork() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [experiences, setExperiences] = useState<Experience[]>(FALLBACK_EXPERIENCES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('id, title, summary, published_at, logo_url, link, description, sort_order')
        .order('sort_order', { ascending: true })

      if (!error && data && data.length > 0) {
        setExperiences(data as Experience[])
      }
    } catch (err) {
      console.error('Error fetching experiences:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className='pb-16 sm:pb-24'
    >
      <div>
        <div className='flex items-end justify-between gap-4 pb-8'>
          <div>
            <h2 className='font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
              Work & Education Experience
            </h2>
            <p className='mt-2 text-sm text-muted-foreground'>
              Career history, engineering background, and academic path
            </p>
          </div>

          <Link
            href='https://www.linkedin.com/in/nanda-safiq-alfiansyah'
            target='_blank'
            rel='noopener noreferrer'
            className='hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground'
          >
            <span>LinkedIn Profile</span>
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
        </div>

        <ul className='flex flex-col gap-4'>
          {experiences.map((experience, index) => (
            <motion.li
              key={experience.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className='group rounded-2xl border border-border/70 bg-card/80 p-5 shadow-2xs backdrop-blur-xs transition-all hover:border-foreground/30 hover:bg-card'
            >
              <Collapsible.Root
                open={openIndex === index}
                onOpenChange={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              >
                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div className='flex items-start gap-3.5 flex-1'>
                  <div className='relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-background/90 p-2 shadow-2xs transition-transform duration-300 group-hover:scale-105'>
                    <Image
                      src={getExperienceLogo(experience)}
                      alt={`${experience.title} logo`}
                      width={32}
                      height={32}
                      className='h-auto max-h-7 w-auto max-w-7 object-contain'
                    />
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <span className='h-2 w-2 shrink-0 rounded-full bg-primary' />
                      <h3 className='font-serif text-base font-bold text-foreground'>
                        {experience.title}
                      </h3>
                    </div>

                    <p className='mt-1 text-xs text-muted-foreground sm:text-sm'>
                      {experience.summary}
                    </p>

                    {experience.description && (
                      <div className='mt-3'>
                        <Collapsible.Trigger asChild>
                          <button
                            type='button'
                            className='inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted hover:text-foreground'
                          >
                            <AnimatePresence mode='wait' initial={false}>
                              {openIndex === index ? (
                                <motion.span
                                  key='hide'
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className='inline-flex items-center gap-1'
                                >
                                  <Cross2Icon className='h-3 w-3' />
                                  <span>Hide details</span>
                                </motion.span>
                              ) : (
                                <motion.span
                                  key='show'
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className='inline-flex items-center gap-1'
                                >
                                  <RowSpacingIcon className='h-3 w-3' />
                                  <span>View details</span>
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                        </Collapsible.Trigger>
                      </div>
                    )}
                  </div>
                </div>

                {experience.published_at && (
                  <div className='text-[0.72rem] font-mono text-muted-foreground sm:text-right shrink-0'>
                    {formatDate(experience.published_at)}
                  </div>
                )}
              </div>

              {experience.description && (
                <AnimatePresence>
                  {openIndex === index && (
                    <Collapsible.Content asChild forceMount>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className='overflow-hidden'
                      >
                        <div className='mt-4 rounded-xl border border-border/40 bg-muted/30 p-3.5 text-xs leading-relaxed text-muted-foreground sm:text-sm'>
                          <ReactMarkdown>{experience.description}</ReactMarkdown>
                        </div>
                      </motion.div>
                    </Collapsible.Content>
                  )}
                </AnimatePresence>
              )}
            </Collapsible.Root>
          </motion.li>
        ))}
      </ul>

        <div className='mt-6 sm:hidden'>
          <Link
            href='https://www.linkedin.com/in/nanda-safiq-alfiansyah'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline decoration-1 underline-offset-2 hover:text-foreground'
          >
            <span>View full history on LinkedIn</span>
          </Link>
        </div>
      </div>
    </motion.section>
  )
}

