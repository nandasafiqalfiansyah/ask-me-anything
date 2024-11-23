import Link from 'next/link'

// Array of post data
const posts = [
  {
    title: 'Lintasarta Cloudeka Digischool 2023',
    summary:
      'Contributed to team-based final projects, demonstrating proficiency in cloud computing concepts',
    publishedAt: '2020-06-01',
    logo: 'https://media.licdn.com/dms/image/C560BAQEuItk7F_3JPQ/company-logo_200_200/0/1630645857701/lintasartacloudeka_logo?e=2147483647&v=beta&t=IdNaLjKgzVCTi4-BKH5Guud4VlRqjkRKrKarPgB9954',
    link: 'https://www.linkedin.com/company/bangkit-academy/'
  },
  {
    title: 'Bangkit Academy 2023',
    summary:
      'Contributed to team-based final projects, demonstrating proficiency in cloud computing concepts',
    publishedAt: '2020-06-01',
    logo: 'https://media.licdn.com/dms/image/v2/C560BAQEVREspL4ipDQ/company-logo_100_100/company-logo_100_100/0/1630661916225/bangkit_academy_logo?e=1737590400&v=beta&t=wynG8aNPeWscmfCtqIUjnGDZVDRI0pDLh-s1Mtngbak',
    link: 'https://www.linkedin.com/company/bangkit-academy/'
  },
  {
    title: 'Student Internship Kariermu',
    summary: 'Learning to be a proficient receptionist for customers.',
    publishedAt: '2020-06-01',
    logo: 'https://cdn.sekolah.mu/upload/branding--4df889fc3ca549f692d8f354b155b1561644804821.png',
    link: 'https://www.linkedin.com/company/bangkit-academy/'
  },
  {
    title: 'Ponorogo District Government Development Administration Section',
    summary:
      'During a 3-month internship, I served as a full-stack developer for the Ponorogo District Development',
    publishedAt: '2023-08-01',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Lambang_Kabupaten_Ponorogo.png',
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
        <h2 className='mb-12 text-center text-3xl font-bold md:text-left'>
          Experience
        </h2>

        <ul className='flex flex-col gap-8'>
          {posts.map(post => (
            <li
              key={post.link}
              className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'
            >
              {/* Main Content */}
              <div className='flex flex-col gap-4 md:flex-row md:items-center md:gap-6'>
                <img
                  src={post.logo}
                  alt={`${post.title} logo`}
                  className='h-16 w-16 flex-shrink-0 object-contain md:h-20 md:w-20'
                />
                <div>
                  <p className='text-lg font-semibold'>{post.title}</p>
                  <p className='mt-1 text-sm font-light text-muted-foreground'>
                    {post.summary}
                  </p>
                </div>
              </div>

              {/* Date */}
              {post.publishedAt && (
                <p className='text-sm font-light text-gray-500 md:text-right'>
                  {formatDate(post.publishedAt)}
                </p>
              )}
            </li>
          ))}
        </ul>

        <div className='mt-8 text-center md:text-left'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline decoration-1 underline-offset-2 transition-colors hover:text-foreground'
          >
            <span>All Work Experience</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
