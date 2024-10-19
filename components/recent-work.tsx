import Link from 'next/link'

// Array of post data
const posts = [
  {
    title: 'Software Engineer',
    summary:
      'Worked on the Google Search team to improve search results for users.',
    publishedAt: '2020-06-01',
    logo: 'https://media.licdn.com/dms/image/v2/C560BAQEVREspL4ipDQ/company-logo_100_100/company-logo_100_100/0/1630661916225/bangkit_academy_logo?e=1737590400&v=beta&t=wynG8aNPeWscmfCtqIUjnGDZVDRI0pDLh-s1Mtngbak',
    link: 'https://www.linkedin.com/company/bangkit-academy/'
  },
  {
    title: 'Software Engineer',
    summary:
      'Worked on the Google Search team to improve search results for users.',
    publishedAt: '2020-06-01',
    logo: 'https://media.licdn.com/dms/image/v2/C560BAQEVREspL4ipDQ/company-logo_100_100/company-logo_100_100/0/1630661916225/bangkit_academy_logo?e=1737590400&v=beta&t=wynG8aNPeWscmfCtqIUjnGDZVDRI0pDLh-s1Mtngbak',
    link: 'https://www.linkedin.com/company/bangkit-academy/'
  },
  {
    title: 'Software Engineer',
    summary:
      'Worked on the Google Search team to improve search results for users.',
    publishedAt: '2020-06-01',
    logo: 'https://media.licdn.com/dms/image/v2/C560BAQEVREspL4ipDQ/company-logo_100_100/company-logo_100_100/0/1630661916225/bangkit_academy_logo?e=1737590400&v=beta&t=wynG8aNPeWscmfCtqIUjnGDZVDRI0pDLh-s1Mtngbak',
    link: 'https://www.linkedin.com/company/bangkit-academy/'
  }
]

// Utility function to format date
function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

export default function RecentWork() {
  return (
    <section className='pb-24'>
      <div>
        <h2 className='mb-12 text-3xl font-bold'>Work Experience</h2>

        <ul className='flex flex-col gap-8'>
          {posts.map(post => (
            <li key={post.link} className='flex items-center justify-between'>
              <Link href={post.link} className='flex items-center gap-6'>
                <img
                  src={post.logo}
                  alt={`${post.title} logo`}
                  className='h-16 w-16 flex-shrink-0 object-contain' // Lebar dan tinggi tetap
                />
                <div className='max-w-lg'>
                  <p className='text-lg font-semibold'>{post.title}</p>
                  <p className='mt-1 text-sm font-light text-muted-foreground'>
                    {post.summary}
                  </p>
                </div>
              </Link>
              {post.publishedAt && (
                <p className='whitespace-nowrap text-sm font-light'>
                  {formatDate(post.publishedAt)}
                </p>
              )}
            </li>
          ))}
        </ul>
        <Link
          href='/'
          className='mt-8 inline-flex items-center gap-2 text-muted-foreground underline decoration-1 underline-offset-2 transition-colors hover:text-foreground'
        >
          <span>All Work Experience</span>
        </Link>
      </div>
    </section>
  )
}
