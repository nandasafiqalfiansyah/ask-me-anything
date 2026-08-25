'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { ProjectMetadata } from '@/lib/projects'
import { formatDate } from '@/lib/utils'

export default function Projects({
  projects
}: {
  projects: ProjectMetadata[]
}) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  }

  if (projects.length === 0) {
    return (
      <div className='rounded-xl border border-dashed border-border/80 p-8 text-center text-sm text-muted-foreground'>
        No projects found.
      </div>
    )
  }

  return (
    <motion.ul
      variants={containerVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-60px' }}
      className='grid grid-cols-1 gap-6 sm:grid-cols-2'
    >
      {projects.map(project => (
        <motion.li
          key={project.slug}
          variants={itemVariants}
          className='group'
        >
          <Link
            href={`/projects/${project.slug}`}
            className='flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs transition-all hover:border-foreground/30 hover:shadow-md'
          >
            {/* Image Preview */}
            <div className='relative h-48 w-full overflow-hidden bg-muted sm:h-52'>
              {project.image ? (
                <Image
                  src={project.image}
                  alt={project.title || 'Project preview'}
                  fill
                  className='object-cover object-center transition-transform duration-300 group-hover:scale-102'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-muted text-xs font-mono text-muted-foreground'>
                  NDAV Project
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className='flex flex-1 flex-col p-5'>
              <div className='flex items-center justify-between gap-2'>
                <h3 className='font-serif text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary'>
                  {project.title}
                </h3>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  className='h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground'
                >
                  <path
                    fillRule='evenodd'
                    d='M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>

              <p className='mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm'>
                {project.summary}
              </p>

              {/* Tags and Meta */}
              <div className='mt-auto pt-4'>
                {project.tags && project.tags.length > 0 && (
                  <div className='mb-3 flex flex-wrap gap-1.5'>
                    {project.tags.slice(0, 4).map(tag => (
                      <span
                        key={tag}
                        className='rounded-md border border-border/60 bg-muted/60 px-2 py-0.5 text-[0.68rem] font-medium text-muted-foreground'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {project.publishedAt && (
                  <div className='text-[0.72rem] font-mono text-muted-foreground'>
                    {formatDate(project.publishedAt)}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  )
}



