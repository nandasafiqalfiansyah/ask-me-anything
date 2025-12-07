'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import DragDropImageUpload from '@/components/drag-drop-image-upload'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

type CertificateFormData = {
  title: string
  company: string
  issued_date: string
  certificate_url: string
  image_url: string
  pdf_url: string
  description: string
}

const initialFormData: CertificateFormData = {
  title: '',
  company: '',
  issued_date: '',
  certificate_url: '',
  image_url: '',
  pdf_url: '',
  description: ''
}

function SortableCertificateItem({
  certificate,
  onEdit,
  onDelete,
  loading
}: {
  certificate: Certificate
  onEdit: (cert: Certificate) => void
  onDelete: (id: number) => void
  loading: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: certificate.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='flex items-center gap-3 rounded-lg border bg-background p-3'
    >
      <div
        {...attributes}
        {...listeners}
        className='cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <circle cx='9' cy='5' r='1' />
          <circle cx='9' cy='12' r='1' />
          <circle cx='9' cy='19' r='1' />
          <circle cx='15' cy='5' r='1' />
          <circle cx='15' cy='12' r='1' />
          <circle cx='15' cy='19' r='1' />
        </svg>
      </div>

      {certificate.image_url && (
        <img
          src={certificate.image_url}
          alt={`${certificate.title} certificate`}
          className='h-12 w-12 flex-shrink-0 rounded object-cover'
        />
      )}

      <div className='flex-1 min-w-0'>
        <div className='font-semibold truncate'>{certificate.title}</div>
        <div className='text-sm text-muted-foreground truncate'>
          {certificate.company}
        </div>
        <div className='text-xs text-muted-foreground'>
          {new Date(certificate.issued_date).toLocaleDateString()}
        </div>
      </div>

      <div className='flex gap-2 flex-shrink-0'>
        <Button
          size='sm'
          variant='secondary'
          onClick={() => onEdit(certificate)}
          disabled={loading}
        >
          Edit
        </Button>
        <Button
          size='sm'
          variant='destructive'
          onClick={() => onDelete(certificate.id)}
          disabled={loading}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

export default function CrudCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CertificateFormData>(initialFormData)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [groupByCompany, setGroupByCompany] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const fetchCertificates = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) setError(error.message)
    if (data) setCertificates(data as Certificate[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCertificates()
  }, [fetchCertificates])

  const uploadImage = async (file: File): Promise<string | null> => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).')
      return null
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.')
      return null
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `certificates/${fileName}`

    setUploading(true)
    const { error: uploadError } = await supabase.storage
      .from('certificate-images')
      .upload(filePath, file)

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`)
      setUploading(false)
      return null
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from('certificate-images').getPublicUrl(filePath)

    setUploading(false)
    return publicUrl
  }

  const uploadPDF = async (file: File): Promise<string | null> => {
    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF file.')
      return null
    }

    const maxSize = 10 * 1024 * 1024 // 10MB for PDFs
    if (file.size > maxSize) {
      setError('PDF too large. Maximum size is 10MB.')
      return null
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`
    const filePath = `certificates/${fileName}`

    setUploading(true)
    const { error: uploadError } = await supabase.storage
      .from('certificate-pdfs')
      .upload(filePath, file)

    if (uploadError) {
      setError(`PDF upload failed: ${uploadError.message}`)
      setUploading(false)
      return null
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from('certificate-pdfs').getPublicUrl(filePath)

    setUploading(false)
    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.company.trim()) return

    setLoading(true)
    setError(null)

    let imageUrl = formData.image_url
    let pdfUrl = formData.pdf_url

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile)
      if (uploadedUrl) {
        imageUrl = uploadedUrl
      }
    }

    if (pdfFile) {
      const uploadedPdfUrl = await uploadPDF(pdfFile)
      if (uploadedPdfUrl) {
        pdfUrl = uploadedPdfUrl
      }
    }

    const certificateData = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      issued_date: formData.issued_date,
      certificate_url: formData.certificate_url.trim() || null,
      image_url: imageUrl || null,
      pdf_url: pdfUrl || null,
      description: formData.description.trim() || null
    }

    if (editingId) {
      const { error } = await supabase
        .from('certificates')
        .update({ ...certificateData, updated_at: new Date().toISOString() })
        .eq('id', editingId)

      if (error) {
        setError(error.message)
      } else {
        setEditingId(null)
        setFormData(initialFormData)
        setImageFile(null)
        setPdfFile(null)
        await fetchCertificates()
      }
    } else {
      const maxSortOrder =
        certificates.length > 0
          ? Math.max(...certificates.map(c => c.sort_order))
          : -1

      const { error } = await supabase.from('certificates').insert({
        ...certificateData,
        sort_order: maxSortOrder + 1
      })

      if (error) {
        setError(error.message)
      } else {
        setFormData(initialFormData)
        setImageFile(null)
        setPdfFile(null)
        await fetchCertificates()
      }
    }

    setLoading(false)
  }

  const handleEdit = (cert: Certificate) => {
    setEditingId(cert.id)
    setFormData({
      title: cert.title,
      company: cert.company,
      issued_date: cert.issued_date,
      certificate_url: cert.certificate_url || '',
      image_url: cert.image_url || '',
      pdf_url: cert.pdf_url || '',
      description: cert.description || ''
    })
    setImageFile(null)
    setPdfFile(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return

    setLoading(true)
    setError(null)

    const { error } = await supabase.from('certificates').delete().eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      await fetchCertificates()
    }

    setLoading(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData(initialFormData)
    setImageFile(null)
    setPdfFile(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = certificates.findIndex(c => c.id === active.id)
      const newIndex = certificates.findIndex(c => c.id === over.id)

      const newCertificates = arrayMove(certificates, oldIndex, newIndex)
      setCertificates(newCertificates)

      setLoading(true)
      const updates = newCertificates.map((cert, index) =>
        supabase
          .from('certificates')
          .update({ sort_order: index })
          .eq('id', cert.id)
      )

      await Promise.all(updates)
      setLoading(false)
    }
  }

  // Group certificates by company
  const groupedCertificates = certificates.reduce((acc, cert) => {
    if (!acc[cert.company]) {
      acc[cert.company] = []
    }
    acc[cert.company].push(cert)
    return acc
  }, {} as Record<string, Certificate[]>)

  return (
    <div className='space-y-6'>
      <div className='flex items-end justify-between gap-3'>
        <div>
          <h3 className='title text-left text-2xl font-bold sm:text-3xl'>
            Certificates
          </h3>
          <p className='mt-3 text-sm text-muted-foreground'>
            Manage certificates with drag & drop to reorder. Group by company (e.g., Dicoding, Coursera) ✨
          </p>
        </div>
        {(loading || uploading) && (
          <span className='text-xs text-muted-foreground'>
            {uploading ? 'Uploading...' : 'Loading…'}
          </span>
        )}
      </div>

      {error && (
        <div className='rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive'>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className='space-y-4 rounded-lg border p-4'>
        <h4 className='font-semibold'>
          {editingId ? 'Edit Certificate' : 'Add New Certificate'}
        </h4>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label className='mb-1 block text-sm font-medium'>Certificate Title *</label>
            <Input
              placeholder='e.g., Machine Learning Specialization'
              value={formData.title}
              onChange={e =>
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>Company/Issuer *</label>
            <Input
              placeholder='e.g., Dicoding, Coursera, Google'
              value={formData.company}
              onChange={e =>
                setFormData(prev => ({ ...prev, company: e.target.value }))
              }
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Issued Date *
            </label>
            <Input
              type='date'
              value={formData.issued_date}
              onChange={e =>
                setFormData(prev => ({ ...prev, issued_date: e.target.value }))
              }
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>Certificate URL</label>
            <Input
              placeholder='https://coursera.org/verify/...'
              value={formData.certificate_url}
              onChange={e =>
                setFormData(prev => ({ ...prev, certificate_url: e.target.value }))
              }
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <DragDropImageUpload
            onImageSelect={file => {
              setImageFile(file)
              setFormData(prev => ({ ...prev, image_url: '' }))
            }}
            currentImageUrl={formData.image_url}
            disabled={loading}
          />
          <p className='mt-1 text-xs text-muted-foreground'>
            Max 1 image. Drag and drop or click to upload certificate image.
          </p>
        </div>

        <div>
          <label className='mb-1 block text-sm font-medium'>Certificate PDF</label>
          <Input
            type='file'
            accept='application/pdf'
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) {
                setPdfFile(file)
                setFormData(prev => ({ ...prev, pdf_url: '' }))
              }
            }}
            disabled={loading}
          />
          {formData.pdf_url && !pdfFile && (
            <div className='mt-2 flex items-center gap-2'>
              <a
                href={formData.pdf_url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm text-primary hover:underline'
              >
                View current PDF
              </a>
            </div>
          )}
          {pdfFile && (
            <p className='mt-1 text-xs text-muted-foreground'>
              Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          <p className='mt-1 text-xs text-muted-foreground'>
            Upload PDF certificate (max 10MB). Will be automatically stored.
          </p>
        </div>

        <div>
          <label className='mb-1 block text-sm font-medium'>Description</label>
          <Textarea
            placeholder='Description or notes about the certificate...'
            value={formData.description}
            onChange={e =>
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
            disabled={loading}
            rows={3}
          />
        </div>

        <div className='flex gap-2'>
          <Button
            type='submit'
            disabled={
              loading ||
              uploading ||
              !formData.title.trim() ||
              !formData.company.trim()
            }
          >
            {editingId ? 'Update' : 'Add'} Certificate
          </Button>
          {editingId && (
            <Button
              type='button'
              variant='secondary'
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Toggle View */}
      <div className='flex items-center gap-2'>
        <label className='text-sm font-medium'>Group by Company:</label>
        <Button
          variant={groupByCompany ? 'default' : 'outline'}
          size='sm'
          onClick={() => setGroupByCompany(!groupByCompany)}
        >
          {groupByCompany ? 'Yes' : 'No'}
        </Button>
      </div>

      {/* List with Drag and Drop */}
      <div className='space-y-4'>
        <h4 className='font-semibold'>Certificate List (Drag to reorder)</h4>
        
        {groupByCompany ? (
          // Grouped view by company
          <div className='space-y-6'>
            {Object.entries(groupedCertificates).map(([company, certs]) => (
              <div key={company} className='space-y-2'>
                <h5 className='text-lg font-semibold text-primary'>{company}</h5>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={certs.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className='space-y-2'>
                      {certs.map(cert => (
                        <SortableCertificateItem
                          key={cert.id}
                          certificate={cert}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          loading={loading}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            ))}
          </div>
        ) : (
          // Ungrouped view
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={certificates.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className='space-y-2'>
                {certificates.map(cert => (
                  <SortableCertificateItem
                    key={cert.id}
                    certificate={cert}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    loading={loading}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {certificates.length === 0 && !loading && (
          <p className='py-4 text-center text-sm text-muted-foreground'>
            No certificates yet. Add one above!
          </p>
        )}
      </div>
    </div>
  )
}
