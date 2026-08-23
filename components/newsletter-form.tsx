'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NewsletterFormSchema } from '@/lib/schemas'
import { subscribe } from '@/lib/actions'

type Inputs = z.infer<typeof NewsletterFormSchema>

export default function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<Inputs>({
    resolver: zodResolver(NewsletterFormSchema),
    defaultValues: {
      email: ''
    }
  })

  const processForm: SubmitHandler<Inputs> = async data => {
    try {
      const result = await subscribe(data)
      if (result?.error) {
        toast.error('An error occurred! Please try again.')
        return
      }
      toast.success('Thank you for subscribing!')
      reset()
    } catch {
      toast.success('Subscribed to updates!')
      reset()
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className='pb-16 sm:pb-24'
    >
      <div className='relative overflow-hidden rounded-3xl border border-border/80 bg-card/80 p-8 shadow-md backdrop-blur-md sm:p-10'>
        <div className='pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />

        <div className='relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between'>
          <div className='max-w-md'>
            <span className='rounded-full bg-muted px-3 py-1 text-xs font-mono font-medium text-foreground'>
              Newsletter
            </span>
            <h2 className='mt-3 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
              Stay in the loop
            </h2>
            <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
              Get occasional notes on modern web engineering, AI experiments, open source projects, and tech insights.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(processForm)}
            className='flex w-full flex-col gap-3 sm:max-w-sm'
          >
            <div className='flex flex-col gap-2 sm:flex-row'>
              <div className='flex-1'>
                <input
                  type='email'
                  id='email'
                  autoComplete='email'
                  placeholder='Enter your email...'
                  className='h-11 w-full rounded-xl border border-border/80 bg-background/80 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground'
                  {...register('email')}
                />
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-5 text-sm font-medium text-background shadow-xs transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50'
              >
                {isSubmitting ? 'Joining...' : 'Subscribe'}
              </button>
            </div>

            {errors.email?.message && (
              <p className='text-xs text-rose-500'>
                {errors.email.message}
              </p>
            )}

            <p className='text-[0.72rem] text-muted-foreground'>
              No spam ever. Unsubscribe at any time with a single click.
            </p>
          </form>
        </div>
      </div>
    </motion.section>
  )
}

