'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  }

  if (skills.length === 0) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className='pb-24'
    >
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='title mb-12 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent'
        >
          Tech Stack
        </motion.h2>
        <motion.div
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-50px' }}
          className='flex flex-wrap'
        >
          {skills.map((skill, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Badge className='m-1 cursor-default transition-transform hover:scale-110'>
                {skill}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
