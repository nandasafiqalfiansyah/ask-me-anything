'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeToggle } from './theme-toggle'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const navItems = [
    { href: '/posts', label: 'Blog' },
    { href: '/certificate', label: 'Certificate' },
    { href: '/projects', label: 'Project' },
    { href: '/contact', label: 'Contact' },
    { href: 'https://docs.ndav.my.id', label: 'Docs' }
  ]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='fixed inset-x-0 top-0 z-50 bg-background/75 py-3 backdrop-blur-sm sm:py-6'
    >
      <nav className='container flex max-w-3xl items-center justify-between'>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Link href='/' className='font-serif text-xl font-bold sm:text-2xl'>
            NDAV
          </Link>
        </motion.div>

        <ul className='ml-2 hidden items-center gap-2 text-sm font-light text-muted-foreground sm:flex sm:gap-8'>
          {navItems.map((item, index) => (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
              className='relative transition-colors hover:text-foreground'
            >
              {item.href.startsWith('http') ? (
                <a href={item.href} target='_blank' rel='noopener noreferrer'>
                  {item.label}
                </a>
              ) : (
                <>
                  <Link href={item.href}>{item.label}</Link>
                  {pathname === item.href && (
                    <motion.div
                      layoutId='activeNav'
                      className='absolute -bottom-2 left-0 right-0 h-0.5 bg-foreground'
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30
                      }}
                    />
                  )}
                </>
              )}
            </motion.li>
          ))}
        </ul>

        <div className='flex items-center gap-2'>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <ThemeToggle />
          </motion.div>

          <ButtonMenu
            open={mobileOpen}
            onToggle={() => setMobileOpen(prev => !prev)}
          />
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className='container mt-2 sm:hidden'
          >
            <div className='rounded-xl border bg-background/95 p-2 shadow-lg backdrop-blur'>
              <ul className='flex flex-col gap-1 text-sm text-muted-foreground'>
                {navItems.map(item => (
                  <li key={item.href}>
                    {item.href.startsWith('http') ? (
                      <a
                        href={item.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block rounded-lg px-3 py-2 transition-colors hover:bg-muted hover:text-foreground'
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className={`block rounded-lg px-3 py-2 transition-colors hover:bg-muted hover:text-foreground ${
                          pathname === item.href
                            ? 'bg-muted text-foreground'
                            : ''
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

function ButtonMenu({
  open,
  onToggle
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      type='button'
      onClick={onToggle}
      aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={open}
      className='inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground sm:hidden'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='h-5 w-5'
      >
        {open ? (
          <>
            <line x1='18' y1='6' x2='6' y2='18' />
            <line x1='6' y1='6' x2='18' y2='18' />
          </>
        ) : (
          <>
            <line x1='3' y1='6' x2='21' y2='6' />
            <line x1='3' y1='12' x2='21' y2='12' />
            <line x1='3' y1='18' x2='21' y2='18' />
          </>
        )}
      </svg>
    </button>
  )
}
