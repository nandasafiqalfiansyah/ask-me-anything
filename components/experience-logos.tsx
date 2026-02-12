'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Experience = {
  id: number
  title: string
  logo_url: string | null
}

export default function ExperienceLogos() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    const { data, error } = await supabase
      .from('experiences')
      .select('id, title, logo_url')
      .order('sort_order', { ascending: true })

    if (!error && data) {
      const experiencesWithLogos = data.filter(
        (exp) => exp.logo_url
      ) as Experience[]
      setExperiences(experiencesWithLogos)
    }
    setLoading(false)
  }

  if (loading || experiences.length === 0) {
    return null
  }

  // Duplicate the logos for seamless infinite scroll
  const duplicatedLogos = [...experiences, ...experiences, ...experiences]

  return (
    <section className='relative overflow-hidden pb-24'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className='mb-8 text-center'
      >
        <h2 className='title text-3xl font-bold sm:text-4xl bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent'>
          Experience & Partnerships
        </h2>
        <p className='mt-3 text-sm font-light text-muted-foreground'>
          Companies and organizations I&apos;ve worked with
        </p>
      </motion.div>

      {/* Gradient overlays for fade effect */}
      <div className='pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-background to-transparent' />
      <div className='pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-background to-transparent' />

      {/* Scrolling container */}
      <div className='relative flex overflow-hidden'>
        <motion.div
          className='flex gap-12 whitespace-nowrap'
          animate={{
            x: [0, -100 * experiences.length]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 20 + experiences.length * 2,
              ease: 'linear'
            }
          }}
        >
          {duplicatedLogos.map((experience, index) => (
            <motion.div
              key={`${experience.id}-${index}`}
              className='flex items-center justify-center'
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={experience.logo_url!}
                alt={experience.title}
                className='h-16 w-auto object-contain grayscale transition-all duration-300 hover:grayscale-0 sm:h-20'
                style={{ minWidth: '80px', maxWidth: '150px' }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
