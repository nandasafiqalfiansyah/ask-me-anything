'use client'
import * as Collapsible from '@radix-ui/react-collapsible'
import { RowSpacingIcon, Cross2Icon } from '@radix-ui/react-icons'
import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

type Education = {
  id: number
  title: string
  summary: string
  published_at: string
  logo_url: string | null
  link: string | null
  description: string | null
  sort_order: number
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

export default function RecentEdu() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [education, setEducation] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEducation()
  }, [])

  const fetchEducation = async () => {
    const { data, error } = await supabase
      .from('education')
      .select('id, title, summary, published_at, logo_url, link, description, sort_order')
      .order('sort_order', { ascending: true })

    if (!error && data) {
      setEducation(data as Education[])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <section className='pb-24'>
        <div>
          <h2 className='title mb-12 text-left text-3xl font-bold sm:text-4xl'>
            Education
          </h2>
          <p className='text-sm text-muted-foreground'>Loading education...</p>
        </div>
      </section>
    )
  }

  if (education.length === 0) {
    return (
      <section className='pb-24'>
        <div>
          <h2 className='title mb-12 text-left text-3xl font-bold sm:text-4xl'>
            Education
          </h2>
          <p className='text-sm text-muted-foreground'>No education entries yet.</p>
        </div>
      </section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className='pb-24'
    >
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='title mb-12 text-left text-3xl font-bold sm:text-4xl'
        >
          Education
        </motion.h2>

        <ul className='flex flex-col gap-8'>
          {education.map((edu, index) => (
            <motion.li
              key={edu.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ x: 10 }}
              className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'
            >
              {/* Main Content */}
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6'>
                {edu.logo_url && (
                  <motion.img
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    src={edu.logo_url}
                    alt={`${edu.title} logo`}
                    className='h-16 w-16 flex-shrink-0 object-contain sm:h-20 sm:w-20'
                  />
                )}
                <div>
                  <Collapsible.Root
                    open={openIndex === index}
                    onOpenChange={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                  >
                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                      <div>
                        <span className='text-lg font-semibold'>
                          {edu.title}
                        </span>
                        {edu.description && (
                          <Collapsible.Trigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.2, rotate: 180 }}
                              whileTap={{ scale: 0.9 }}
                              className='IconButton ml-2'
                            >
                              <AnimatePresence mode='wait'>
                                {openIndex === index ? (
                                  <motion.div
                                    key='cross'
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Cross2Icon />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key='row'
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <RowSpacingIcon />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          </Collapsible.Trigger>
                        )}
                        <p className='mt-1 text-sm font-light text-muted-foreground'>
                          {edu.summary}
                        </p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {edu.description && openIndex === index && (
                        <Collapsible.Content asChild forceMount>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className='overflow-hidden'
                          >
                            <ReactMarkdown className='mt-2 text-sm font-light text-muted-foreground'>
                              {edu.description}
                            </ReactMarkdown>
                          </motion.div>
                        </Collapsible.Content>
                      )}
                    </AnimatePresence>
                  </Collapsible.Root>
                </div>
              </div>

              {/* Date */}
              {edu.published_at && (
                <p className='text-sm font-light text-gray-500 sm:text-right'>
                  {formatDate(edu.published_at)}
                </p>
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.section>
  )
}
