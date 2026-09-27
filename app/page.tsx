import { Suspense } from 'react'
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
import { ProjectsSkeleton, PostsSkeleton } from '@/components/skeletons'

export const dynamic = 'force-dynamic'

async function LazyRecentProjects() {
  const projects = await getProjects(6)
  return <RecentProjects initialProjects={projects} />
}

async function LazyRecentPosts() {
  const posts = await getPosts(3)
  return <RecentPosts initialPosts={posts} />
}

export default function Home() {
  return (
    <section className='relative pb-24 pt-32 sm:pt-36'>
      <div className='container relative z-10 max-w-3xl px-4 sm:px-6'>
        <Intro />
        <ExperienceLogos />
        <RecentWork />
        <RecentEdu />
        <RecentSkill />
        <Suspense fallback={<ProjectsSkeleton />}>
          <LazyRecentProjects />
        </Suspense>
        <Suspense fallback={<PostsSkeleton />}>
          <LazyRecentPosts />
        </Suspense>
        <NewsletterForm />
      </div>
    </section>
  )
}
