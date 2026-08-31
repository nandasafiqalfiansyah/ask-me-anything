'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'

type Certificate = {
  id: number
  title: string
  company: string
  issued_date: string
  certificate_url: string | null
  pdf_url: string | null
  description: string | null
  sort_order: number
}

const FALLBACK_CERTIFICATES: Certificate[] = [
  {
    id: 1,
    title: 'Bangkit Academy - Machine Learning Distinction Graduate',
    company: 'Google, GoTo, Traveloka',
    issued_date: '2024-01-15',
    certificate_url: 'https://bangkit.academy',
    pdf_url: null,
    description: 'Graduated with Distinction in the Machine Learning learning path led by Google, GoTo, and Traveloka.',
    sort_order: 1
  },
  {
    id: 2,
    title: 'Google Cloud Certified - Associate Cloud Engineer Preparation',
    company: 'Google Cloud Platform',
    issued_date: '2023-11-20',
    certificate_url: 'https://cloud.google.com/certification',
    pdf_url: null,
    description: 'Comprehensive specialization covering IAM, Compute Engine, Kubernetes Engine, and Cloud Storage architectures.',
    sort_order: 2
  },
  {
    id: 3,
    title: 'TensorFlow Developer Professional Specialization',
    company: 'DeepLearning.AI',
    issued_date: '2023-09-10',
    certificate_url: 'https://www.deeplearning.ai',
    pdf_url: null,
    description: 'Hands-on neural networks, Computer Vision with CNNs, Natural Language Processing with RNNs, and Time Series.',
    sort_order: 3
  },
  {
    id: 4,
    title: 'Menjadi Back-End Developer Expert',
    company: 'Dicoding Indonesia',
    issued_date: '2023-06-18',
    certificate_url: 'https://dicoding.com',
    pdf_url: null,
    description: 'Architecting scalable microservices, CI/CD pipelines, automated testing, caching with Redis, and message brokering with RabbitMQ.',
    sort_order: 4
  },
  {
    id: 5,
    title: 'Menjadi Front-End Web Developer Expert',
    company: 'Dicoding Indonesia',
    issued_date: '2023-04-05',
    certificate_url: 'https://dicoding.com',
    pdf_url: null,
    description: 'Progressive Web Apps (PWA), Web Accessibility (a11y), clean architecture, performance optimization, and End-to-End testing.',
    sort_order: 5
  },
  {
    id: 6,
    title: 'Architecting on AWS (Membangun Arsitektur Cloud)',
    company: 'Amazon Web Services (AWS)',
    issued_date: '2023-02-12',
    certificate_url: 'https://aws.amazon.com',
    pdf_url: null,
    description: 'Designing highly available, cost-effective, fault-tolerant, and scalable systems on AWS.',
    sort_order: 6
  }
]

