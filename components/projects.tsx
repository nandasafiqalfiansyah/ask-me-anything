'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { ProjectMetadata } from '@/lib/projects'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function Projects({
  projects
}: {
  projects: ProjectMetadata[]
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1]
      }
    }
  }

  return (
    <motion.ul
      variants={containerVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-100px' }}
      className='grid grid-cols-1 gap-8 sm:grid-cols-2'
    >
      {projects.map(project => (
        <motion.li
          key={project.slug}
          variants={itemVariants}
          className='group relative'
          whileHover={{ y: -8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Link href={`/projects/${project.slug}`}>
            {project.image && (
              <motion.div
                className='h-72 w-full overflow-hidden bg-muted sm:h-60'
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={project.image}
                  alt={project.title || ''}
                  fill
                  className='rounded-lg object-cover object-center transition-transform duration-500 group-hover:scale-105'
                />
              </motion.div>
            )}

            <motion.div
              className='absolute inset-[1px] rounded-lg bg-background/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100'
              initial={false}
            />

            <motion.div
              className='absolute inset-x-0 bottom-0 translate-y-2 px-6 py-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100'
              initial={false}
            >
              <h2 className='title line-clamp-1 text-xl no-underline'>
                {project.title}
              </h2>
              <p className='line-clamp-1 text-sm text-muted-foreground'>
                {project.summary}
              </p>
              {project.tags && (
                <div className='mb-1 mt-2 flex flex-wrap gap-0.5'>
                  {project.tags.map(tag => (
                    <Badge
                      key={tag}
                      className='text-xs font-normal'
                      variant='secondary'
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <p className='text-xs font-light text-muted-foreground'>
                {formatDate(project.publishedAt ?? '')}
              </p>
            </motion.div>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  )
}
