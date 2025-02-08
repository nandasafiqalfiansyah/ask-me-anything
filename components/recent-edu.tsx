'use client'
import * as Collapsible from '@radix-ui/react-collapsible'
import { RowSpacingIcon, Cross2Icon } from '@radix-ui/react-icons'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'

// Array of post data
const posts = [
  {
    title: 'Universitas Muhammadiyah Ponorogo',
    summary: 'Higher Education Institution in Ponorogo, East Java, Indonesia',
    publishedAt: '11-13-2024',
    logo: '/images/umpo.png',
    link: 'https://www.linkedin.com/school/universitas-muhammadiyah-ponorogo',
    describe: `
    - Iconic IT 2024 Runner-up in a national competition and seminar.
    - IT Comfest 2022 Runner-up in a local campus competition.
  `
  }
]

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

  return (
    <section className='pb-24'>
      <div>
        <h2 className='mb-12 text-left text-3xl font-bold sm:text-4xl'>
          Education
        </h2>

        <ul className='flex flex-col gap-8'>
          {posts.map((post, index) => (
            <li
              key={post.link}
              className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'
            >
              {/* Main Content */}
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6'>
                <img
                  src={post.logo}
                  alt={`${post.title} logo`}
                  className='h-16 w-16 flex-shrink-0 object-contain sm:h-20 sm:w-20'
                />
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
                          {post.title}
                        </span>
                        <Collapsible.Trigger asChild>
                          <button className='IconButton ml-2'>
                            {openIndex === index ? (
                              <Cross2Icon />
                            ) : (
                              <RowSpacingIcon />
                            )}
                          </button>
                        </Collapsible.Trigger>
                        <p className='mt-1 text-sm font-light text-muted-foreground'>
                          {post.summary}
                        </p>
                      </div>
                    </div>

                    <Collapsible.Content className='mt-2'>
                      <ReactMarkdown className='mt-1 overflow-scroll text-sm font-light text-muted-foreground'>
                        {post.describe}
                      </ReactMarkdown>
                    </Collapsible.Content>
                  </Collapsible.Root>
                </div>
              </div>

              {/* Date */}
              {post.publishedAt && (
                <p className='text-sm font-light text-gray-500 sm:text-right'>
                  {formatDate(post.publishedAt)}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
