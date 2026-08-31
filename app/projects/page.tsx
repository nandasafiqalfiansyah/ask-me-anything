import { getProjects } from '@/lib/projects'
import ProjectsPageClient from '@/components/projects-page-client'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const projects = await getProjects()

  return <ProjectsPageClient initialProjects={projects} />
}
