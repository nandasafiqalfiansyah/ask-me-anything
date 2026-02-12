'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import authorImage from '@/public/images/authors/ndav.png'

export default function Intro() {
  return (
    <section className='flex flex-col-reverse items-start gap-x-10 gap-y-4 pb-24 md:flex-row md:items-center'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='mt-2 flex-1 md:mt-0'
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='title no-underline'
        >
          Hey, I&#39;m Nanda Safiq.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='mt-3 font-light text-muted-foreground'
        >
          I&#39;m a software engineer based in East java, Indonesia. I&#39;m
          passionate about learning new technologies and sharing knowledge with
          others.
        </motion.p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        whileHover={{ scale: 1.03 }}
        className='relative'
      >
        <Image
          className='flex-1 rounded-lg grayscale transition-all duration-300 hover:grayscale-0'
          src={authorImage}
          alt='Nanda Safiq Alfiansyah'
          width={190}
          height={175}
          priority
        />
      </motion.div>
    </section>
  )
}
