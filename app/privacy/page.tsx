'use client'

import { useLanguage } from '@/lib/language-context'

export default function PrivacyPage() {
  const { t } = useLanguage()

  return (
    <div className='py-6 pb-24 pt-40'>
      <div className='container grid max-w-2xl gap-10 px-4 md:px-6 lg:gap-16 xl:max-w-3xl xl:gap-20'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl'>
            {t('privacy_title')}
          </h1>
          <p className='text-gray-500 dark:text-gray-400'>
            {t('privacy_updated')}
          </p>
        </div>
        <div className='space-y-6'>
          <div className='space-y-3'>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('privacy_sec1_title')}
            </h2>
            <p className='text-gray-500 dark:text-gray-400'>
              {t('privacy_sec1_desc')}
            </p>
          </div>
          <div className='space-y-3'>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('privacy_sec2_title')}
            </h2>
            <p className='text-gray-500 dark:text-gray-400'>
              {t('privacy_sec2_desc')}
            </p>
            <ul className='list-inside list-disc space-y-1 text-sm text-gray-500 dark:text-gray-400'>
              <li>{t('privacy_sec2_li1')}</li>
              <li>{t('privacy_sec2_li2')}</li>
              <li>{t('privacy_sec2_li3')}</li>
            </ul>
          </div>
          <div className='space-y-3'>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('privacy_sec3_title')}
            </h2>
            <p className='text-gray-500 dark:text-gray-400'>
              {t('privacy_sec3_desc')}
            </p>
          </div>
          <div className='space-y-3'>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('privacy_sec4_title')}
            </h2>
            <p className='text-gray-500 dark:text-gray-400'>
              {t('privacy_sec4_desc')}
            </p>
          </div>
          <div className='space-y-3'>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('privacy_sec5_title')}
            </h2>
            <p className='text-gray-500 dark:text-gray-400'>
              {t('privacy_sec5_desc')}
            </p>
          </div>
          <div className='space-y-3'>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('privacy_sec6_title')}
            </h2>
            <p className='text-gray-500 dark:text-gray-400'>
              {t('privacy_sec6_desc')}
            </p>
          </div>
          <div className='space-y-3'>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('privacy_sec7_title')}
            </h2>
            <p className='text-gray-500 dark:text-gray-400'>
              {t('privacy_sec7_desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
