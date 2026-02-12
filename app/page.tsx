import Intro from '@/components/intro'
import NewsletterForm from '@/components/newsletter-form'
import RecentPosts from '@/components/recent-posts'
import RecentProjects from '@/components/recent-projects'
import RecentWork from '@/components/recent-work'
import RecentEdu from '@/components/recent-edu'
import RecentSkill from '@/components/recent-skill'
import ExperienceLogos from '@/components/experience-logos'
import ParticlesBackground from '@/components/particles-background'

export default function Home() {
  return (
    <section className='relative pb-24 pt-40'>
      {/* Gradient background overlays */}
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent' />
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent' />
      
      {/* Particles background effect */}
      <ParticlesBackground />
      
      <div className='container relative z-10 max-w-3xl'>
        <Intro />
        <ExperienceLogos />
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
