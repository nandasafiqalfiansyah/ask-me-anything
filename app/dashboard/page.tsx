'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { Button } from '@/components/ui/button'
import CrudSkills from '@/components/crud-skills'
import { OverviewDummy } from '@/components/crud-overview'

type PageKey = 'overview' | 'skills' | 'users' | 'settings'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [active, setActive] = useState<PageKey>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else {
        setUser(data.session.user)
        setLoading(false)
      }
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems: { key: PageKey; label: string }[] = useMemo(
    () => [
      { key: 'overview', label: 'Overview' },
      { key: 'skills', label: 'Skills' },
      { key: 'users', label: 'Users' },
      { key: 'settings', label: 'Settings' }
    ],
    []
  )

  if (loading || !user) {
    return (
      <div className='flex h-[60vh] items-center justify-center text-sm text-muted-foreground'>
        Loading dashboard...
      </div>
    )
  }

  return (
    <section className='pb-24 pt-40'>
      <div className='container flex max-w-3xl flex-col'>
        {/* Top Bar */}
        <div className='mb-6 flex items-center justify-between gap-4'>
          <div className='space-y-1'>
            <h2 className='title text-left text-xl font-bold sm:text-3xl'>
              Dashboard Admin
            </h2>
            <p className='text-sm text-muted-foreground'>
              Welcome, {user.email}
            </p>
          </div>
          <Button
            className='gap-2 disabled:opacity-50'
            onClick={handleLogout}
            variant='secondary'
          >
            Logout
          </Button>
        </div>

        {/* Swap-able Top Nav */}
        <div className='sticky top-16 z-10 mb-6 overflow-x-auto rounded-xl border bg-background/70 backdrop-blur'>
          <div className='flex w-full items-center justify-between gap-2 p-2'>
            <div className='flex items-center gap-1'>
              {navItems.map(item => {
                const isActive = active === item.key
                return (
                  <Button
                    key={item.key}
                    variant={isActive ? 'default' : 'ghost'}
                    className={`rounded-lg px-4 ${isActive ? '' : 'text-muted-foreground'}`}
                    onClick={() => setActive(item.key)}
                  >
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </div>
          {/* active underline */}
          <div className='h-px w-full bg-border' />
        </div>

        {/* Page Container */}
        <div className='mx-auto grid max-w-5xl gap-6'>
          {active === 'overview' && <OverviewDummy />}

          {active === 'skills' && (
            <div className='rounded-2xl border p-6'>
              <CrudSkills />
            </div>
          )}

          {active === 'users' && <UsersDummy />}

          {active === 'settings' && <SettingsDummy />}
        </div>
      </div>
    </section>
  )
}

/* =========================
   Dummy Pages (swap target)
   ========================= */

function UsersDummy() {
  return (
    <div className='rounded-2xl border p-6'>
      <h3 className='mb-2 text-lg font-semibold'>Users</h3>
      <p className='text-sm text-muted-foreground'>
        Dummy list user di sini. Nanti sambung ke tabel <code>profiles</code>{' '}
        atau semacamnya.
      </p>
      <div className='mt-4 space-y-2 text-sm'>
        <div className='rounded-lg border p-3'>User A — a@example.com</div>
        <div className='rounded-lg border p-3'>User B — b@example.com</div>
        <div className='rounded-lg border p-3'>User C — c@example.com</div>
      </div>
    </div>
  )
}

function SettingsDummy() {
  return (
    <div className='rounded-2xl border p-6'>
      <h3 className='mb-2 text-lg font-semibold'>Settings</h3>
      <p className='text-sm text-muted-foreground'>
        Dummy settings. Tar lo isi toggle theme, profile, API keys, dsb.
      </p>
      <div className='mt-4 grid gap-3'>
        <div className='flex items-center justify-between rounded-lg border p-3'>
          <span className='text-sm'>Dark Mode</span>
          <span className='text-xs text-muted-foreground'>coming soon</span>
        </div>
        <div className='flex items-center justify-between rounded-lg border p-3'>
          <span className='text-sm'>2FA</span>
          <span className='text-xs text-muted-foreground'>coming soon</span>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl border p-4'>
      <div className='text-xs uppercase text-muted-foreground'>{label}</div>
      <div className='mt-1 text-2xl font-semibold'>{value}</div>
    </div>
  )
}
