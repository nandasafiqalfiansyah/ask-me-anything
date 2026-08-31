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
                        <span className='h-2 w-2 shrink-0 rounded-full bg-primary' />
                        <h3 className='font-serif text-base font-bold text-foreground'>
                          {edu.title}
                        </h3>
                        {edu.institution && (
                          <span className='rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
                            {edu.institution}
                          </span>
                        )}
                      </div>

                      <p className='mt-1 text-xs text-muted-foreground sm:text-sm'>
                        {edu.summary}
                      </p>

                      {edu.description && (
                        <div className='mt-3'>
                          <Collapsible.Trigger asChild>
                            <button
                              type='button'
                              className='inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted hover:text-foreground'
                            >
                              <AnimatePresence mode='wait' initial={false}>
                                {isOpen ? (
                                  <motion.span
                                    key='hide'
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className='inline-flex items-center gap-1'
                                  >
                                    <svg
                                      xmlns='http://www.w3.org/2000/svg'
                                      viewBox='0 0 15 15'
                                      fill='none'
                                      className='h-3 w-3'
                                    >
                                      <path
                                        d='M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z'
                                        fill='currentColor'
                                        fillRule='evenodd'
                                        clipRule='evenodd'
                                      />
                                    </svg>
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
                                    <svg
                                      xmlns='http://www.w3.org/2000/svg'
                                      viewBox='0 0 15 15'
                                      fill='none'
                                      className='h-3 w-3'
                                    >
                                      <path
                                        d='M7.5 1.5C7.22386 1.5 7 1.72386 7 2V5.5H3.5C3.22386 5.5 3 5.72386 3 6C3 6.27614 3.22386 6.5 3.5 6.5H7V10H3.5C3.22386 10 3 10.2239 3 10.5C3 10.7761 3.22386 11 3.5 11H7V14.5C7 14.7761 7.22386 15 7.5 15C7.77614 15 8 14.7761 8 14.5V11H11.5C11.7761 11 12 10.7761 12 10.5C12 10.2239 11.7761 10 11.5 10H8V6.5H11.5C11.7761 6.5 12 6.27614 12 6C12 5.72386 11.7761 5.5 11.5 5.5H8V2C8 1.72386 7.77614 1.5 7.5 1.5Z'
                                        fill='currentColor'
                                        fillRule='evenodd'
                                        clipRule='evenodd'
                                      />
                                    </svg>
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

                  {edu.published_at && (
                    <div className='text-[0.72rem] font-mono text-muted-foreground sm:text-right shrink-0'>
                      {edu.published_at}
                    </div>
                  )}
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
                        <div className='mt-4 rounded-xl border border-border/40 bg-muted/30 p-3.5 text-xs leading-relaxed text-muted-foreground sm:text-sm'>
                          <ReactMarkdown>{edu.description}</ReactMarkdown>
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

