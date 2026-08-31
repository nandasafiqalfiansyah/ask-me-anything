import Link from 'next/link'
import { getProjects } from '@/lib/projects'
import Projects from '@/components/projects'
import { MotionWrapper } from '@/components/motion-wrapper'

export default async function RecentProjects() {
  const projects = await getProjects(6)

  return (
    <section id='featured-projects' className='scroll-mt-24 pb-16 sm:pb-24'>
      <MotionWrapper delay={0.2}>
        <div className='flex items-end justify-between gap-4 pb-8'>
          <div>
            <div className='inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[0.7rem] font-medium text-primary mb-2'>
              <span>Selected Portfolio</span>
            </div>
            <h2 className='font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
              Featured Engineering Projects
            </h2>
            <p className='mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm'>
              Production-ready web applications, AI models, and award-winning software architectures.
            </p>
          </div>

          <Link
            href='/projects'
            className='hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground'
          >
            <span>All Projects ({projects.length})</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='h-3.5 w-3.5'
            >
              <path
                fillRule='evenodd'
                d='M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z'
                clipRule='evenodd'
              />
            </svg>
          </Link>
        </div>

        <Projects projects={projects} />

        <div className='mt-8 sm:hidden'>
          <Link
            href='/projects'
            className='inline-flex items-center gap-2 text-xs font-medium text-muted-foreground underline decoration-1 underline-offset-2 transition-colors hover:text-foreground'
          >
            <span>View All Projects ({projects.length})</span>
          </Link>
        </div>
      </MotionWrapper>
    </section>
  )
}


