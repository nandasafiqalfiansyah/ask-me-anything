import Intro from '@/components/intro'
import NewsletterForm from '@/components/newsletter-form'
import RecentPosts from '@/components/recent-posts'
import RecentProjects from '@/components/recent-projects'
import RecentWork from '@/components/recent-work'
import RecentEdu from '@/components/recent-edu'
import RecentSkill from '@/components/recent-skill'
import ExperienceLogos from '@/components/experience-logos'
import { getProjects } from '@/lib/projects'
import { getPosts } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [projects, posts] = await Promise.all([
    getProjects(6),
    getPosts(3)
  ])

  return (
    <section className='relative pb-24 pt-32 sm:pt-36'>
      <div className='container relative z-10 max-w-3xl px-4 sm:px-6'>
        <Intro />
        <ExperienceLogos />
        <RecentWork />
        <RecentEdu />
        <RecentSkill />
        <RecentProjects initialProjects={projects} />
        <RecentPosts initialPosts={posts} />
        <NewsletterForm />
      </div>
    </section>
  )
}
