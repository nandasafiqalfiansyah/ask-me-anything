'use client'

import Image from 'next/image'
import * as Collapsible from '@radix-ui/react-collapsible'
import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

type Education = {
  id: number
  title: string
  institution?: string
  summary: string
  published_at: string
  logo_url: string | null
  link: string | null
  description: string | null
  sort_order: number
}

const DEFAULT_EDUCATION: Education[] = [
  {
    id: 1,
    title: "Bachelor's Degree in Informatics Engineering",
    institution: 'Universitas Muhammadiyah Ponorogo (UMPO)',
    summary:
      'Focusing on Software Engineering, Distributed Systems, Data Structures, and Applied Machine Learning.',
    published_at: '2021 - Present',
    logo_url: '/images/umpo.png',
    link: 'https://umpo.ac.id',
    description:
      '- Maintained high academic standing with active involvement in IT competitions and research.\n- Core Courses: Algorithm Design, Web & Mobile Development, Database Management Systems, Machine Learning.\n- Awarded Runner-up at ICONIC IT 2024 National Web Development Competition.',
    sort_order: 1
  },
  {
    id: 2,
    title: 'Machine Learning & Cloud Computing Graduate',
    institution: 'Bangkit Academy led by Google, GoTo, and Traveloka',
    summary:
      'Rigorous career readiness program covering Deep Learning, TensorFlow Developer Certification track, and Cloud Deployment on GCP.',
    published_at: 'Feb 2024 - Jul 2024',
    logo_url: '/Google__G__logo.svg',
    link: 'https://grow.google/intl/id_id/bangkit/',
    description:
      '- Completed 900+ hours of intensive curriculum in Machine Learning, Soft Skills, and English Communications.\n- Earned certifications in TensorFlow, Data Analytics, and Google Cloud Computing Foundations.\n- Selected as Capstone Project Team Lead leading 6 engineers to build the Moneo AI fintech platform.',
    sort_order: 2
  }
]

const getEduLogo = (edu: Education) => {
  if (edu.logo_url) return edu.logo_url
  const text = `${edu.title} ${edu.institution || ''}`.toLowerCase()
  if (text.includes('umpo') || text.includes('muhammadiyah')) {
    return '/images/umpo.png'
  }
  if (text.includes('bangkit') || text.includes('google')) {
    return '/Google__G__logo.svg'
  }
  return '/next.svg'
}

export default function RecentEdu() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [education, setEducation] = useState<Education[]>(DEFAULT_EDUCATION)

  useEffect(() => {
    async function fetchEducation() {
      if (!isSupabaseConfigured()) {
        return
      }

      try {
        const { data, error } = await supabase
          .from('education')
          .select(
            'id, title, summary, published_at, logo_url, link, description, sort_order'
          )
          .order('sort_order', { ascending: true })

        if (!error && data && data.length > 0) {
          setEducation(data as Education[])
        }
      } catch (err) {
        console.error('Error fetching education from Supabase:', err)
      }
    }

    fetchEducation()
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className='pb-16 sm:pb-24'
    >
      <div>
        <h2 className='font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
          Education & Certifications
        </h2>
        <p className='mt-2 text-sm text-muted-foreground'>
          Academic qualifications, specialized academies, and formal learning
        </p>
      </div>

      <div className='mt-8 flex flex-col gap-4'>
        {education.map((edu, index) => {
          const isOpen = openIndex === index
          return (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className='group rounded-2xl border border-border/70 bg-card/70 p-5 shadow-2xs backdrop-blur-xs transition-all hover:border-foreground/30 hover:bg-card'
            >
              <Collapsible.Root
                open={isOpen}
                onOpenChange={() => setOpenIndex(isOpen ? null : index)}
              >
                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='flex items-start gap-3.5 flex-1'>
                    <div className='relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-background/90 p-2 shadow-2xs transition-transform duration-300 group-hover:scale-105'>
                      <Image
                        src={getEduLogo(edu)}
                        alt={`${edu.institution || edu.title} logo`}
                        width={32}
                        height={32}
                        className='h-auto max-h-7 w-auto max-w-7 object-contain'
                      />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h3 className='text-base font-semibold tracking-tight text-foreground'>
                          {edu.title}
                        </h3>
                        {edu.institution && (
                          <span className='rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
                            {edu.institution}
                          </span>
                        )}
                      </div>

                      <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
                        {edu.summary}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 self-start sm:self-auto'>
                    <span className='text-xs font-mono text-muted-foreground'>
                      {edu.published_at}
                    </span>

                    {edu.description && (
                      <Collapsible.Trigger asChild>
                        <button
                          type='button'
                          className='inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-muted active:scale-95'
                        >
                          <span>{isOpen ? 'Show Less' : 'Details'}</span>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                            className={`h-3.5 w-3.5 transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          >
                            <path
                              fillRule='evenodd'
                              d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </button>
                      </Collapsible.Trigger>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {edu.description && isOpen && (
                    <Collapsible.Content asChild forceMount>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className='overflow-hidden'
                      >
                        <div className='mt-4 border-t border-border/60 pt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm'>
                          <ReactMarkdown className='prose-sm dark:prose-invert'>
                            {edu.description}
                          </ReactMarkdown>
                        </div>
                      </motion.div>
                    </Collapsible.Content>
                  )}
                </AnimatePresence>
              </Collapsible.Root>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}

