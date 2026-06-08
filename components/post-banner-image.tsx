'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useState } from 'react'

interface PostBannerImageProps {
  src: string
  alt: string
}

export default function PostBannerImage({ src, alt }: PostBannerImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  const closeLightbox = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeLightbox])

  return (
    <>
      <div
        className='container mt-10 max-w-3xl sm:mt-12'
      >
        <div
          className='group/banner relative aspect-[2/1] cursor-pointer overflow-hidden rounded-lg border border-border/60 bg-muted'
          onClick={() => setIsOpen(true)}
        >
          <Image
            src={src}
            alt={alt}
            className='object-cover transition-transform duration-300 group-hover/banner:scale-[1.02]'
            fill
            priority
            sizes='(max-width: 768px) 100vw, 768px'
          />
          <div className='absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover/banner:bg-black/20'>
            <svg
              className='h-8 w-8 text-white opacity-0 transition-opacity duration-300 group-hover/banner:opacity-100'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6' />
            </svg>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className='absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20'
              aria-label='Close lightbox'
            >
              <Cross2Icon className='h-6 w-6' />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='relative max-h-[85vh] max-w-[90vw]'
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                width={1200}
                height={800}
                className='max-h-[85vh] w-auto rounded-lg object-contain'
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}