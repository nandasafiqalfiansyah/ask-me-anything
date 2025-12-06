'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

type Education = {
  id: number
  title: string
  summary: string
  published_at: string
  logo_url: string | null
  link: string | null
  description: string | null
  sort_order: number
}

type EducationFormData = {
  title: string
  summary: string
  published_at: string
  logo_url: string
  link: string
  description: string
}

const initialFormData: EducationFormData = {
  title: '',
  summary: '',
  published_at: '',
  logo_url: '',
  link: '',
  description: ''
}

function SortableEducationItem({
  education,
  onEdit,
  onDelete,
  loading
}: {
  education: Education
  onEdit: (edu: Education) => void
  onDelete: (id: number) => void
  loading: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: education.id })

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

      {education.logo_url && (
        <img
          src={education.logo_url}
          alt={`${education.title} logo`}
          className='h-12 w-12 flex-shrink-0 rounded object-contain'
        />
      )}

      <div className='flex-1 min-w-0'>
        <div className='font-semibold truncate'>{education.title}</div>
        <div className='text-sm text-muted-foreground truncate'>
          {education.summary}
        </div>
        <div className='text-xs text-muted-foreground'>
          {new Date(education.published_at).toLocaleDateString()}
        </div>
      </div>

      <div className='flex gap-2 flex-shrink-0'>
        <Button
          size='sm'
          variant='secondary'
          onClick={() => onEdit(education)}
          disabled={loading}
        >
          Edit
        </Button>
        <Button
          size='sm'
          variant='destructive'
          onClick={() => onDelete(education.id)}
          disabled={loading}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

export default function CrudEducation() {
  const [education, setEducation] = useState<Education[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<EducationFormData>(initialFormData)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const fetchEducation = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) setError(error.message)
    if (data) setEducation(data as Education[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEducation()
  }, [fetchEducation])

  const uploadLogo = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `logos/${fileName}`

    setUploading(true)
    const { error: uploadError } = await supabase.storage
      .from('education-logos')
      .upload(filePath, file)

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`)
      setUploading(false)
      return null
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from('education-logos').getPublicUrl(filePath)

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

    const educationData = {
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      published_at: formData.published_at,
      logo_url: logoUrl || null,
      link: formData.link.trim() || null,
      description: formData.description.trim() || null
    }

    if (editingId) {
      const { error } = await supabase
        .from('education')
        .update({ ...educationData, updated_at: new Date().toISOString() })
        .eq('id', editingId)

      if (error) {
        setError(error.message)
      } else {
        setEditingId(null)
        setFormData(initialFormData)
        setLogoFile(null)
        await fetchEducation()
      }
    } else {
      const maxSortOrder =
        education.length > 0
          ? Math.max(...education.map(e => e.sort_order))
          : -1

      const { error } = await supabase.from('education').insert({
        ...educationData,
        sort_order: maxSortOrder + 1
      })

      if (error) {
        setError(error.message)
      } else {
        setFormData(initialFormData)
        setLogoFile(null)
        await fetchEducation()
      }
    }

    setLoading(false)
  }

  const handleEdit = (edu: Education) => {
    setEditingId(edu.id)
    setFormData({
      title: edu.title,
      summary: edu.summary,
      published_at: edu.published_at,
      logo_url: edu.logo_url || '',
      link: edu.link || '',
      description: edu.description || ''
    })
    setLogoFile(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return

    setLoading(true)
    setError(null)

    const { error } = await supabase.from('education').delete().eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      await fetchEducation()
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
      const oldIndex = education.findIndex(e => e.id === active.id)
      const newIndex = education.findIndex(e => e.id === over.id)

      const newEducation = arrayMove(education, oldIndex, newIndex)
      setEducation(newEducation)

      // Update sort_order in database using Promise.all for parallel updates
      setLoading(true)
      const updates = newEducation.map((edu, index) =>
        supabase
          .from('education')
          .update({ sort_order: index })
          .eq('id', edu.id)
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
            Education
          </h3>
          <p className='mt-3 text-sm text-muted-foreground'>
            Kelola education dengan drag & drop untuk mengatur urutan ✨
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
          {editingId ? 'Edit Education' : 'Add New Education'}
        </h4>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label className='mb-1 block text-sm font-medium'>Institution *</label>
            <Input
              placeholder='University/School name'
              value={formData.title}
              onChange={e =>
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>Program *</label>
            <Input
              placeholder='Degree/Program name'
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
              Date *
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
              placeholder='https://university.edu/...'
              value={formData.link}
              onChange={e =>
                setFormData(prev => ({ ...prev, link: e.target.value }))
              }
              disabled={loading}
            />
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label className='mb-1 block text-sm font-medium'>Logo URL</label>
            <Input
              placeholder='https://example.com/logo.png'
              value={formData.logo_url}
              onChange={e =>
                setFormData(prev => ({ ...prev, logo_url: e.target.value }))
              }
              disabled={loading || !!logoFile}
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Or Upload Logo
            </label>
            <Input
              type='file'
              accept='image/*'
              onChange={e => {
                const file = e.target.files?.[0] || null
                setLogoFile(file)
                if (file) {
                  setFormData(prev => ({ ...prev, logo_url: '' }))
                }
              }}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className='mb-1 block text-sm font-medium'>Description</label>
          <Textarea
            placeholder='Achievements, courses, etc. (supports markdown)...'
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
            {editingId ? 'Update' : 'Add'} Education
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
        <h4 className='font-semibold'>Education List (Drag to reorder)</h4>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={education.map(e => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-2'>
              {education.map(edu => (
                <SortableEducationItem
                  key={edu.id}
                  education={edu}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={loading}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {education.length === 0 && !loading && (
          <p className='py-4 text-center text-sm text-muted-foreground'>
            No education entries yet. Add one above!
          </p>
        )}
      </div>
    </div>
  )
}
