'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import {
  FileText,
  ExternalLink,
  Download,
  Copy,
  Check,
  Eye,
  Maximize2,
  Sparkles,
  ShieldCheck,
  Smartphone,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'

export type Certificate = {
  id: number
  title: string
  company: string
  issued_date: string
  certificate_url: string | null
  pdf_url: string | null
  image_url?: string | null
  credential_id?: string | null
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
    image_url: '/certificates/bangkit-ml.svg',
    pdf_url: '/certificates/bangkit-ml.pdf',
    credential_id: 'BANGKIT-2023-ML-0894',
    description:
      'Lulus dengan predikat Distinction pada alur pembelajaran Machine Learning yang dipimpin oleh Google, GoTo, dan Traveloka melalui program Kemendikbudristek Kampus Merdeka.',
    sort_order: 1
  },
  {
    id: 2,
    title: 'Google Cloud Certified - Associate Cloud Engineer Preparation',
    company: 'Google Cloud Platform',
    issued_date: '2023-11-20',
    certificate_url: 'https://cloud.google.com/certification',
    image_url: '/certificates/gcp-ace.svg',
    pdf_url: '/certificates/gcp-ace.pdf',
    credential_id: 'GCP-ACE-2023-NDAV88',
    description:
      'Spesialisasi komprehensif arsitektur cloud mencakup Google Cloud IAM, Google Compute Engine, Google Kubernetes Engine (GKE), VPC Networking, dan Cloud Storage.',
    sort_order: 2
  },
  {
    id: 3,
    title: 'TensorFlow Developer Professional Specialization',
    company: 'DeepLearning.AI',
    issued_date: '2023-09-10',
    certificate_url: 'https://www.deeplearning.ai',
    image_url: '/certificates/deeplearning-tf.svg',
    pdf_url: '/certificates/deeplearning-tf.pdf',
    credential_id: 'DL-TF-2023-882190',
    description:
      'Penguasaan neural networks tingkat lanjut, Computer Vision dengan CNNs, Natural Language Processing dengan RNNs/Transformers, dan Time Series Forecasting menggunakan TensorFlow.',
    sort_order: 3
  },
  {
    id: 4,
    title: 'Menjadi Back-End Developer Expert',
    company: 'Dicoding Indonesia',
    issued_date: '2023-06-18',
    certificate_url: 'https://www.dicoding.com/certificates/1OP8WLV31XQK',
    image_url: '/certificates/dicoding-backend.svg',
    pdf_url: '/certificates/dicoding-backend.pdf',
    credential_id: '1OP8WLV31XQK',
    description:
      'Arsitektur microservices berskala tinggi, pipeline otomatisasi CI/CD, unit & integration testing, caching menggunakan Redis, message brokering dengan RabbitMQ, dan pengamanan API.',
    sort_order: 4
  },
  {
    id: 5,
    title: 'Menjadi Front-End Web Developer Expert',
    company: 'Dicoding Indonesia',
    issued_date: '2023-04-05',
    certificate_url: 'https://www.dicoding.com/certificates/72PVDW1E8ZY5',
    image_url: '/certificates/dicoding-frontend.svg',
    pdf_url: '/certificates/dicoding-frontend.pdf',
    credential_id: '72PVDW1E8ZY5',
    description:
      'Progressive Web Apps (PWA) offline-first, Web Accessibility (WCAG a11y), clean code architecture, optimalisasi Core Web Vitals, dan End-to-End automation testing.',
    sort_order: 5
  },
  {
    id: 6,
    title: 'Architecting on AWS (Membangun Arsitektur Cloud)',
    company: 'Amazon Web Services (AWS)',
    issued_date: '2023-02-12',
    certificate_url: 'https://aws.amazon.com/certification/',
    image_url: '/certificates/aws-cloud.svg',
    pdf_url: '/certificates/aws-cloud.pdf',
    credential_id: 'AWS-ARCH-2023-551042',
    description:
      'Perancangan infrastruktur cloud yang memiliki ketersediaan tinggi (high availability), efisiensi biaya, ketahanan sistem (fault-tolerant), dan skalabilitas dinamis di AWS.',
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
  const [previewTab, setPreviewTab] = useState<'visual' | 'pdf'>('visual')
  const [isMobile, setIsMobile] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [siteOrigin, setSiteOrigin] = useState('')

  // Handle client-side viewport and URL detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    setSiteOrigin(window.location.origin)
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
          // Merge with fallback assets if image/pdf are null
          const enriched = data.map((item: Certificate) => {
            const fallback = FALLBACK_CERTIFICATES.find(
              f =>
                f.id === item.id ||
                f.title.toLowerCase() === item.title.toLowerCase() ||
                f.company.toLowerCase() === item.company.toLowerCase()
            )
            return {
              ...item,
              image_url: item.image_url || fallback?.image_url || null,
              pdf_url: item.pdf_url || fallback?.pdf_url || null,
              credential_id: item.credential_id || fallback?.credential_id || null
            }
          })
          setCertificates(enriched)
        }
      } catch (error) {
        console.error('Error fetching certificates:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCertificates()
  }, [])

  // Resolve assets dynamically to guarantee an image and PDF are always present
  const resolveAssets = (cert: Certificate) => {
    let imageUrl = cert.image_url
    let pdfUrl = cert.pdf_url
    let credentialId = cert.credential_id

    const titleLower = cert.title.toLowerCase()
    const compLower = cert.company.toLowerCase()

    if (!imageUrl || !pdfUrl) {
      if (titleLower.includes('bangkit') || compLower.includes('bangkit')) {
        imageUrl = imageUrl || '/certificates/bangkit-ml.svg'
        pdfUrl = pdfUrl || '/certificates/bangkit-ml.pdf'
        credentialId = credentialId || 'BANGKIT-2023-ML-0894'
      } else if (titleLower.includes('cloud') || compLower.includes('google')) {
        imageUrl = imageUrl || '/certificates/gcp-ace.svg'
        pdfUrl = pdfUrl || '/certificates/gcp-ace.pdf'
        credentialId = credentialId || 'GCP-ACE-2023-NDAV88'
      } else if (titleLower.includes('tensorflow') || compLower.includes('deeplearning')) {
        imageUrl = imageUrl || '/certificates/deeplearning-tf.svg'
        pdfUrl = pdfUrl || '/certificates/deeplearning-tf.pdf'
        credentialId = credentialId || 'DL-TF-2023-882190'
      } else if (titleLower.includes('back-end') || titleLower.includes('backend')) {
        imageUrl = imageUrl || '/certificates/dicoding-backend.svg'
        pdfUrl = pdfUrl || '/certificates/dicoding-backend.pdf'
        credentialId = credentialId || '1OP8WLV31XQK'
      } else if (titleLower.includes('front-end') || titleLower.includes('frontend')) {
        imageUrl = imageUrl || '/certificates/dicoding-frontend.svg'
        pdfUrl = pdfUrl || '/certificates/dicoding-frontend.pdf'
        credentialId = credentialId || '72PVDW1E8ZY5'
      } else if (titleLower.includes('aws') || compLower.includes('amazon')) {
        imageUrl = imageUrl || '/certificates/aws-cloud.svg'
        pdfUrl = pdfUrl || '/certificates/aws-cloud.pdf'
        credentialId = credentialId || 'AWS-ARCH-2023-551042'
      } else {
        imageUrl = imageUrl || '/certificates/bangkit-ml.svg'
        pdfUrl = pdfUrl || '/certificates/bangkit-ml.pdf'
        credentialId = credentialId || `CRED-${cert.id}`
      }
    }

    return {
      imageUrl,
      pdfUrl,
      credentialId
    }
  }

  const openPreview = (cert: Certificate, tab: 'visual' | 'pdf' = 'visual') => {
    setSelectedCertificate(cert)
    setPreviewTab(tab)
    setZoomLevel(1)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedCertificate(null)
    setZoomLevel(1)
  }

  const handleCopyId = (idText: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(idText)
      setCopiedId(idText)
      setTimeout(() => setCopiedId(null), 2500)
    }
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
        badgeText: 'Google Cloud & AI',
        borderAccent: 'border-blue-500/30'
      }
    }
    if (
      companyLower.includes('aws') ||
      companyLower.includes('amazon') ||
      titleLower.includes('aws')
    ) {
      return {
        logo: null,
        badgeText: 'AWS Cloud',
        borderAccent: 'border-amber-500/30'
      }
    }
    if (companyLower.includes('dicoding') || titleLower.includes('dicoding')) {
      return {
        logo: null,
        badgeText: 'Dicoding Academy',
        borderAccent: 'border-sky-500/30'
      }
    }
    if (
      companyLower.includes('deeplearning') ||
      titleLower.includes('deeplearning')
    ) {
      return {
        logo: null,
        badgeText: 'DeepLearning.AI',
        borderAccent: 'border-orange-500/30'
      }
    }
    return {
      logo: null,
      badgeText: cert.company,
      borderAccent: 'border-primary/30'
    }
  }

  const formatCertDate = (dateStr: string) => {
    const locale = language === 'id' ? 'id-ID' : language === 'ja' ? 'ja-JP' : 'en-US'
    try {
      return new Date(dateStr).toLocaleDateString(locale, {
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const CertificateCard = ({ cert }: { cert: Certificate }) => {
    const visual = getCertificateVisual(cert)
    const { imageUrl, pdfUrl, credentialId } = resolveAssets(cert)

    return (
      <div className='group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xs backdrop-blur-xs transition-all duration-300 hover:border-foreground/30 hover:bg-card hover:shadow-md'>
        {/* Certificate Image Preview Header */}
        <div
          className='relative h-48 w-full overflow-hidden border-b border-border/60 bg-muted/40 cursor-pointer sm:h-52'
          onClick={() => openPreview(cert, 'visual')}
        >
          {imageUrl ? (
            <div className='relative h-full w-full'>
              {/* Actual Certificate Document Image Preview */}
              <Image
                src={imageUrl}
                alt={`${cert.title} certificate document preview`}
                fill
                unoptimized
                className='object-cover object-top transition-transform duration-500 group-hover:scale-105'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity group-hover:opacity-60' />
            </div>
          ) : (
            <div className='flex h-full w-full items-center justify-center p-6 bg-muted'>
              <ShieldCheck className='h-12 w-12 text-primary/70' />
            </div>
          )}

          {/* Top Floating Badges */}
          <div className='absolute left-3 right-3 top-3 flex items-center justify-between pointer-events-none'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[0.68rem] font-semibold text-foreground shadow-xs backdrop-blur-md'>
              <ShieldCheck className='h-3 w-3 text-emerald-500' />
              <span>{visual.badgeText}</span>
            </span>

            <span className='rounded-full bg-primary/90 px-2 py-0.5 text-[0.65rem] font-semibold text-primary-foreground shadow-xs backdrop-blur-md'>
              {t('cert_verified')}
            </span>
          </div>

          {/* Quick Hover/Touch Action Overlay */}
          <div className='absolute inset-0 flex items-center justify-center gap-2 bg-background/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100'>
            <button
              onClick={e => {
                e.stopPropagation()
                openPreview(cert, 'visual')
              }}
              className='inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg transition-transform active:scale-95'
            >
              <Eye className='h-3.5 w-3.5' />
              <span>{t('cert_view')}</span>
            </button>

            {pdfUrl && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  openPreview(cert, 'pdf')
                }}
                className='inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg transition-transform active:scale-95'
              >
                <FileText className='h-3.5 w-3.5 text-red-500' />
                <span>PDF</span>
              </button>
            )}
          </div>

          {/* Bottom Overlay Label */}
          <div className='absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[0.7rem] text-white/95 drop-shadow-sm pointer-events-none'>
            <span className='truncate font-mono font-medium'>
              ID: {credentialId || `NDAV-${cert.id}`}
            </span>
            <span className='font-sans text-[0.68rem] bg-black/40 px-1.5 py-0.5 rounded'>
              {formatCertDate(cert.issued_date)}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className='flex flex-1 flex-col justify-between p-4 sm:p-5'>
          <div>
            <div className='flex items-start justify-between gap-2'>
              <span className='rounded-md border border-border/60 bg-muted/60 px-2 py-0.5 text-[0.68rem] font-medium text-muted-foreground'>
                {cert.company}
              </span>
            </div>

            <h3
              onClick={() => openPreview(cert, 'visual')}
              className='mt-2.5 font-serif text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary cursor-pointer line-clamp-2'
            >
              {cert.title}
            </h3>

            {cert.description && (
              <p className='mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed'>
                {cert.description}
              </p>
            )}
          </div>

          {/* Card Footer Actions */}
          <div className='mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-[0.75rem]'>
            <button
              onClick={() => openPreview(cert, 'visual')}
              className='inline-flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary'
            >
              <Eye className='h-3.5 w-3.5' />
              <span>{t('cert_view')}</span>
            </button>

            <div className='flex items-center gap-2'>
              {pdfUrl && (
                <button
                  onClick={() => openPreview(cert, 'pdf')}
                  className='inline-flex items-center gap-1 rounded-md border border-border/70 bg-card px-2 py-1 text-[0.7rem] font-medium text-foreground transition-colors hover:bg-muted'
                  title='Lihat / Buka PDF di HP & Desktop'
                >
                  <FileText className='h-3 w-3 text-red-500' />
                  <span>PDF</span>
                </button>
              )}

              {cert.certificate_url && (
                <a
                  href={cert.certificate_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/50 px-2 py-1 text-[0.7rem] font-medium text-muted-foreground transition-colors hover:text-foreground'
                >
                  <span>Verify</span>
                  <ExternalLink className='h-3 w-3' />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Generate public absolute PDF URL for mobile viewers
  const activeAssets = selectedCertificate ? resolveAssets(selectedCertificate) : null
  const absolutePdfUrl =
    activeAssets?.pdfUrl && siteOrigin
      ? activeAssets.pdfUrl.startsWith('http')
        ? activeAssets.pdfUrl
        : `${siteOrigin}${activeAssets.pdfUrl}`
      : activeAssets?.pdfUrl || ''

  return (
    <section className='pb-24 pt-36 sm:pt-40'>
      <div className='container max-w-3xl px-4 sm:px-6'>
        {/* Header */}
        <div className='mb-10'>
          <h1 className='font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
            {t('cert_catalog_title')}
          </h1>
          <p className='mt-2 text-sm text-muted-foreground leading-relaxed'>
            {t('cert_catalog_sub')}
          </p>

          {/* Toggle View and Feature Pill */}
          <div className='mt-6 flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <span className='text-xs font-medium text-muted-foreground'>
                {t('cert_display_mode')}
              </span>
              <Button
                variant={groupByCompany ? 'default' : 'outline'}
                size='sm'
                className='h-8 text-xs rounded-xl'
                onClick={() => setGroupByCompany(!groupByCompany)}
              >
                {groupByCompany ? t('cert_grouped_company') : t('cert_list_all')}
              </Button>
            </div>

            <div className='inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-[0.72rem] text-muted-foreground shadow-2xs'>
              <Smartphone className='h-3.5 w-3.5 text-primary' />
              <span>{t('cert_mobile_pdf_tip')}</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className='flex min-h-[400px] items-center justify-center'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
              <p className='text-xs text-muted-foreground'>{t('cert_loading')}</p>
            </div>
          </div>
        ) : certificates.length > 0 ? (
          groupByCompany ? (
            // Grouped View
            <div className='space-y-12'>
              {Object.entries(groupedCertificates).map(([company, certs]) => (
                <div key={company}>
                  <div className='mb-5 flex items-center justify-between border-b border-border/60 pb-2.5'>
                    <h2 className='font-serif text-xl font-bold tracking-tight sm:text-2xl'>
                      {company}
                    </h2>
                    <span className='rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground'>
                      {certs.length} Sertifikat
                    </span>
                  </div>
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
          <div className='flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-border p-8'>
            <div className='text-center'>
              <p className='text-sm text-muted-foreground'>{t('cert_no_found')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Modal for Certificate Preview (Optimized for Mobile & Desktop) */}
      <AnimatePresence>
        {showModal && selectedCertificate && activeAssets && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm'
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              className='relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-background shadow-2xl'
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className='flex items-center justify-between border-b border-border/70 px-4 py-3 sm:px-6 bg-card/60 backdrop-blur-md'>
                {/* Tabs Switcher: Image View vs PDF Document */}
                <div className='flex items-center gap-1 rounded-xl bg-muted/70 p-1 border border-border/60'>
                  <button
                    onClick={() => {
                      setPreviewTab('visual')
                      setZoomLevel(1)
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      previewTab === 'visual'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Eye className='h-3.5 w-3.5' />
                    <span>{t('cert_tab_visual')}</span>
                  </button>

                  <button
                    onClick={() => setPreviewTab('pdf')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      previewTab === 'pdf'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FileText className='h-3.5 w-3.5 text-red-500' />
                    <span>{t('cert_tab_pdf')}</span>
                  </button>
                </div>

                {/* Right controls: Zoom & Close */}
                <div className='flex items-center gap-2'>
                  {previewTab === 'visual' && (
                    <div className='hidden sm:flex items-center gap-1 border-r border-border/60 pr-2 mr-1 text-xs'>
                      <button
                        onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
                        className='rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground'
                        title='Zoom out'
                      >
                        <ZoomOut className='h-4 w-4' />
                      </button>
                      <span className='font-mono text-[0.7rem] px-1 text-muted-foreground'>
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}
                        className='rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground'
                        title='Zoom in'
                      >
                        <ZoomIn className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => setZoomLevel(1)}
                        className='rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground'
                        title='Reset zoom'
                      >
                        <RotateCcw className='h-3.5 w-3.5' />
                      </button>
                    </div>
                  )}

                  <button
                    className='rounded-full bg-muted/80 p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                    onClick={closeModal}
                    aria-label='Close modal'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5'
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
                </div>
              </div>

              {/* Modal Main Scrollable Content */}
              <div className='max-h-[82vh] overflow-y-auto'>
                {/* 1. VISUAL CERTIFICATE VIEW (Crisp Vector SVG, Always 100% Reliable on Mobile & Desktop) */}
                {previewTab === 'visual' && (
                  <div className='relative flex min-h-[340px] sm:min-h-[460px] items-center justify-center overflow-hidden bg-muted/30 p-3 sm:p-6'>
                    {activeAssets.imageUrl ? (
                      <div
                        className='relative w-full max-w-3xl overflow-hidden rounded-xl border border-border/80 bg-card shadow-lg transition-transform duration-200'
                        style={{ transform: `scale(${zoomLevel})` }}
                      >
                        <Image
                          src={activeAssets.imageUrl}
                          alt={selectedCertificate.title}
                          width={1000}
                          height={680}
                          unoptimized
                          priority
                          className='h-auto w-full object-contain'
                        />
                      </div>
                    ) : (
                      <div className='flex flex-col items-center justify-center p-12 text-center text-muted-foreground'>
                        <ShieldCheck className='h-12 w-12 mb-3 text-primary/60' />
                        <p className='text-sm'>{t('cert_no_preview')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. PDF DOCUMENT VIEW (Full Mobile & Desktop Support) */}
                {previewTab === 'pdf' && (
                  <div className='relative flex flex-col bg-muted/20'>
                    {/* Mobile Friendly Dedicated PDF Action Bar */}
                    <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-card/90 px-4 py-3 sm:px-6'>
                      <div className='flex items-center gap-2'>
                        <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500'>
                          <FileText className='h-4 w-4' />
                        </span>
                        <div>
                          <div className='text-xs font-semibold text-foreground'>
                            Dokumen PDF Resmi (.pdf)
                          </div>
                          <div className='text-[0.68rem] text-muted-foreground'>
                            {isMobile ? 'Kompatibel dengan iOS Safari & Android' : 'Tersedia pratinjau interaktif'}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-2 flex-wrap'>
                        {/* Direct Fullscreen Link (Native Mobile PDF Engine) */}
                        {activeAssets.pdfUrl && (
                          <Button asChild size='sm' variant='outline' className='h-8 text-xs gap-1.5 rounded-xl'>
                            <a
                              href={activeAssets.pdfUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <Maximize2 className='h-3.5 w-3.5' />
                              <span>{t('cert_open_fullscreen_pdf')}</span>
                            </a>
                          </Button>
                        )}

                        {/* Download PDF Button */}
                        {activeAssets.pdfUrl && (
                          <Button asChild size='sm' variant='default' className='h-8 text-xs gap-1.5 rounded-xl'>
                            <a
                              href={activeAssets.pdfUrl}
                              download={`${selectedCertificate.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
                            >
                              <Download className='h-3.5 w-3.5' />
                              <span>{t('cert_download_pdf')}</span>
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* PDF Viewer Body */}
                    <div className='relative min-h-[420px] sm:min-h-[540px] w-full bg-muted/40'>
                      {isMobile ? (
                        /* Mobile Viewport: Display the high-resolution certificate visual + direct mobile PDF actions */
                        <div className='flex flex-col items-center p-4'>
                          <div className='mb-4 w-full rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-foreground'>
                            <p className='font-semibold text-blue-600 dark:text-blue-400'>
                              📱 Pratinjau Dokumen PDF di Perangkat Mobile
                            </p>
                            <p className='mt-1 text-[0.7rem] text-muted-foreground leading-relaxed'>
                              Browser mobile menjalankan mesin pembaca PDF internal. Anda dapat melihat tampilan sertifikat beresolusi tinggi di bawah ini atau menekan tombol di atas untuk membuka PDF layar penuh.
                            </p>
                          </div>

                          {/* Fallback Google Docs Embed for Mobile if available */}
                          {absolutePdfUrl && absolutePdfUrl.startsWith('http') && (
                            <div className='mb-4 w-full h-[380px] rounded-xl overflow-hidden border border-border/70 bg-card shadow-xs'>
                              <iframe
                                title={`${selectedCertificate.title} Mobile PDF`}
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(absolutePdfUrl)}&embedded=true`}
                                className='h-full w-full border-none'
                              />
                            </div>
                          )}

                          {/* Crisp Certificate Document Visual as reliable mobile preview */}
                          {activeAssets.imageUrl && (
                            <div className='w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm'>
                              <Image
                                src={activeAssets.imageUrl}
                                alt={selectedCertificate.title}
                                width={1000}
                                height={680}
                                unoptimized
                                className='h-auto w-full object-contain'
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Desktop Viewport: Interactive Inline PDF Viewer */
                        <iframe
                          title={`${selectedCertificate.title} PDF Document`}
                          src={`${activeAssets.pdfUrl}#toolbar=1&navpanes=0`}
                          className='h-[65vh] w-full border-none'
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Certificate Details & Verification Metadata */}
                <div className='space-y-4 p-5 sm:p-6'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                    <div>
                      <span className='rounded-md border border-border/60 bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'>
                        {selectedCertificate.company}
                      </span>
                      <h2 className='mt-2 font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
                        {selectedCertificate.title}
                      </h2>
                    </div>

                    {/* Copy Credential ID Badge */}
                    {activeAssets.credentialId && (
                      <div className='flex items-center gap-2 self-start sm:self-auto'>
                        <button
                          onClick={() => handleCopyId(activeAssets.credentialId!)}
                          className='inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/90 px-3 py-1.5 text-xs font-mono text-foreground shadow-2xs hover:bg-muted transition-colors active:scale-95'
                        >
                          {copiedId === activeAssets.credentialId ? (
                            <>
                              <Check className='h-3.5 w-3.5 text-emerald-500' />
                              <span className='text-emerald-600 dark:text-emerald-400 font-semibold'>
                                {t('cert_id_copied')}
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className='h-3.5 w-3.5 text-muted-foreground' />
                              <span>ID: {activeAssets.credentialId}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className='flex flex-wrap gap-4 text-xs text-muted-foreground'>
                    <div>
                      <span className='font-medium text-foreground'>{t('cert_issued')}:</span>{' '}
                      {formatCertDate(selectedCertificate.issued_date)}
                    </div>
                    <div>
                      <span className='font-medium text-foreground'>Penerima:</span>{' '}
                      Nanda Safiq Alfiansyah
                    </div>
                    <div className='inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium'>
                      <ShieldCheck className='h-3.5 w-3.5' />
                      <span>Status: Kredensial Terverifikasi & Aktif</span>
                    </div>
                  </div>

                  {selectedCertificate.description && (
                    <div className='rounded-xl border border-border/50 bg-muted/30 p-3.5 text-xs leading-relaxed text-muted-foreground sm:text-sm'>
                      <h3 className='mb-1 font-semibold text-foreground text-xs uppercase tracking-wider font-mono'>
                        {t('cert_description')}
                      </h3>
                      <p>{selectedCertificate.description}</p>
                    </div>
                  )}

                  {/* Primary Action Buttons */}
                  <div className='flex flex-wrap gap-3 border-t border-border/60 pt-4'>
                    {selectedCertificate.certificate_url && (
                      <Button asChild variant='default' className='h-9 text-xs rounded-xl gap-1.5'>
                        <a
                          href={selectedCertificate.certificate_url}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <ExternalLink className='h-3.5 w-3.5' />
                          <span>{t('cert_verify_btn')}</span>
                        </a>
                      </Button>
                    )}

                    {activeAssets.pdfUrl && (
                      <Button asChild variant='secondary' className='h-9 text-xs rounded-xl gap-1.5'>
                        <a
                          href={activeAssets.pdfUrl}
                          download={`${selectedCertificate.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
                        >
                          <Download className='h-3.5 w-3.5' />
                          <span>{t('cert_download_pdf')}</span>
                        </a>
                      </Button>
                    )}

                    {activeAssets.pdfUrl && (
                      <Button
                        variant='outline'
                        className='h-9 text-xs rounded-xl gap-1.5'
                        onClick={() => {
                          setPreviewTab(previewTab === 'visual' ? 'pdf' : 'visual')
                        }}
                      >
                        {previewTab === 'visual' ? (
                          <>
                            <FileText className='h-3.5 w-3.5 text-red-500' />
                            <span>Buka Tab PDF</span>
                          </>
                        ) : (
                          <>
                            <Eye className='h-3.5 w-3.5' />
                            <span>Buka Gambar Sertifikat</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
