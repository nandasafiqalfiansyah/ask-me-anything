'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { StatCard } from '@/components/ui/StatCard'

export function OverviewDummy() {
  const [totalUsers, setTotalUsers] = useState<number | string>('—')
  const [totalSkills, setTotalSkills] = useState<number | string>('—')

  useEffect(() => {
    const fetchStats = async () => {
      const { count, error } = await supabase
        .from('skills')
        .select('*', { count: 'exact', head: true })
      if (!error && count !== null) {
        setTotalSkills(count)
      }
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (userCount !== null) {
        setTotalUsers(userCount)
      } else {
        setTotalUsers('—')
      }
    }

    fetchStats()
  }, [])

  return (
    <div className='rounded-2xl border p-6'>
      <h3 className='mb-2 text-lg font-semibold'>Overview</h3>
      <p className='text-sm text-muted-foreground'>
        Statistik live dari Supabase (users & skills).
      </p>
      <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard label='Total Users' value={String(totalUsers)} />
        <StatCard label='Total Skills' value={String(totalSkills)} />
        <StatCard label='Active Sessions' value='—' />
        <StatCard label='Errors (24h)' value='—' />
      </div>
    </div>
  )
}
