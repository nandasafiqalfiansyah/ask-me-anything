'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { IoChevronDown } from 'react-icons/io5'

const CONTENT_PREVIEW_LENGTH = 200

type Project = {
  slug: string
  metadata: {
    title?: string
    summary?: string
    image?: string
    author?: string
    tags?: string[]
    publishedAt?: string
  }
  content: string
}

export default function CrudProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    summary: '',
    image: '',
    author: 'ndav',
    tags: '',
    publishedAt: new Date().toISOString().split('T')[0],
    content: ''
  })

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/projects')
      if (!res.ok) {
        setError(`Failed to fetch projects: ${res.statusText}`)
        setLoading(false)
        return
      }
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setProjects(data.projects || [])
      }
    } catch (err) {
      setError('Failed to fetch projects')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      summary: '',
      image: '',
      author: 'ndav',
      tags: '',
      publishedAt: new Date().toISOString().split('T')[0],
      content: ''
    })
    setIsCreating(false)
    setEditingSlug(null)
  }

  const startCreate = () => {
    resetForm()
    setIsCreating(true)
  }

  const startEdit = (project: Project) => {
    setFormData({
      slug: project.slug,
      title: project.metadata.title || '',
      summary: project.metadata.summary || '',
      image: project.metadata.image || '',
      author: project.metadata.author || 'ndav',
      tags: (project.metadata.tags || []).join(', '),
      publishedAt: project.metadata.publishedAt || new Date().toISOString().split('T')[0],
      content: project.content
    })
    setEditingSlug(project.slug)
    setIsCreating(false)
  }

  const handleCreate = async () => {
    if (!formData.slug || !formData.title) {
      setError('Slug and title are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)

      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: formData.slug,
          metadata: {
            title: formData.title,
            summary: formData.summary,
            image: formData.image,
            author: formData.author,
            tags,
            publishedAt: formData.publishedAt
          },
          content: formData.content
        })
      })

      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        await fetchProjects()
        resetForm()
      }
    } catch (err) {
      setError('Failed to create project')
    }
    setLoading(false)
  }

  const handleUpdate = async () => {
    if (!editingSlug || !formData.title) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)

      const res = await fetch('/api/v1/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: editingSlug,
          newSlug: formData.slug !== editingSlug ? formData.slug : undefined,
          metadata: {
            title: formData.title,
            summary: formData.summary,
            image: formData.image,
            author: formData.author,
            tags,
            publishedAt: formData.publishedAt
          },
          content: formData.content
        })
      })

      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        await fetchProjects()
        resetForm()
      }
    } catch (err) {
      setError('Failed to update project')
    }
    setLoading(false)
  }

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete "${slug}"?`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })

      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        await fetchProjects()
        if (editingSlug === slug) {
          resetForm()
        }
      }
    } catch (err) {
      setError('Failed to delete project')
    }
    setLoading(false)
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-end justify-between gap-3'>
        <div>
          <h3 className='title text-left text-3xl font-bold sm:text-3xl'>
            Projects
          </h3>
          <p className='mt-3 text-muted-foreground text-sm'>
            Manage your MDX projects with ease ✨
          </p>
        </div>
        {loading && (
          <span className='text-xs text-muted-foreground'>Loading…</span>
        )}
      </div>

      {error && (
        <div className='rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive'>
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingSlug) && (
        <div className='space-y-4 rounded-lg border p-4'>
          <div className='flex items-center justify-between'>
            <h4 className='font-semibold'>
              {isCreating ? 'Create New Project' : 'Edit Project'}
            </h4>
            <Button
              size='sm'
              variant='ghost'
              onClick={resetForm}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          <div className='grid gap-3'>
            <div>
              <label className='text-sm font-medium'>Slug *</label>
              <Input
                placeholder='my-awesome-project'
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                disabled={loading}
              />
              <p className='mt-1 text-xs text-muted-foreground'>
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <div>
              <label className='text-sm font-medium'>Title *</label>
              <Input
                placeholder='My Awesome Project'
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Summary</label>
              <Input
                placeholder='A brief description of the project'
                value={formData.summary}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Image</label>
              <div className='space-y-2'>
                <Input
                  placeholder='Enter URL or upload an image'
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  disabled={loading}
                />
                <div className='flex items-center gap-2'>
                  <Input
                    type='file'
                    accept='image/*'
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setLoading(true)
                        try {
                          const formData = new FormData()
                          formData.append('file', file)
                          const res = await fetch('/api/v1/projects/upload', {
                            method: 'POST',
                            body: formData
                          })
                          const data = await res.json()
                          if (data.error) {
                            setError(data.error)
                          } else {
                            setFormData(prev => ({ ...prev, image: data.url }))
                          }
                        } catch (err) {
                          setError('Failed to upload image')
                        }
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className='flex-1'
                  />
                  {formData.image && (
                    <a
                      href={formData.image}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-xs text-primary hover:underline'
                    >
                      Preview
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className='text-sm font-medium'>Author</label>
              <Input
                placeholder='ndav'
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Tags</label>
              <Input
                placeholder='Next.js, React, TypeScript'
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                disabled={loading}
              />
              <p className='mt-1 text-xs text-muted-foreground'>
                Comma-separated list
              </p>
            </div>

            <div>
              <label className='text-sm font-medium'>Published Date</label>
              <Input
                type='date'
                value={formData.publishedAt}
                onChange={e => setFormData({ ...formData, publishedAt: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Content (MDX)</label>
              <textarea
                className='min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                placeholder={`## Your MDX content here

