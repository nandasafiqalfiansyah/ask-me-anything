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

type Experience = {
  id: number
  title: string
  summary: string
  published_at: string
  logo_url: string | null
  link: string | null
  description: string | null
  sort_order: number
}

type ExperienceFormData = {
  title: string
  summary: string
  published_at: string
  logo_url: string
  link: string
  description: string
}

const initialFormData: ExperienceFormData = {
  title: '',
  summary: '',
  published_at: '',
  logo_url: '',
  link: '',
  description: ''
}

function SortableExperienceItem({
  experience,
  onEdit,
  onDelete,
  loading
}: {
  experience: Experience
  onEdit: (exp: Experience) => void
  onDelete: (id: number) => void
  loading: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: experience.id })

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

      {experience.logo_url && (
        <img
          src={experience.logo_url}
          alt={`${experience.title} logo`}
          className='h-12 w-12 flex-shrink-0 rounded object-contain'
        />
      )}

      <div className='flex-1 min-w-0'>
        <div className='font-semibold truncate'>{experience.title}</div>
        <div className='text-sm text-muted-foreground truncate'>
          {experience.summary}
        </div>
        <div className='text-xs text-muted-foreground'>
          {new Date(experience.published_at).toLocaleDateString()}
        </div>
      </div>

      <div className='flex gap-2 flex-shrink-0'>
        <Button
          size='sm'
          variant='secondary'
          onClick={() => onEdit(experience)}
          disabled={loading}
        >
          Edit
        </Button>
        <Button
          size='sm'
          variant='destructive'
          onClick={() => onDelete(experience.id)}
          disabled={loading}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

export default function CrudExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ExperienceFormData>(initialFormData)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const fetchExperiences = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) setError(error.message)
    if (data) setExperiences(data as Experience[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchExperiences()
  }, [fetchExperiences])

  const uploadLogo = async (file: File): Promise<string | null> => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).')
      return null
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.')
      return null
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `logos/${fileName}`

    setUploading(true)
    const { error: uploadError } = await supabase.storage
      .from('experience-logos')
      .upload(filePath, file)

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`)
      setUploading(false)
      return null
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from('experience-logos').getPublicUrl(filePath)

    setUploading(false)
    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.summary.trim()) return

    setLoading(true)
    setError(null)

    let logoUrl = formData.logo_url

    if (logoFile) {
      const uploadedUrl = await uploadLogo(logoFile)
      if (uploadedUrl) {
        logoUrl = uploadedUrl
      }
    }

    const experienceData = {
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      published_at: formData.published_at,
      logo_url: logoUrl || null,
      link: formData.link.trim() || null,
      description: formData.description.trim() || null
    }

    if (editingId) {
      const { error } = await supabase
        .from('experiences')
        .update({ ...experienceData, updated_at: new Date().toISOString() })
        .eq('id', editingId)

      if (error) {
        setError(error.message)
      } else {
        setEditingId(null)
        setFormData(initialFormData)
        setLogoFile(null)
        await fetchExperiences()
      }
    } else {
      const maxSortOrder =
        experiences.length > 0
          ? Math.max(...experiences.map(e => e.sort_order))
          : -1

      const { error } = await supabase.from('experiences').insert({
        ...experienceData,
        sort_order: maxSortOrder + 1
      })

      if (error) {
        setError(error.message)
      } else {
        setFormData(initialFormData)
        setLogoFile(null)
        await fetchExperiences()
      }
    }

    setLoading(false)
  }

  const handleEdit = (exp: Experience) => {
    setEditingId(exp.id)
    setFormData({
      title: exp.title,
      summary: exp.summary,
      published_at: exp.published_at,
      logo_url: exp.logo_url || '',
      link: exp.link || '',
      description: exp.description || ''
    })
    setLogoFile(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this experience?')) return

    setLoading(true)
    setError(null)

    const { error } = await supabase.from('experiences').delete().eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      await fetchExperiences()
    }

    setLoading(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData(initialFormData)
    setLogoFile(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = experiences.findIndex(e => e.id === active.id)
      const newIndex = experiences.findIndex(e => e.id === over.id)

      const newExperiences = arrayMove(experiences, oldIndex, newIndex)
      setExperiences(newExperiences)

      // Update sort_order in database using Promise.all for parallel updates
      setLoading(true)
      const updates = newExperiences.map((exp, index) =>
        supabase
          .from('experiences')
          .update({ sort_order: index })
          .eq('id', exp.id)
      )

      await Promise.all(updates)

      setLoading(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-end justify-between gap-3'>
        <div>
          <h3 className='title text-left text-2xl font-bold sm:text-3xl'>
            Experience
          </h3>
          <p className='mt-3 text-sm text-muted-foreground'>
            Kelola experience dengan drag & drop untuk mengatur urutan ✨
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
          {editingId ? 'Edit Experience' : 'Add New Experience'}
        </h4>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label className='mb-1 block text-sm font-medium'>Title *</label>
            <Input
              placeholder='Company/Organization name'
              value={formData.title}
              onChange={e =>
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>Summary *</label>
            <Input
              placeholder='Job title/role'
              value={formData.summary}
              onChange={e =>
                setFormData(prev => ({ ...prev, summary: e.target.value }))
              }
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Published Date *
            </label>
            <Input
              type='date'
              value={formData.published_at}
              onChange={e =>
                setFormData(prev => ({ ...prev, published_at: e.target.value }))
              }
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>Link</label>
            <Input
              placeholder='https://linkedin.com/company/...'
              value={formData.link}
              onChange={e =>
                setFormData(prev => ({ ...prev, link: e.target.value }))
              }
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <DragDropImageUpload
            onImageSelect={file => {
              setLogoFile(file)
              setFormData(prev => ({ ...prev, logo_url: '' }))
            }}
            currentImageUrl={formData.logo_url}
            disabled={loading}
          />
          <p className='mt-1 text-xs text-muted-foreground'>
            Max 1 image. Drag and drop or click to upload.
          </p>
        </div>

        <div>
          <label className='mb-1 block text-sm font-medium'>Description</label>
          <Textarea
            placeholder='Job description (supports markdown)...'
            value={formData.description}
            onChange={e =>
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
            disabled={loading}
            rows={4}
          />
        </div>

        <div className='flex gap-2'>
          <Button
            type='submit'
            disabled={
              loading ||
              uploading ||
              !formData.title.trim() ||
              !formData.summary.trim()
            }
          >
            {editingId ? 'Update' : 'Add'} Experience
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

      {/* List with Drag and Drop */}
      <div className='space-y-2'>
        <h4 className='font-semibold'>Experience List (Drag to reorder)</h4>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={experiences.map(e => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-2'>
              {experiences.map(experience => (
                <SortableExperienceItem
                  key={experience.id}
                  experience={experience}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={loading}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {experiences.length === 0 && !loading && (
          <p className='py-4 text-center text-sm text-muted-foreground'>
            No experiences yet. Add one above!
          </p>
        )}
      </div>
    </div>
  )
}
