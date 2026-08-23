import Projects from '@/components/projects'
import { getProjects } from '@/lib/projects'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <section className='pb-24 pt-36 sm:pt-40'>
      <div className='container max-w-3xl px-4 sm:px-6'>
        <div className='mb-10'>
          <h1 className='font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
            Projects & Experiments
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            A collection of web applications, AI tools, full-stack systems, and open-source packages.
          </p>
        </div>
        <Projects projects={projects} />
      </div>
    </section>
  )
}
