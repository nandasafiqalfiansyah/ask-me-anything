import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'

export default function Header() {
  return (
    <header className='fixed inset-x-0 top-0 z-50 bg-background/75 py-6 backdrop-blur-sm'>
      <nav className='container flex max-w-3xl items-center justify-between'>
        <div>
          <Link href='/' className='font-serif text-2xl font-bold'>
            NDAV
          </Link>
        </div>

        <ul className='flex items-center gap-3 text-sm font-light text-muted-foreground sm:gap-8'>
          <li className='transition-colors hover:text-foreground'>
            <Link href='/posts'>Blog</Link>
          </li>
          <li className='transition-colors hover:text-foreground'>
            <Link href='https://lynk.id/nandasafiqalfiansyah' target='_blank'>
              Books
            </Link>
          </li>
          <li className='transition-colors hover:text-foreground'>
            <Link href='/projects'>Projects</Link>
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