export default function CertificateCatalog() {
  const { t, language } = useLanguage()
  const [certificates, setCertificates] = useState<Certificate[]>(FALLBACK_CERTIFICATES)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [groupByCompany, setGroupByCompany] = useState(true)

  useEffect(() => {
    async function loadCertificates() {
      if (!isSupabaseConfigured()) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .order('sort_order', { ascending: true })

        if (!error && data && data.length > 0) {
          setCertificates(data)
        }
      } catch (error) {
        console.error('Error fetching certificates:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCertificates()
  }, [])

  const openPreview = (cert: Certificate) => {
    setSelectedCertificate(cert)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedCertificate(null)
  }

  const groupedCertificates = certificates.reduce(
    (acc, cert) => {
      if (!acc[cert.company]) {
        acc[cert.company] = []
      }
      acc[cert.company].push(cert)
      return acc
    },
    {} as Record<string, Certificate[]>
  )

  const getCertificateVisual = (cert: Certificate) => {
    const companyLower = cert.company.toLowerCase()
    const titleLower = cert.title.toLowerCase()

    if (
      companyLower.includes('google') ||
      titleLower.includes('bangkit') ||
      titleLower.includes('cloud')
    ) {
      return {
        logo: '/Google__G__logo.svg',
        brandColor: 'from-blue-500/10 via-amber-500/10 to-red-500/10',
        badgeText: 'Google Cloud & AI'
      }
    }
    if (
      companyLower.includes('aws') ||
      companyLower.includes('amazon') ||
      titleLower.includes('aws')
    ) {
      return {
        logo: null,
        brandColor: 'from-amber-500/10 to-orange-500/10',
        badgeText: 'AWS Certification'
      }
    }
    if (companyLower.includes('dicoding') || titleLower.includes('dicoding')) {
      return {
        logo: null,
        brandColor: 'from-sky-500/10 to-indigo-500/10',
        badgeText: 'Dicoding Academy'
      }
    }
    if (
      companyLower.includes('deeplearning') ||
      titleLower.includes('deeplearning')
    ) {
      return {
        logo: null,
        brandColor: 'from-rose-500/10 to-purple-500/10',
        badgeText: 'DeepLearning.AI'
      }
    }
    return {
      logo: null,
      brandColor: 'from-primary/10 to-secondary/10',
      badgeText: cert.company
    }
  }

  const formatCertDate = (dateStr: string) => {
    const locale = language === 'id' ? 'id-ID' : language === 'ja' ? 'ja-JP' : 'en-US'
    return new Date(dateStr).toLocaleDateString(locale, {
      month: 'short',
      year: 'numeric'
    })
  }

  const CertificateCard = ({ cert }: { cert: Certificate }) => {
    const visual = getCertificateVisual(cert)
    const isDirectImage =
      cert.certificate_url &&
      /\.(jpg|jpeg|png|webp|avif|svg)($|\?)/i.test(cert.certificate_url)

    return (
      <div
        className='group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xs backdrop-blur-xs transition-all duration-300 hover:border-foreground/30 hover:bg-card hover:shadow-md cursor-pointer'
        onClick={() => openPreview(cert)}
      >
        {/* Certificate Image Preview */}
        <div className='relative h-44 w-full overflow-hidden border-b border-border/60 bg-muted/40 sm:h-48'>
          {isDirectImage ? (
            <Image
              src={cert.certificate_url!}
              alt={cert.title}
              fill
              className='object-cover object-center transition-transform duration-500 group-hover:scale-105'
            />
          ) : (
            <div
              className={`relative flex h-full w-full flex-col items-center justify-center p-6 bg-gradient-to-br ${visual.brandColor} transition-transform duration-500 group-hover:scale-105`}
            >
              {/* Certificate Inner Border Ornament */}
              <div className='absolute inset-2.5 rounded-lg border border-dashed border-border/80' />

              {visual.logo ? (
                <div className='relative z-10 mb-2 flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-background/90 p-2.5 shadow-xs'>
                  <Image
                    src={visual.logo}
                    alt={`${cert.company} logo`}
                    width={28}
                    height={28}
                    className='h-auto max-h-6 w-auto max-w-6 object-contain'
                  />
                </div>
              ) : (
                <div className='relative z-10 mb-2 flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-background/90 text-primary shadow-xs'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='h-6 w-6'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
              )}

              <span className='relative z-10 font-mono text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground'>
                {visual.badgeText}
              </span>
              <span className='relative z-10 mt-0.5 text-[0.62rem] text-muted-foreground/80'>
                {t('cert_verified_credential')}
              </span>
            </div>
          )}

          <div className='absolute inset-0 bg-gradient-to-t from-background/30 to-transparent' />
        </div>

        {/* Card Body */}
        <div className='flex flex-1 flex-col justify-between p-4 sm:p-5'>
          <div>
            <div className='flex items-start justify-between gap-2'>
              <span className='rounded-md border border-border/60 bg-muted/60 px-2 py-0.5 text-[0.68rem] font-medium text-muted-foreground'>
                {cert.company}
              </span>
              <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary'>
                {t('cert_verified')}
              </span>
            </div>

            <h3 className='mt-2.5 font-serif text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary'>
              {cert.title}
            </h3>
          </div>

          <div className='mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-[0.72rem] text-muted-foreground'>
            <span>
              {t('cert_issued')} {formatCertDate(cert.issued_date)}
            </span>
            <span className='inline-flex items-center gap-1 font-medium text-foreground transition-colors group-hover:text-primary'>
              <span>{t('cert_view')}</span>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5'
              >
                <path
                  fillRule='evenodd'
                  d='M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z'
                  clipRule='evenodd'
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className='pb-24 pt-36 sm:pt-40'>
      <div className='container max-w-3xl px-4 sm:px-6'>
        {/* Header */}
        <div className='mb-10'>
          <h1 className='font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
            {t('cert_catalog_title')}
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            {t('cert_catalog_sub')}
          </p>

          {/* Toggle View */}
          <div className='mt-6 flex items-center gap-3'>
            <span className='text-xs font-medium text-muted-foreground'>{t('cert_display_mode')}</span>
            <Button
              variant={groupByCompany ? 'default' : 'outline'}
              size='sm'
              className='h-8 text-xs'
              onClick={() => setGroupByCompany(!groupByCompany)}
            >
              {groupByCompany ? t('cert_grouped_company') : t('cert_list_all')}
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className='flex min-h-[400px] items-center justify-center'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary'></div>
              <p className='text-muted-foreground'>{t('cert_loading')}</p>
            </div>
          </div>
        ) : certificates.length > 0 ? (
          groupByCompany ? (
            // Grouped View
            <div className='space-y-12'>
              {Object.entries(groupedCertificates).map(([company, certs]) => (
                <div key={company}>
                  <h2 className='mb-6 border-b pb-2 text-2xl font-bold'>
                    {company}
                  </h2>
                  <div className='grid gap-6 sm:grid-cols-2'>
                    {certs.map(cert => (
                      <CertificateCard key={cert.id} cert={cert} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // All Certificates View
            <div className='grid gap-6 sm:grid-cols-2'>
              {certificates.map(cert => (
                <CertificateCard key={cert.id} cert={cert} />
              ))}
            </div>
          )
        ) : (
          <div className='flex min-h-[400px] items-center justify-center'>
            <div className='text-center'>
              <p className='mb-2 text-lg text-muted-foreground'>
                {t('cert_no_found')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Certificate Preview */}
      {showModal && selectedCertificate && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'
          onClick={closeModal}
        >
          <div
            className='relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-background shadow-2xl'
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className='absolute right-4 top-4 z-10 rounded-full bg-background/90 p-2 transition-colors hover:bg-background'
              onClick={closeModal}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>

            {/* Modal Content */}
            <div className='max-h-[90vh] overflow-y-auto'>
              {/* Certificate Preview */}
              <div className='relative max-h-[60vh] min-h-[400px] bg-muted'>
                {selectedCertificate.pdf_url ? (
                  <iframe
                    title={`${selectedCertificate.title} PDF preview`}
                    src={`${selectedCertificate.pdf_url}#toolbar=1`}
                    className='h-[70vh] w-full'
                  />
                ) : (
                  <div className='flex min-h-[400px] items-center justify-center'>
                    <p className='text-muted-foreground'>
                      {t('cert_no_preview')}
                    </p>
                  </div>
                )}
              </div>

              {/* Certificate Details */}
              <div className='space-y-4 p-6'>
                <div>
                  <h2 className='mb-2 text-2xl font-bold'>
                    {selectedCertificate.title}
                  </h2>
                  <p className='text-lg text-muted-foreground'>
                    {selectedCertificate.company}
                  </p>
                </div>

                <div className='flex flex-wrap gap-4 text-sm'>
                  <div>
                    <span className='font-medium'>{t('cert_issued')}:</span>{' '}
                    {formatCertDate(selectedCertificate.issued_date)}
                  </div>
                </div>

                {selectedCertificate.description && (
                  <div>
                    <h3 className='mb-2 font-semibold'>{t('cert_description')}</h3>
                    <p className='text-muted-foreground'>
                      {selectedCertificate.description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className='flex gap-3 border-t pt-4'>
                  {selectedCertificate.certificate_url && (
                    <Button asChild variant='default'>
                      <a
                        href={selectedCertificate.certificate_url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {t('cert_verify_btn')}
                      </a>
                    </Button>
                  )}
                  {selectedCertificate.pdf_url && (
                    <Button asChild variant='secondary'>
                      <a
                        href={selectedCertificate.pdf_url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {t('cert_view_pdf_btn')}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
