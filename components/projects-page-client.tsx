'use client'

import Projects from '@/components/projects'
import { ProjectMetadata } from '@/lib/projects'
import { useLanguage } from '@/lib/language-context'

export default function ProjectsPageClient({
  initialProjects
}: {
  initialProjects: ProjectMetadata[]
}) {
  const { t } = useLanguage()

  return (
    <section className='pb-24 pt-36 sm:pt-40'>
      <div className='container max-w-3xl px-4 sm:px-6'>
        <div className='mb-10'>
          <h1 className='font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
            {t('projects_page_title')}
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            {t('projects_page_sub')}
          </p>
        </div>
        <Projects projects={initialProjects} />
      </div>
    </section>
  )
}
