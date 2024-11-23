'use client'

import React from 'react'
import Link from 'next/link'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
// Array of post data
const posts = [
  {
    title: 'Universitas Muhammadiyah Ponorogo',
    summary: 'Higher Education Institution in Ponorogo, East Java, Indonesia',
    publishedAt: '11-13-2024',
    logo: 'https://umpo.ac.id/web-con/app/app-upload/images/files/1686106386-UMPO-logo-resmi.png',
    link: 'https://www.linkedin.com/school/universitas-muhammadiyah-ponorogo',
    tasks: [
      'Conducted student counseling sessions',
      'Managed academic events and workshops',
      'Developed e-learning materials'
    ]
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

export default function RecentEdu() {
  return (
    <section className='pb-24'>
      <div>
        <h2 className='mb-12 text-left text-3xl font-bold md:text-left'>
          Education
        </h2>

        <ul className='flex flex-col gap-8'>
          {posts.map(post => (
            <li
              key={post.link}
              className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'
            >
              {/* Main Content */}
              <div className='flex flex-col gap-4 md:flex-row md:items-center md:gap-6'>
                <img
                  src={post.logo}
                  alt={`${post.title} logo`}
                  className='h-16 w-16 flex-shrink-0 object-contain md:h-20 md:w-20'
                />
                <div>
                  <p className='text-lg font-semibold'>{post.title}</p>
                  <p className='mt-1 text-sm font-light text-muted-foreground'>
                    {post.summary}
                  </p>
                </div>
              </div>

              {/* Date */}
              {post.publishedAt && (
                <p className='text-sm font-light text-gray-500 md:text-right'>
                  {formatDate(post.publishedAt)}
                </p>
              )}
            </li>
          ))}
        </ul>

        <div className='mt-8 text-center md:text-left'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline decoration-1 underline-offset-2 transition-colors hover:text-foreground'
          >
            <span>All Education Experience</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
