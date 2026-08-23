'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

type Partner = {
  name: string
  label: string
}

const DEFAULT_PARTNERS: Partner[] = [
  { name: 'Google', label: 'Google Bangkit' },
  { name: 'GoTo', label: 'GoTo Group' },
  { name: 'Traveloka', label: 'Traveloka Academy' },
  { name: 'Dicoding', label: 'Dicoding Indonesia' },
  { name: 'UMPO', label: 'Univ. Muhammadiyah Ponorogo' },
  { name: 'GCP', label: 'Google Cloud Platform' },
  { name: 'TensorFlow', label: 'TensorFlow ML' },
  { name: 'Next.js', label: 'Vercel Ecosystem' }
]

export default function ExperienceLogos() {
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_PARTNERS)

  const fetchExperiences = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      return
    }

    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('title')
        .order('sort_order', { ascending: true })

      if (!error && data && data.length > 0) {
        const mapped = data.map(item => ({
          name: item.title,
          label: item.title
        }))
        setPartners(mapped)
      }
    } catch (err) {
      console.error('Error fetching partner logos:', err)
    }
  }, [])

  useEffect(() => {
    fetchExperiences()
  }, [fetchExperiences])

  const duplicated = [...partners, ...partners, ...partners]

  return (
    <section className='relative overflow-hidden pb-16 sm:pb-24'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className='mb-6 text-center'
      >
        <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
          Affiliated Programs & Ecosystems
        </p>
      </motion.div>

      <div className='pointer-events-none absolute left-0 top-10 z-10 h-20 w-16 bg-gradient-to-r from-background to-transparent sm:w-28' />
      <div className='pointer-events-none absolute right-0 top-10 z-10 h-20 w-16 bg-gradient-to-l from-background to-transparent sm:w-28' />

      <div className='flex overflow-hidden py-2'>
        <motion.div
          className='flex gap-4 sm:gap-6 whitespace-nowrap'
          animate={{
            x: ['0%', '-50%']
          }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 28,
            ease: 'linear'
          }}
        >
          {duplicated.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className='flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-4 py-2 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-xs transition-colors hover:border-foreground/30 hover:text-foreground'
            >
              <span className='h-1.5 w-1.5 rounded-full bg-primary/60' />
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