Write your project description using Markdown...`}
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                disabled={loading}
              />
              <p className='mt-1 text-xs text-muted-foreground'>
                Use Markdown/MDX syntax. The frontmatter will be auto-generated.
              </p>
            </div>
          </div>

          <div className='flex gap-2'>
            <Button
              onClick={isCreating ? handleCreate : handleUpdate}
              disabled={loading || !formData.slug || !formData.title}
            >
              {isCreating ? 'Create Project' : 'Update Project'}
            </Button>
            <Button
              variant='secondary'
              onClick={resetForm}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!isCreating && !editingSlug && (
        <Button onClick={startCreate} disabled={loading}>
          + Create New Project
        </Button>
      )}

      {/* Projects List */}
      <div className='space-y-2'>
        {projects.map(project => (
          <Collapsible key={project.slug} className='rounded-lg border'>
            <div className='flex items-center justify-between p-3'>
              <div className='flex-1'>
                <CollapsibleTrigger className='flex w-full items-center gap-2 text-left hover:opacity-70'>
                  <IoChevronDown className='h-4 w-4 transition-transform duration-200' />
                  <div>
                    <p className='font-semibold'>{project.metadata.title}</p>
                    <p className='text-xs text-muted-foreground'>
                      {project.slug} • {project.metadata.publishedAt}
                    </p>
                  </div>
                </CollapsibleTrigger>
              </div>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={() => startEdit(project)}
                  disabled={loading}
                >
                  Edit
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  onClick={() => handleDelete(project.slug)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </div>
            </div>
            
            <CollapsibleContent>
              <div className='border-t p-3 space-y-2'>
                {project.metadata.summary && (
                  <p className='text-sm text-muted-foreground'>
                    {project.metadata.summary}
                  </p>
                )}
                {project.metadata.tags && project.metadata.tags.length > 0 && (
                  <div className='flex flex-wrap gap-1'>
                    {project.metadata.tags.map(tag => (
                      <Badge key={tag} variant='secondary' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className='mt-2 rounded bg-muted p-2 text-xs font-mono'>
                  <div className='max-h-40 overflow-y-auto'>
                    {project.content.substring(0, CONTENT_PREVIEW_LENGTH)}
                    {project.content.length > CONTENT_PREVIEW_LENGTH && '...'}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}
