'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import CrudSkills from '@/components/crud-skills'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else setUser(data.session.user)
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return <div>Loading...</div>

  return (
    <section className='pb-24 pt-40'>
      <div className='container mx-auto flex max-w-3xl flex-col gap-6'>
        {/* Header */}
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl font-bold'>Dashboard Admin</h1>
          <p>Welcome, {user.email}</p>
        </div>

        {/* Logout Button */}
        <Button
          className='flex w-max items-center gap-2 disabled:opacity-50'
          onClick={handleLogout}
        >
          Logout
        </Button>

        {/* CRUD Skills */}
        <CrudSkills />
      </div>
    </section>
  )
}
