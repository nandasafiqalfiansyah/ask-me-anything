'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  FolderGit2,
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Upload,
  Calendar,
  Tag,
  User,
  X,
  FileCode2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)

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
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        toast.error(data.error)
      } else {
        setProjects(data.projects || [])
      }
    } catch {
      setError('Gagal memuat daftar proyek')
      toast.error('Gagal memuat daftar proyek')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    const q = searchQuery.toLowerCase().trim()
    return projects.filter(p => {
      const title = p.metadata.title?.toLowerCase() || ''
      const slug = p.slug.toLowerCase()
      const tags = (p.metadata.tags || []).join(' ').toLowerCase()
      return title.includes(q) || slug.includes(q) || tags.includes(q)
    })
  }, [projects, searchQuery])

  const handleCreate = async () => {
    setLoading(true)
    setError(null)
    try {
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
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            publishedAt: formData.publishedAt
          },
          content: formData.content
        })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        toast.error(data.error)
      } else {
        toast.success(`Proyek "${formData.title}" berhasil dibuat!`)
        resetForm()
        await fetchProjects()
      }
    } catch {
      setError('Gagal membuat proyek')
      toast.error('Gagal membuat proyek')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingSlug) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/projects/${editingSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: {
            title: formData.title,
            summary: formData.summary,
            image: formData.image,
            author: formData.author,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            publishedAt: formData.publishedAt
          },
          content: formData.content
        })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        toast.error(data.error)
      } else {
        toast.success(`Proyek "${formData.title}" berhasil diperbarui!`)
        resetForm()
        await fetchProjects()
      }
    } catch {
      setError('Gagal memperbarui proyek')
      toast.error('Gagal memperbarui proyek')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slug: string, title?: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus proyek "${title || slug}"?`)) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/projects/${slug}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        toast.error(data.error)
      } else {
        toast.success(`Proyek "${title || slug}" berhasil dihapus`)
        await fetchProjects()
      }
    } catch {
      setError('Gagal menghapus proyek')
      toast.error('Gagal menghapus proyek')
    } finally {
      setLoading(false)
    }
  }

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
    setEditingSlug(null)
    setIsCreating(false)
  }

  const startEdit = (project: Project) => {
    setEditingSlug(project.slug)
    setIsCreating(false)
    setFormData({
      slug: project.slug,
      title: project.metadata.title || '',
      summary: project.metadata.summary || '',
      image: project.metadata.image || '',
      author: project.metadata.author || 'ndav',
      tags: (project.metadata.tags || []).join(', '),
      publishedAt: project.metadata.publishedAt || new Date().toISOString().split('T')[0],
      content: project.content || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startCreate = () => {
    resetForm()
    setIsCreating(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h3 className='text-lg font-bold tracking-tight text-foreground sm:text-xl'>
              Manajemen Proyek Portofolio
            </h3>
            <span className='rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary'>
              {projects.length} Proyek
            </span>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Kelola artikel studi kasus, showcase aplikasi, dan konten MDX portofolio.
          </p>
        </div>

        {!isCreating && !editingSlug && (
          <Button onClick={startCreate} className='gap-1.5 rounded-xl shadow-xs text-xs font-semibold'>
            <Plus className='h-4 w-4' />
            <span>Buat Proyek Baru</span>
          </Button>
        )}
      </div>

      {error && (
        <div className='rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive'>
          {error}
        </div>
      )}

      {/* CREATE / EDIT FORM */}
      {(isCreating || editingSlug) && (
        <div className='space-y-5 rounded-3xl border border-border/80 bg-background/90 p-5 sm:p-7 shadow-sm backdrop-blur-md'>
          <div className='flex items-center justify-between border-b border-border/70 pb-4'>
            <div>
              <h4 className='text-base font-bold text-foreground sm:text-lg'>
                {isCreating ? 'Tambah Proyek Portofolio Baru' : `Edit Proyek: ${formData.title || editingSlug}`}
              </h4>
              <p className='text-xs text-muted-foreground'>
                Lengkapi metadata dan konten Markdown/MDX proyek.
              </p>
            </div>
            <Button
              size='sm'
              variant='ghost'
              onClick={resetForm}
              disabled={loading}
              className='gap-1.5 rounded-xl text-xs font-medium'
            >
              <X className='h-4 w-4' />
              <span>Batal</span>
            </Button>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            {/* Slug */}
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>Slug URL *</label>
              <Input
                placeholder='ecommerce-dashboard'
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                disabled={loading || !!editingSlug}
                className='rounded-xl text-xs font-mono'
              />
              <p className='text-[0.7rem] text-muted-foreground'>
                Format huruf kecil, angka, dan strip (contoh: project-name)
              </p>
            </div>

            {/* Title */}
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>Judul Proyek *</label>
              <Input
                placeholder='E-Commerce Modern Platform'
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
                className='rounded-xl text-xs'
              />
            </div>

            {/* Summary */}
            <div className='space-y-1.5 sm:col-span-2'>
              <label className='text-xs font-semibold text-foreground'>Ringkasan Singkat</label>
              <Input
                placeholder='Platform toko online modern dengan integrasi pembayaran otomatis dan panel analitik.'
                value={formData.summary}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                disabled={loading}
                className='rounded-xl text-xs'
              />
            </div>

            {/* Image URL & Upload */}
            <div className='space-y-1.5 sm:col-span-2'>
              <label className='text-xs font-semibold text-foreground'>Banner / Gambar Cover Proyek</label>
              <div className='grid gap-2 sm:grid-cols-[1fr_auto]'>
                <Input
                  placeholder='https://... atau upload file langsung'
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  disabled={loading}
                  className='rounded-xl text-xs'
                />
                <div className='flex items-center gap-2'>
                  <label className='flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-medium hover:bg-muted'>
                    <Upload className='h-3.5 w-3.5' />
                    <span>Upload</span>
                    <input
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setLoading(true)
                          try {
                            const data = new FormData()
                            data.append('file', file)
                            const res = await fetch('/api/v1/projects/upload', {
                              method: 'POST',
                              body: data
                            })
                            const resJson = await res.json()
                            if (resJson.error) {
                              toast.error(resJson.error)
                            } else {
                              setFormData(prev => ({ ...prev, image: resJson.url }))
                              toast.success('Gambar berhasil diunggah')
                            }
                          } catch {
                            toast.error('Gagal mengunggah gambar')
                          } finally {
                            setLoading(false)
                          }
                        }
                      }}
                      disabled={loading}
                    />
                  </label>

                  {formData.image && (
                    <a
                      href={formData.image}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-medium text-primary hover:underline'
                    >
                      <ExternalLink className='h-3.5 w-3.5' />
                      <span>Preview</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Author */}
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>Penulis (Author)</label>
              <Input
                placeholder='ndav'
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                disabled={loading}
                className='rounded-xl text-xs'
              />
            </div>

            {/* Published Date */}
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-foreground'>Tanggal Publikasi</label>
              <Input
                type='date'
                value={formData.publishedAt}
                onChange={e => setFormData({ ...formData, publishedAt: e.target.value })}
                disabled={loading}
                className='rounded-xl text-xs'
              />
            </div>

            {/* Tags */}
            <div className='space-y-1.5 sm:col-span-2'>
              <label className='text-xs font-semibold text-foreground'>Tags / Teknologi (Pisahkan koma)</label>
              <Input
                placeholder='Next.js, TypeScript, Tailwind CSS, Supabase'
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                disabled={loading}
                className='rounded-xl text-xs'
              />
            </div>

            {/* Content MDX */}
            <div className='space-y-1.5 sm:col-span-2'>
              <label className='text-xs font-semibold text-foreground'>Konten Proyek (MDX / Markdown)</label>
              <textarea
                className='min-h-[260px] w-full rounded-2xl border border-input bg-background p-3 font-mono text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                placeholder={'## Fitur Utama\n- Autentikasi aman\n- Manajemen produk\n\n## Teknologi yang Digunakan\n...'}
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className='flex items-center justify-end gap-2 border-t border-border/70 pt-4'>
            <Button
              variant='outline'
              onClick={resetForm}
              disabled={loading}
              className='rounded-xl text-xs'
            >
              Batal
            </Button>
            <Button
              onClick={isCreating ? handleCreate : handleUpdate}
              disabled={loading || !formData.slug || !formData.title}
              className='gap-1.5 rounded-xl text-xs font-semibold'
            >
              {loading && <span className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent' />}
              <span>{isCreating ? 'Simpan Proyek' : 'Perbarui Proyek'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* SEARCH BAR (when list view) */}
      {!isCreating && !editingSlug && (
        <div className='relative max-w-md'>
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Cari judul proyek, slug, atau tag teknologi...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-9 rounded-xl text-xs h-9'
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className='absolute right-3 top-2.5 text-muted-foreground hover:text-foreground'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
      )}

      {/* PROJECTS LIST */}
      {!isCreating && !editingSlug && (
        <div className='space-y-3'>
          {loading && projects.length === 0 ? (
            <div className='py-12 text-center'>
              <div className='inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
              <p className='mt-2 text-xs text-muted-foreground'>Memuat data proyek...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className='rounded-3xl border border-dashed border-border/80 p-10 text-center'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
                <FolderGit2 className='h-6 w-6 opacity-60' />
              </div>
              <h5 className='mt-3 text-sm font-semibold text-foreground'>
                {searchQuery ? 'Tidak ada proyek yang sesuai' : 'Belum Ada Proyek'}
              </h5>
              <p className='mt-1 text-xs text-muted-foreground'>
                {searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Klik tombol "Buat Proyek Baru" untuk menambahkan proyek pertama Anda.'}
              </p>
            </div>
          ) : (
            filteredProjects.map(project => {
              const isExpanded = expandedSlug === project.slug
              return (
                <div
                  key={project.slug}
                  className='rounded-2xl border border-border/80 bg-card/70 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-xs'
                >
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <div className='flex items-start gap-3.5 min-w-0 flex-1'>
                      {project.metadata.image ? (
                        <div className='relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted'>
                          <Image
                            src={project.metadata.image}
                            alt={project.metadata.title || project.slug}
                            fill
                            className='object-cover'
                            referrerPolicy='no-referrer'
                          />
                        </div>
                      ) : (
                        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                          <FolderGit2 className='h-5 w-5' />
                        </div>
                      )}

                      <div className='min-w-0 flex-1 space-y-1'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <h4 className='font-bold text-sm text-foreground tracking-tight'>
                            {project.metadata.title || project.slug}
                          </h4>
                          <span className='rounded-md bg-muted px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground'>
                            /{project.slug}
                          </span>
                        </div>

                        {project.metadata.summary && (
                          <p className='text-xs text-muted-foreground line-clamp-1'>
                            {project.metadata.summary}
                          </p>
                        )}

                        <div className='flex flex-wrap items-center gap-2 text-[0.72rem] text-muted-foreground pt-0.5'>
                          <span>{project.metadata.publishedAt}</span>
                          {project.metadata.tags && project.metadata.tags.length > 0 && (
                            <>
                              <span>•</span>
                              <div className='flex flex-wrap gap-1'>
                                {project.metadata.tags.slice(0, 4).map(t => (
                                  <span
                                    key={t}
                                    className='rounded-md bg-primary/5 px-1.5 py-0.2 text-[0.68rem] font-medium text-primary'
                                  >
                                    {t}
                                  </span>
                                ))}
                                {project.metadata.tags.length > 4 && (
                                  <span className='text-[0.68rem] text-muted-foreground'>
                                    +{project.metadata.tags.length - 4}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-1.5 self-end sm:self-center shrink-0'>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => setExpandedSlug(isExpanded ? null : project.slug)}
                        className='h-8 gap-1 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground'
                      >
                        {isExpanded ? <ChevronUp className='h-3.5 w-3.5' /> : <ChevronDown className='h-3.5 w-3.5' />}
                        <span>{isExpanded ? 'Tutup' : 'Rincian'}</span>
                      </Button>

                      <Button
                        size='sm'
                        variant='secondary'
                        onClick={() => startEdit(project)}
                        disabled={loading}
                        className='h-8 gap-1 rounded-xl text-xs font-medium'
                      >
                        <Pencil className='h-3.5 w-3.5' />
                        <span>Edit</span>
                      </Button>

                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleDelete(project.slug, project.metadata.title)}
                        disabled={loading}
                        className='h-8 w-8 p-0 rounded-xl text-red-500 hover:bg-red-500/10'
                        title='Hapus proyek'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className='mt-3 border-t border-border/70 pt-3 space-y-2 text-xs'>
                      {project.content && (
                        <div>
                          <span className='font-semibold text-muted-foreground'>Cuplikan Konten:</span>
                          <pre className='mt-1 max-h-40 overflow-y-auto rounded-xl bg-muted/40 p-3 font-mono text-[0.72rem] text-foreground'>
                            {project.content.slice(0, 400)}
                            {project.content.length > 400 && '...'}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
