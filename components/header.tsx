'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ThemeToggle } from './theme-toggle'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: '/posts', label: 'Blog' },
    { href: '/certificate', label: 'Certificate' },
    { href: '/projects', label: 'Project' },
    { href: '/contact', label: 'Contact' }
  ]

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className='fixed inset-x-0 top-0 z-50 bg-background/75 py-6 backdrop-blur-sm'
    >
      <nav className='container flex max-w-3xl items-center justify-between'>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Link href='/' className='font-serif text-2xl font-bold'>
            NDAV
          </Link>
        </motion.div>

        <ul className='ml-2 flex items-center gap-2 text-sm font-light text-muted-foreground sm:gap-8'>
          {navItems.map((item, index) => (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className='relative transition-colors hover:text-foreground'
            >
              <Link href={item.href}>{item.label}</Link>
              {pathname === item.href && (
                <motion.div
                  layoutId='activeNav'
                  className='absolute -bottom-2 left-0 right-0 h-0.5 bg-foreground'
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.li>
          ))}
        </ul>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <ThemeToggle />
        </motion.div>
      </nav>
    </motion.header>
  )
}
