import Projects from '@/components/projects'
import { getProjects } from '@/lib/projects'
import { getPageViewCount } from '@/lib/pageViews'
import PageViewCounter from '@/components/page-view-counter'

export default async function ProjectsPage() {
  const projects = await getProjects()
  const initialViewCount = await getPageViewCount('projects')

  return (
    <section className='pb-24 pt-40'>
      <div className='container max-w-3xl'>
        <h1 className='title mb-12'>Projects</h1>
        <PageViewCounter
          pageKey='projects'
          initialCount={initialViewCount}
          className='-mt-8 mb-8 text-sm text-muted-foreground'
        />
        <Projects projects={projects} />
      </div>
    </section>
  )
}
