import Intro from '@/components/intro'
import NewsletterForm from '@/components/newsletter-form'
import RecentPosts from '@/components/recent-posts'
import RecentProjects from '@/components/recent-projects'
import RecentWork from '@/components/recent-work'
import RecentEdu from '@/components/recent-edu'
import RecentSkill from '@/components/recent-skill'

export default function Home() {
  return (
    <section className='pb-24 pt-40'>
      <div className='container max-w-3xl'>
        <Intro />
        <RecentWork />
        <RecentEdu />
        <RecentSkill />
        <RecentProjects />
        <RecentPosts />
        <NewsletterForm />
      </div>
    </section>
  )
}
