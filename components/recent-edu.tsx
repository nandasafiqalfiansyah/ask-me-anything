import Link from 'next/link'

// Array of post data
const posts = [
  {
    title: 'Universitas Muhammadiyah Ponorogo',
    summary: 'Higher Education Institution in Ponorogo, East Java, Indonesia',
    publishedAt: '11-13-2024',
    logo: 'https://media.licdn.com/dms/image/v2/C560BAQFnc-z5aubSFw/company-logo_200_200/company-logo_200_200/0/1646043826382/universitas_muhammadiyah_ponorogo_logo?e=1739404800&v=beta&t=Foxvx4y7N2RVSVaKDiJe8gR6BQ8DoDQcW0rKf0eswsE',
    link: 'https://www.linkedin.com/school/universitas-muhammadiyah-ponorogo'
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

export default function RecentEdu() {
  return (
    <section className='pb-24'>
      <div>
        <h2 className='mb-12 text-3xl font-bold'>Education</h2>

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
          <span>All Education Experience</span>
        </Link>
      </div>
    </section>
  )
}
