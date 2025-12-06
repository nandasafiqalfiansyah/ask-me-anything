'use client'
import * as Collapsible from '@radix-ui/react-collapsible'
import { RowSpacingIcon, Cross2Icon } from '@radix-ui/react-icons'
import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
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
    <section className='pb-24'>
      <div>
        <h2 className='title mb-12 text-left text-3xl font-bold sm:text-4xl'>
          Education
        </h2>

        <ul className='flex flex-col gap-8'>
          {education.map((edu, index) => (
            <li
              key={edu.id}
              className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'
            >
              {/* Main Content */}
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6'>
                {edu.logo_url && (
                  <img
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
                          {edu.summary}
                        </p>
                      </div>
                    </div>

                    {edu.description && (
                      <Collapsible.Content className='mt-2'>
                        <ReactMarkdown className='mt-1 text-sm font-light text-muted-foreground'>
                          {edu.description}
                        </ReactMarkdown>
                      </Collapsible.Content>
                    )}
                  </Collapsible.Root>
                </div>
              </div>

              {/* Date */}
              {edu.published_at && (
                <p className='text-sm font-light text-gray-500 sm:text-right'>
                  {formatDate(edu.published_at)}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
