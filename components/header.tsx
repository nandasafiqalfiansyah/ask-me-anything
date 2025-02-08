import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { Project } from '../lib/projects'

export default function Header() {
  return (
    <header className='fixed inset-x-0 top-0 z-50 bg-background/75 py-6 backdrop-blur-sm'>
      <nav className='container flex max-w-3xl items-center justify-between'>
        <div>
          <Link href='/' className='font-serif text-2xl font-bold'>
            NDAV
          </Link>
        </div>

        <ul className='ml-2 flex items-center gap-2 text-sm font-light text-muted-foreground sm:gap-8'>
          <li className='transition-colors hover:text-foreground'>
            <Link href='/posts'>Blog</Link>
          </li>
          <li className='transition-colors hover:text-foreground'>
            <Link href='/certificate'>Certificate</Link>
          </li>
          <li className='transition-colors hover:text-foreground'>
            <Link href='/projects'>Project</Link>
          </li>
          <li className='transition-colors hover:text-foreground'>
            <Link href='/contact'>Contact</Link>
          </li>
        </ul>
        <div>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
