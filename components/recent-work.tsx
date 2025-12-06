'use client'

import Link from 'next/link'
import * as Collapsible from '@radix-ui/react-collapsible'
import { RowSpacingIcon, Cross2Icon } from '@radix-ui/react-icons'
import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../lib/supabaseClient'

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
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('sort_order', { ascending: true })

    if (!error && data) {
      setExperiences(data as Experience[])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <section className='pb-24'>
        <div>
          <h2 className='mb-12 text-left text-3xl font-bold sm:text-4xl title'>
            Experience
          </h2>
          <p className='text-sm text-muted-foreground'>Loading experiences...</p>
        </div>
      </section>
    )
  }

  if (experiences.length === 0) {
    return (
      <section className='pb-24'>
        <div>
          <h2 className='mb-12 text-left text-3xl font-bold sm:text-4xl title'>
            Experience
          </h2>
          <p className='text-sm text-muted-foreground'>No experiences yet.</p>
        </div>
      </section>
    )
  }

  return (
    <section className='pb-24'>
      <div>
        <h2 className='mb-12 text-left text-3xl font-bold sm:text-4xl title'>
          Experience
        </h2>

        <ul className='flex flex-col gap-8'>
          {experiences.map((experience, index) => (
            <li
              key={experience.id}
              className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'
            >
              {/* Main Content */}
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6'>
                {experience.logo_url && (
                  <img
                    src={experience.logo_url}
                    alt={`${experience.title} logo`}
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
                        <span className='font-semibold'>{experience.title}</span>
                        {experience.description && (
                          <Collapsible.Trigger asChild>
                            <button className='IconButton ml-2'>
                              {openIndex === index ? (
                                <Cross2Icon />
                              ) : (
                                <RowSpacingIcon />
                              )}
                            </button>
                          </Collapsible.Trigger>
                        )}
                        <p className='mt-1 text-sm font-light text-muted-foreground'>
                          {experience.summary}
                        </p>
                      </div>
                    </div>

                    {experience.description && (
                      <Collapsible.Content className='mt-2'>
                        <ReactMarkdown className='mt-1 text-sm font-light text-muted-foreground'>
                          {experience.description}
                        </ReactMarkdown>
                      </Collapsible.Content>
                    )}
                  </Collapsible.Root>
                </div>
              </div>

              {/* Date */}
              {experience.published_at && (
                <p className='text-sm font-light text-gray-500 sm:text-right'>
                  {formatDate(experience.published_at)}
                </p>
              )}
            </li>
          ))}
        </ul>

        <div className='mt-8 text-left'>
          <Link
            href='https://www.linkedin.com/in/nanda-safiq-alfiansyah'
            className='inline-flex gap-2 text-sm font-medium text-muted-foreground underline decoration-1 underline-offset-2 transition-colors hover:text-foreground'
          >
            <span>All Work Experience</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
