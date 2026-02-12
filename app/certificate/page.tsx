'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '../../lib/supabaseClient'
import { Button } from '@/components/ui/button'

type Certificate = {
  id: number
  title: string
  company: string
  issued_date: string
  certificate_url: string | null
  image_url: string | null
  pdf_url: string | null
  description: string | null
  sort_order: number
}

export default function CertificateCatalog() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [groupByCompany, setGroupByCompany] = useState(true)

  useEffect(() => {
    async function loadCertificates() {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .order('sort_order', { ascending: true })

        if (error) throw error

        setCertificates(data || [])
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

  // Group certificates by company
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

  const CertificateCard = ({ cert }: { cert: Certificate }) => (
    <div
      className='group relative cursor-pointer overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:scale-105 hover:shadow-lg'
      onClick={() => openPreview(cert)}
    >
      {/* Certificate Image/Preview */}
      <div className='relative h-48 w-full overflow-hidden bg-muted'>
        {cert.image_url ? (
          <Image
            src={cert.image_url}
            alt={cert.title}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-110'
            unoptimized
          />
        ) : cert.pdf_url ? (
          <div className='flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-16 w-16 text-primary/50'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
              />
            </svg>
          </div>
        ) : (
          <div className='flex h-full items-center justify-center bg-gradient-to-br from-muted to-background'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-16 w-16 text-muted-foreground/30'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
        )}

        {/* Overlay with View indicator */}
        <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          <span className='font-medium text-white'>Click to Preview</span>
        </div>
      </div>

      {/* Certificate Info */}
      <div className='p-4'>
        <h3 className='mb-1 line-clamp-2 text-lg font-semibold'>
          {cert.title}
        </h3>
        <p className='mb-2 text-sm text-muted-foreground'>{cert.company}</p>
        <p className='text-xs text-muted-foreground'>
          Issued:{' '}
          {new Date(cert.issued_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        {cert.description && (
          <p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>
            {cert.description}
          </p>
        )}
      </div>

      {/* Badge for file type */}
      <div className='absolute right-2 top-2 flex gap-1'>
        {cert.pdf_url && (
          <span className='rounded-full bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground'>
            PDF
          </span>
        )}
        {cert.image_url && (
          <span className='rounded-full bg-green-500/90 px-2 py-1 text-xs font-medium text-white'>
            IMG
          </span>
        )}
      </div>
    </div>
  )

  return (
    <section className='pb-24 pt-40'>
      <div className='container max-w-3xl'>
        {/* Header */}
        <div className='mb-12'>
          <h1 className='title mb-4 text-4xl font-bold'>My Certificates</h1>
          <p className='mb-6 text-muted-foreground'>
            A collection of professional certificates and achievements
          </p>

          {/* Toggle View */}
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium'>Group by Company:</span>
            <Button
              variant={groupByCompany ? 'default' : 'outline'}
              size='sm'
              onClick={() => setGroupByCompany(!groupByCompany)}
            >
              {groupByCompany ? 'Grouped' : 'All'}
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className='flex min-h-[400px] items-center justify-center'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary'></div>
              <p className='text-muted-foreground'>Loading certificates...</p>
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
                  <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    {certs.map(cert => (
                      <CertificateCard key={cert.id} cert={cert} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // All Certificates View
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {certificates.map(cert => (
                <CertificateCard key={cert.id} cert={cert} />
              ))}
            </div>
          )
        ) : (
          <div className='flex min-h-[400px] items-center justify-center'>
            <div className='text-center'>
              <p className='mb-2 text-lg text-muted-foreground'>
                No certificates found
              </p>
              <p className='text-sm text-muted-foreground'>
                Check back later for updates!
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
              <div className='relative bg-muted min-h-[400px] max-h-[60vh]'>
                {selectedCertificate.image_url ? (
                  <Image
                    src={selectedCertificate.image_url}
                    alt={selectedCertificate.title}
                    fill
                    className='object-contain'
                    unoptimized
                  />
                ) : selectedCertificate.pdf_url ? (
                  <div className='flex min-h-[400px] items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5'>
                    <div className='text-center'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='mx-auto mb-4 h-24 w-24 text-primary/50'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                        />
                      </svg>
                      <p className='mb-4 text-muted-foreground'>
                        PDF Certificate
                      </p>
                      <Button asChild>
                        <a
                          href={selectedCertificate.pdf_url}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          Open PDF in New Tab
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='flex min-h-[400px] items-center justify-center'>
                    <p className='text-muted-foreground'>
                      No preview available
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
                    <span className='font-medium'>Issued:</span>{' '}
                    {new Date(
                      selectedCertificate.issued_date
                    ).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {selectedCertificate.description && (
                  <div>
                    <h3 className='mb-2 font-semibold'>Description</h3>
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
                        Verify Certificate
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
                        View PDF
                      </a>
                    </Button>
                  )}
                  {selectedCertificate.image_url && (
                    <Button asChild variant='secondary'>
                      <a
                        href={selectedCertificate.image_url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        View Full Image
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
