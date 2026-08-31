'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { ArrowUpRight, Sparkles, Code2, Layers } from 'lucide-react'
import { ProjectMetadata } from '@/lib/projects'
import { formatDate } from '@/lib/utils'

export default function Projects({
  projects
}: {
  projects: ProjectMetadata[]
}) {
  const [selectedTag, setSelectedTag] = useState<string>('All')

  // Extract unique popular tags for filtering
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>()
    projects.forEach(p => {
      p.tags?.forEach(t => tagsSet.add(t))
    })
    return ['All', ...Array.from(tagsSet).slice(0, 5)]
  }, [projects])

  const filteredProjects = useMemo(() => {
    if (selectedTag === 'All') return projects
    return projects.filter(p => p.tags?.includes(selectedTag))
  }, [projects, selectedTag])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: 'easeOut'
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
    <div className='space-y-6'>
      {/* Category / Stack Quick Filter for Recruiters */}
      {allTags.length > 2 && (
        <div className='flex flex-wrap items-center gap-1.5'>
          {allTags.map(tag => (
            <button
              key={tag}
              type='button'
              onClick={() => setSelectedTag(tag)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-foreground text-background shadow-xs'
                  : 'border border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Projects Grid */}
      <motion.ul
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='grid grid-cols-1 gap-6 sm:grid-cols-2'
      >
        <AnimatePresence mode='popLayout'>
          {filteredProjects.map(project => (
            <motion.li
              key={project.slug}
              layout
              variants={itemVariants}
              initial='hidden'
              animate='visible'
              exit={{ opacity: 0, scale: 0.95 }}
              className='group'
            >
              <Link
                href={`/projects/${project.slug}`}
                className='flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs transition-all duration-300 hover:border-foreground/30 hover:shadow-md'
              >
                {/* Image Preview with overlay */}
                <div className='relative h-48 w-full overflow-hidden bg-muted sm:h-52'>
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.title || 'Project preview'}
                      fill
                      className='object-cover object-center transition-transform duration-500 group-hover:scale-103'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center bg-muted text-xs font-mono text-muted-foreground'>
                      NDAV Engineering
                    </div>
                  )}

                  {/* Top pill for award/highlight if applicable */}
                  {project.title?.toLowerCase().includes('anak') && (
                    <div className='absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-amber-500/90 px-2 py-0.5 text-[0.68rem] font-semibold text-white shadow-xs backdrop-blur-xs'>
                      <Sparkles className='h-3 w-3' />
                      <span>Competition Winner</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className='flex flex-1 flex-col p-5'>
                  <div className='flex items-center justify-between gap-2'>
                    <h3 className='font-serif text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg'>
                      {project.title}
                    </h3>
                    <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-all duration-200 group-hover:border-foreground/20 group-hover:bg-foreground group-hover:text-background'>
                      <ArrowUpRight className='h-4 w-4' />
                    </div>
                  </div>

                  <p className='mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm'>
                    {project.summary}
                  </p>

                  {/* Tech Stack Chips */}
                  <div className='mt-auto pt-5'>
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
                        {project.tags.length > 4 && (
                          <span className='rounded-md border border-border/40 bg-muted/30 px-1.5 py-0.5 text-[0.65rem] text-muted-foreground'>
                            +{project.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <div className='flex items-center justify-between text-[0.72rem] text-muted-foreground pt-1 border-t border-border/40'>
                      <span className='font-mono'>
                        {project.publishedAt ? formatDate(project.publishedAt) : 'Featured Project'}
                      </span>
                      <span className='font-medium text-foreground transition-colors group-hover:underline'>
                        Read Case Study &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  )
}




