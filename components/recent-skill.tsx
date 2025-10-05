'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Badge } from '@/components/ui/badge'

export default function RecentSkill() {
  const [skills, setSkills] = useState<string[]>([])

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('name')
      .order('id')

    if (!error && data) {
      setSkills(data.map(item => item.name))
    }
  }

  return (
    <section className='pb-24'>
      <div>
        <h2 className='title mb-12'>Tech Stack</h2>
        <div className='flex flex-wrap'>
          {skills.map((skill, index) => (
            <Badge key={index} className='m-1'>
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}
