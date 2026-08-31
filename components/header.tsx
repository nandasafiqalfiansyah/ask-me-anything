'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeToggle } from './theme-toggle'
import { LanguageSwitcher } from './language-switcher'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import MacLogo from './mac-logo'
import { useLanguage } from '@/lib/language-context'

export default function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '/', label: t('nav_home') },
    { href: '/projects', label: t('nav_projects') },
    { href: '/posts', label: t('nav_blog') },
    { href: '/certificate', label: t('nav_certificates') },
    { href: '/contact', label: t('nav_contact') }
  ]

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border/50 bg-background/80 py-3 backdrop-blur-xl shadow-xs'
          : 'bg-transparent py-5'
      }`}
    >
      <nav className='container flex max-w-3xl items-center justify-between px-4 sm:px-6'>
        {/* Brand Logo with macOS Style App Icon */}
        <Link
          href='/'
          className='group flex items-center gap-3 tracking-tight text-foreground transition-transform active:scale-95'
        >
          <MacLogo size='sm' interactive={false} />
          <span className='font-serif text-base sm:text-lg font-bold tracking-tight'>
            NDAV
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1.5 shadow-xs backdrop-blur-md md:flex'>
          {navItems.map(item => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId='activePill'
                    className='absolute inset-0 rounded-full bg-muted'
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30
                    }}
                  />
                )}
                <span className='relative z-10'>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right Action Icons */}
        <div className='flex items-center gap-1.5 sm:gap-2'>
          <LanguageSwitcher />
          <ThemeToggle />

          <ButtonMenu
            open={mobileOpen}
            onToggle={() => setMobileOpen(prev => !prev)}
          />
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className='container mt-2 max-w-3xl px-4 md:hidden'
          >
            <div className='rounded-2xl border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-xl'>
              <ul className='flex flex-col gap-1 text-sm'>
                {navItems.map(item => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between rounded-xl px-4 py-2.5 font-medium transition-colors ${
                          isActive
                            ? 'bg-muted text-foreground font-semibold'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive && (
                          <span className='h-1.5 w-1.5 rounded-full bg-primary' />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
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
      className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-background text-foreground transition-transform active:scale-90 md:hidden'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='h-4 w-4'
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

