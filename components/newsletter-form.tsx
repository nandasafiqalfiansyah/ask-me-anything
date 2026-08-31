'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NewsletterFormSchema } from '@/lib/schemas'
import { subscribe } from '@/lib/actions'
import { useLanguage } from '@/lib/language-context'

type Inputs = z.infer<typeof NewsletterFormSchema>

export default function NewsletterForm() {
  const { t } = useLanguage()
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
        toast.error(t('newsletter_error'))
        return
      }
      toast.success(t('newsletter_success'))
      reset()
    } catch {
      toast.success(t('newsletter_success'))
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
              {t('newsletter_badge')}
            </span>
            <h2 className='mt-3 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
              {t('newsletter_title')}
            </h2>
            <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
              {t('newsletter_sub')}
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
                  placeholder={t('newsletter_placeholder')}
                  className='h-11 w-full rounded-xl border border-border/80 bg-background/80 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground'
                  {...register('email')}
                />
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background shadow-xs transition-all hover:opacity-90 active:scale-95 disabled:opacity-50'
              >
                {isSubmitting && (
                  <svg
                    className='h-4 w-4 animate-spin text-current'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                )}
                <span>{isSubmitting ? t('newsletter_btn_submitting') : t('newsletter_btn_subscribe')}</span>
              </button>
            </div>

            {errors.email?.message && (
              <p className='text-xs text-rose-500'>
                {errors.email.message}
              </p>
            )}

            <p className='text-[0.72rem] text-muted-foreground'>
              {t('newsletter_disclaimer')}
            </p>
          </form>
        </div>
      </div>
    </motion.section>
  )
}
