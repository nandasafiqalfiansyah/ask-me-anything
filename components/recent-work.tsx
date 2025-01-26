'use client'

import Link from 'next/link'
import * as Collapsible from '@radix-ui/react-collapsible'
import { RowSpacingIcon, Cross2Icon } from '@radix-ui/react-icons'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'

// Array of post data
const posts = [
  {
    title: 'Upwork',
    summary: 'Backend developer',
    publishedAt: '2024-04-07',
    logo: 'https://media.licdn.com/dms/image/v2/D560BAQHByMAPjhg12Q/company-logo_200_200/company-logo_200_200/0/1700412231756?e=1740614400&v=beta&t=AYYgjyN7uOejLkvPYVlyuS5FgCHdrikPqC-t74Hsugw',
    link: 'https://www.linkedin.com/company/ruangguru/',
    describe: `
      - Make golang to backend service for client.
      - Developed and maintained backend services.
      - Collaborates with English-speaking clients.
      - Conducted code reviews and pair programming sessions
      - Participated in team meetings with clients.
      - deploy service to production make aws & alibaba cloud.
      - Setting docker to deploy service.
      - make microservice with golang.
      - make documentation with swager or postman.
    `
  },
  {
    title: 'Ruangguru',
    summary: 'Backend developer & Assistant Mentor',
    publishedAt: '2024-01-07',
    logo: 'https://media.licdn.com/dms/image/v2/C560BAQEIu6Alk0BuZA/company-logo_200_200/company-logo_200_200/0/1630621231627/ruangguru_com_logo?e=1740614400&v=beta&t=d1-ldF6Fsf58fBlcB4eEzduSh9Lj3MWXnH_3Ee1_p-A',
    link: 'https://www.linkedin.com/company/ruangguru/',
    describe: `
      - Finished Golang backend development course.
      - Developed and maintained backend services.
      - Mentored students in the Golang track.
      - Collaborated with the team to deliver project requirements.
      - Conducted code reviews and pair programming sessions.
      - Participated in team meetings and brainstorming sessions.
    `
  },
  {
    title: 'Lintasarta Cloudeka 2023',
    summary: 'Machine Learning developer',
    publishedAt: '2023-10-30',
    logo: 'https://media.licdn.com/dms/image/C560BAQEuItk7F_3JPQ/company-logo_200_200/0/1630645857701/lintasartacloudeka_logo?e=2147483647&v=beta&t=IdNaLjKgzVCTi4-BKH5Guud4VlRqjkRKrKarPgB9954',
    link: 'https://www.linkedin.com/company/lintasarta-cloudeka/',
    describe: `
      - Finish dicoding exspert machine learning Course.
      - Focused on machine learning make tensorflow.
      - Monitoring make grafana and prometheus.
      - deploy model to production make cloudeka cloud.
      - setting docker to deploy model.
    `
  },
  {
    title: 'Bangkit Academy 2023',
    summary: 'Cloud Computing developer &  Assistant Mentor',
    publishedAt: '2023-08-01',
    logo: 'https://media.licdn.com/dms/image/v2/C560BAQEVREspL4ipDQ/company-logo_200_200/company-logo_200_200/0/1630661916225/bangkit_academy_logo?e=2147483647&v=beta&t=m6uy-IMO31_-1cigjl17cDsCyFj6lVEit0WT4DmQOyg',
    link: 'https://www.linkedin.com/company/bangkit-academy/',
    describe: `
      - Mentored students in cloud computing tracks.
      - Delivered cloud computing courses.
      - Collaborated with the team to deliver project requirements.
      - Make backend service with express js and prisma.
      - Setting docker to deploy backend service.
      - Seting docker to deploy model service.
      - Collaborated with the team to deliver project requirements.
    `
  },
  {
    title: 'Kariermu',
    summary: 'English Course students intern',
    publishedAt: '2023-08-01',
    logo: 'https://cdn.sekolah.mu/upload/branding--4df889fc3ca549f692d8f354b155b1561644804821.png',
    link: 'https://www.linkedin.com/company/kariermu/',
    describe: `
      - Conducted English courses for students.
      - Facilitated career development sessions.
      - Collaborated with the team to deliver project requirements.
      - Conducted code reviews and pair programming sessions.
    `
  },
  {
    title: 'Ponorogo District Government',
    summary: 'Full Stack developer intern',
    publishedAt: '2023-07-01',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Lambang_Kabupaten_Ponorogo.png',
    link: 'https://www.linkedin.com/company/ponorogo-district/',
    describe: `
      - Led a team intern of developers in building a web application.
      - Designed and developed a website for the Ponorogo District Government.
      - Collaborated with stakeholders to meet local government requirements.
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
          Experience
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
                        <span className='font-semibold'>{post.title}</span>
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
                      <ReactMarkdown className='mt-1 text-sm font-light text-muted-foreground'>
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
