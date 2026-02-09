'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { getProjects } from '@/lib/projects'
import Projects from '@/components/projects'
import { use } from 'react'

export default function RecentProjects() {
  const projects = use(getProjects(2))

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
          className='title mb-12'
        >
          Recent projects
        </motion.h2>
        <Projects projects={projects} />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            href='/projects'
            className='mt-8 inline-flex items-center gap-2 text-muted-foreground underline decoration-1 underline-offset-2 transition-colors hover:text-foreground'
          >
            <span>All projects</span>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}
